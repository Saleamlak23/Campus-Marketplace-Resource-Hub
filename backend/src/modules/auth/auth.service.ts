import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../../lib/prisma';
import { config } from '../../config/env';
import { AppError } from '../../middleware/errorHandler';

export class AuthService {
  private extractUniversityDomain(email: string): string | null {
    const domain = email.split('@')[1];
    return domain ? `@${domain}` : null;
  }

  async register(data: {
    name: string;
    email: string;
    password: string;
    department?: string;
    universityIdNumber?: string;
  }) {
    console.log('[AuthService] Register started for:', data.email);

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
      console.error('[AuthService] No university found for domain:', emailDomain);
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
      },
      ...tokens,
    };
  }

  private generateTokens(userId: string, universityId: string, role: string) {
    const accessToken = jwt.sign(
      { userId, universityId, role },
      config.jwt.accessSecret,
      { expiresIn: config.jwt.accessExpiry } as jwt.SignOptions
    );

    const refreshToken = jwt.sign(
      { userId, universityId, role },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiry } as jwt.SignOptions
    );

    return { accessToken, refreshToken };
  }

  async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as {
        userId: string;
        universityId: string;
        role: string;
      };

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      const tokens = this.generateTokens(user.id, user.universityId, user.role);
      return tokens;
    } catch (error) {
      throw new AppError('Invalid refresh token', 401);
    }
  }
}