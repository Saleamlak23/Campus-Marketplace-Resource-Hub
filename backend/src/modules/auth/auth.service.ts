import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../../lib/prisma';
import { config } from '../../config/env';
import { AppError } from '../../middleware/errorHandler';
import { sendVerificationEmail, generateVerificationToken } from '../../lib/email';

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
        isVerified: false,
      },
    });

    // Generate and store verification token
    const verificationToken = generateVerificationToken();
    await prisma.verificationToken.create({
      data: {
        token: verificationToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    // Send verification email (skip if no email config)
    try {
      await sendVerificationEmail(user.email, verificationToken, user.name);
    } catch (error) {
      console.warn('[AuthService] Email not sent, but user created:', error);
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

      if (user.isBanned) {
        throw new AppError('User is banned', 403);
      }

      const tokens = this.generateTokens(user.id, user.universityId, user.role);
      return tokens;
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

  async resendVerificationEmail(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.isVerified) {
      throw new AppError('Email already verified', 400);
    }

    const verificationToken = generateVerificationToken();
    await prisma.verificationToken.create({
      data: {
        token: verificationToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    await sendVerificationEmail(user.email, verificationToken, user.name);

    return { message: 'Verification email sent' };
  }

  async requestPasswordReset(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { message: 'If an account exists, a reset link has been sent' };
    }

    const resetToken = jwt.sign(
      { userId: user.id },
      config.jwt.accessSecret,
      { expiresIn: '1h' } as jwt.SignOptions
    );

    // TODO: Send reset email
    console.log(`🔑 Password reset token for ${user.email}: ${resetToken}`);

    return { message: 'Password reset link sent' };
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const decoded = jwt.verify(token, config.jwt.accessSecret) as {
        userId: string;
      };

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: { id: decoded.userId },
        data: { passwordHash: hashedPassword },
      });

      return { message: 'Password reset successful' };
    } catch (error) {
      throw new AppError('Invalid or expired reset token', 400);
    }
  }
}