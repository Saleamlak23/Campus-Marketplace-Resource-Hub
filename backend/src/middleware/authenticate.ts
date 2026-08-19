import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { AppError } from './errorHandler';

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

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new AppError('Invalid token format. Use: Bearer <token>', 401);
    }

    // Fix: Ensure secret exists
    const secret = config.jwt.accessSecret;
    if (!secret) {
      throw new AppError('JWT secret not configured', 500);
    }

    // Fix: Use 'as any' to handle the type issue
    const decoded = jwt.verify(token, secret) as any;

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