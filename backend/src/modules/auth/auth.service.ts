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
    universityIdNumber: string;
  }) {
    console.log('[AuthService] Register started for:', data.email);

    // 1. Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError('User already exists', 400);
    }

    if (!data.email.toLowerCase().endsWith('@aau.edu.et')) {
      throw new AppError(
        'Signups are currently restricted to Addis Ababa University students (@aau.edu.et).',
        400,
      );
    }

    // 2. Extract university domain
    const emailDomain = this.extractUniversityDomain(data.email);
    if (!emailDomain) {
      throw new AppError('Invalid email format', 400);
    }

    // 3. Find university by domain
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

    // 4. Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // 5. Create user
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: hashedPassword,
        department: data.department,
        universityIdNumber: data.universityIdNumber,
        universityId: university.id,
        role: 'STUDENT',
        isVerified: false, // Add this field to your User model
      },
    });

    // 6. Generate verification token
    const verificationToken = generateVerificationToken();

    // 7. Store verification token (you may want to create a separate table for this)
    // For now, we'll store it in a verification_tokens table
    await prisma.verificationToken.create({
      data: {
        token: verificationToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    // 8. Send verification email
    await sendVerificationEmail(user.email, verificationToken, user.name);

    // 9. Generate JWT tokens
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
    // 1. Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // 2. Check if user is banned
    if (user.isBanned) {
      throw new AppError('User is banned', 403);
    }

    // 3. Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new AppError('Invalid email or password', 401);
    }

    // 4. Generate tokens
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
    // 1. Find verification token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verificationToken) {
      throw new AppError('Invalid verification token', 400);
    }

    // 2. Check if token expired
    if (verificationToken.expiresAt < new Date()) {
      throw new AppError('Verification token has expired', 400);
    }

    // 3. Update user as verified
    await prisma.user.update({
      where: { id: verificationToken.userId },
      data: { isVerified: true },
    });

    // 4. Delete used token
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id },
    });

    return { success: true, message: 'Email verified successfully' };
  }

  async resendVerificationEmail(email: string) {
    // 1. Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.isVerified) {
      throw new AppError('Email already verified', 400);
    }

    // 2. Generate new verification token
    const verificationToken = generateVerificationToken();

    // 3. Store new token
    await prisma.verificationToken.create({
      data: {
        token: verificationToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    // 4. Send verification email
    await sendVerificationEmail(user.email, verificationToken, user.name);

    return { success: true, message: 'Verification email sent' };
  }

  async requestPasswordReset(email: string) {
    // 1. Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      return { success: true, message: 'If an account exists, a reset link has been sent' };
    }

    // 2. Generate reset token
    const resetToken = jwt.sign(
      { userId: user.id },
      config.jwt.accessSecret,
      { expiresIn: '1h' } as jwt.SignOptions
    );

    // 3. Send reset email (implementation needed)
    console.log(`🔑 Password reset token for ${user.email}: ${resetToken}`);

    return { success: true, message: 'Password reset link sent' };
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      // 1. Verify token
      const decoded = jwt.verify(token, config.jwt.accessSecret) as {
        userId: string;
      };

      // 2. Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // 3. Update user password
      await prisma.user.update({
        where: { id: decoded.userId },
        data: { passwordHash: hashedPassword },
      });

      return { success: true, message: 'Password reset successful' };
    } catch (error) {
      throw new AppError('Invalid or expired reset token', 400);
    }
  }
}
