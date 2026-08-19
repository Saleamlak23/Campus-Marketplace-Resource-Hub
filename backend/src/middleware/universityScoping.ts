import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

export const scopeByUniversity = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const universityParam = req.params.universityId;
    if (universityParam && universityParam !== req.user.universityId) {
      if (req.user.role !== 'SUPER_ADMIN') {
        throw new AppError('Access denied: Cannot access other universities', 403);
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};