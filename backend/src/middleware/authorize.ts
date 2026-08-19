import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

// Define role hierarchy
const roleHierarchy: Record<string, number> = {
  STUDENT: 1,
  UNIVERSITY_ADMIN: 2,
  SUPER_ADMIN: 3,
};

export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. Check if user exists on request (authenticated)
      if (!req.user) {
        throw new AppError('Not authenticated', 401);
      }

      // 2. Check if user has required role
      const userRole = req.user.role;
      const hasRequiredRole = allowedRoles.some(role => {
        // Allow if role matches exactly
        if (role === userRole) return true;
        
        // Allow if SUPER_ADMIN (has access to everything)
        if (userRole === 'SUPER_ADMIN') return true;
        
        // Check role hierarchy
        const userLevel = roleHierarchy[userRole] || 0;
        const requiredLevel = roleHierarchy[role] || 0;
        return userLevel >= requiredLevel;
      });

      if (!hasRequiredRole) {
        throw new AppError(
          `Access denied. Required roles: ${allowedRoles.join(', ')}`,
          403
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Convenience middleware for common role checks
export const isAdmin = authorize('UNIVERSITY_ADMIN', 'SUPER_ADMIN');
export const isSuperAdmin = authorize('SUPER_ADMIN');
export const isStudent = authorize('STUDENT', 'UNIVERSITY_ADMIN', 'SUPER_ADMIN');