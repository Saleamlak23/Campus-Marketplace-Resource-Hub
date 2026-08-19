import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../../lib/prisma';
import { config } from '../../config/env';
import { AppError } from '../../middleware/errorHandler';

export class AuthService {
  private extractUniversityDomain(email: string): string | null {
    const domain = email.split('@')[1];
    return domain ? '@' + domain : null;
  }

  private generateTokens(userId: string, universityId: string, role: string) {
    // Fix: Ensure secrets exist
    const accessSecret = config.jwt.accessSecret;
    const refreshSecret = config.jwt.refreshSecret;

    if (!accessSecret || !refreshSecret) {
      throw new Error('JWT secrets not configured');
    }

    const accessToken = jwt.sign(
      { userId, universityId, role },
      accessSecret,
      { expiresIn: config.jwt.accessExpiry } as jwt.SignOptions
    );

    const refreshToken = jwt.sign(
      { userId, universityId, role },
      refreshSecret,
      { expiresIn: config.jwt.refreshExpiry } as jwt.SignOptions
    );

    return { accessToken, refreshToken };
  }

  async register(data: {
    name: string;
    email: string;
    password: string;
    department?: string;
    universityIdNumber?: string;
  }) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError('User already exists', 400);
    }

    const emailDomain = this.extractUniversityDomain(data.email);
    if (!emailDomain) {
      throw new AppError('Invalid email format', 400);
    }

    const university = await prisma.university.findFirst({
      where: {
        allowedEmailDomains: {
          has: emailDomain,
        },
      },
    });

    if (!university) {
      throw new AppError('University not found for this email domain', 400);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: hashedPassword,
        department: data.department,
        universityIdNumber: data.universityIdNumber,
        universityId: university.id,
        role: 'STUDENT',
        isVerified: false,
      },
    });

    const verificationToken = crypto.randomBytes(32).toString('hex');
    await prisma.verificationToken.create({
      data: {
        token: verificationToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    const tokens = this.generateTokens(user.id, user.universityId, user.role);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        universityId: user.universityId,
        isVerified: user.isVerified,
      },
      ...tokens,
    };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    if (user.isBanned) {
      throw new AppError('User is banned', 403);
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new AppError('Invalid email or password', 401);
    }

    const tokens = this.generateTokens(user.id, user.universityId, user.role);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        universityId: user.universityId,
        isVerified: user.isVerified,
      },
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const secret = config.jwt.refreshSecret;
      if (!secret) {
        throw new Error('JWT refresh secret not configured');
      }

      // Fix: Use 'as any' to handle the type issue
      const decoded = jwt.verify(refreshToken, secret) as any;

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      if (user.isBanned) {
        throw new AppError('User is banned', 403);
      }

      return this.generateTokens(user.id, user.universityId, user.role);
    } catch (error) {
      throw new AppError('Invalid refresh token', 401);
    }
  }

  async verifyEmail(token: string) {
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verificationToken) {
      throw new AppError('Invalid verification token', 400);
    }

    if (verificationToken.expiresAt < new Date()) {
      throw new AppError('Verification token has expired', 400);
    }

    await prisma.user.update({
      where: { id: verificationToken.userId },
      data: { isVerified: true },
    });

    await prisma.verificationToken.delete({
      where: { id: verificationToken.id },
    });

    return { message: 'Email verified successfully' };
  }
}