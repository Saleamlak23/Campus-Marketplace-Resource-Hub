import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

// Ensure user can only access their own university data
export const scopeByUniversity = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    // Add universityId to query params for filtering
    // This will be used by services to filter data
    req.query.universityId = req.user.universityId;

    // For PARAM-based routes (e.g., /api/universities/:id)
    // Prevent accessing other universities
    const universityParam = req.params.universityId;
    if (universityParam && universityParam !== req.user.universityId) {
      const userRole = req.user.role;
      // SUPER_ADMIN can access any university
      if (userRole !== 'SUPER_ADMIN') {
        throw new AppError('Access denied: Cannot access other universities', 403);
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Helper to add university scope to Prisma queries
export const addUniversityScope = (userId: string, universityId: string) => {
  return {
    where: {
      universityId: universityId,
    },
  };
};

// For services to easily add university scope
export const withUniversityScope = (baseWhere: any = {}) => {
  return (universityId: string) => {
    return {
      ...baseWhere,
      universityId: universityId,
    };
  };
};