import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { AppError } from './errorHandler';
import prisma from '../lib/prisma';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        universityId: string;
        role: string;
      };
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new AppError('No token provided', 401);
    }

    // 2. Extract token (Bearer <token>)
    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new AppError('Invalid token format. Use: Bearer <token>', 401);
    }

    // 3. Verify token
    const decoded = jwt.verify(token, config.jwt.accessSecret) as {
      userId: string;
      universityId: string;
      role: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { isBanned: true },
    });

    if (!user || user.isBanned) {
      throw new AppError(user?.isBanned ? 'Your account has been banned' : 'User not found', 401);
    }

    // 4. Attach user to request
    req.user = {
      userId: decoded.userId,
      universityId: decoded.universityId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid token', 401));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new AppError('Token expired', 401));
    } else {
      next(error);
    }
  }
};