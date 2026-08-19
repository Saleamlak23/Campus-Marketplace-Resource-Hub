import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401);
      }

      const userRole = req.user.role;
      const hasRequiredRole = allowedRoles.some(role => userRole === role || userRole === 'SUPER_ADMIN');

      if (!hasRequiredRole) {
        throw new AppError('Access denied', 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const isAdmin = authorize('UNIVERSITY_ADMIN', 'SUPER_ADMIN');
export const isSuperAdmin = authorize('SUPER_ADMIN');