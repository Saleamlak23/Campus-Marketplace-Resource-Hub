import { NextFunction, Request, Response } from 'express';
import { ReportStatus } from '@prisma/client';
import prisma from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';
import * as reportsService from '../reports/reports.service';

export async function getUsersHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError('Not authenticated', 401);
    const universityId = req.user.universityId;

    const whereClause: any = {};
    if (req.user.role !== 'SUPER_ADMIN') {
      whereClause.universityId = universityId;
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        universityId: true,
        isBanned: true,
        banReason: true,
        isVerified: true,
        department: true,
        universityIdNumber: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
}

export async function banUserHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError('Not authenticated', 401);
    const { userId } = req.params;
    if (typeof userId !== 'string') throw new AppError('Invalid user ID', 400);

    const { banReason } = req.body as { banReason?: string };

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Super admin can ban anyone; university admin can only ban students at their university
    if (req.user.role !== 'SUPER_ADMIN' && user.universityId !== req.user.universityId) {
      throw new AppError('Cannot ban users from other universities', 403);
    }

    // Don't allow banning admins unless super admin
    if (user.role === 'UNIVERSITY_ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      throw new AppError('Cannot ban an admin', 403);
    }

    if (user.role === 'SUPER_ADMIN') {
      throw new AppError('Cannot ban a super admin', 403);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: true,
        banReason: banReason || 'Violated campus community guidelines',
      },
      select: {
        id: true,
        name: true,
        email: true,
        isBanned: true,
        banReason: true,
      },
    });

    res.json({ success: true, data: updatedUser });
  } catch (error) {
    next(error);
  }
}

export async function unbanUserHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError('Not authenticated', 401);
    const { userId } = req.params;
    if (typeof userId !== 'string') throw new AppError('Invalid user ID', 400);

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (req.user.role !== 'SUPER_ADMIN' && user.universityId !== req.user.universityId) {
      throw new AppError('Cannot unban users from other universities', 403);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: false,
        banReason: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        isBanned: true,
      },
    });

    res.json({ success: true, data: updatedUser });
  } catch (error) {
    next(error);
  }
}

export async function deleteListingHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError('Not authenticated', 401);
    const { id } = req.params;
    if (typeof id !== 'string') throw new AppError('Invalid listing ID', 400);

    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) throw new AppError('Listing not found', 404);

    const canManageListing = req.user.role === 'SUPER_ADMIN' || listing.universityId === req.user.universityId;
    if (!canManageListing) throw new AppError('Cannot delete listings from other universities', 403);

    await prisma.listing.delete({ where: { id } });
    res.json({ success: true, data: { message: 'Listing deleted successfully' } });
  } catch (error) {
    next(error);
  }
}

export async function getUniversitiesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const universities = await prisma.university.findMany({
      include: {
        _count: {
          select: {
            users: true,
            listings: true,
            tutorProfiles: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json({ success: true, data: universities });
  } catch (error) {
    next(error);
  }
}

export async function getReportsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError('Not authenticated', 401);
    const { status, page, pageSize } = req.query as { status?: ReportStatus; page?: string; pageSize?: string };

    const pageNum = Math.max(1, parseInt(page || '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(pageSize || '20', 10) || 20));

    const result = await reportsService.getReports({
      universityId: req.user.universityId,
      isSuperAdmin: req.user.role === 'SUPER_ADMIN',
      status,
      page: pageNum,
      pageSize: limit,
    });

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function updateReportStatusHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError('Not authenticated', 401);
    const { id } = req.params;
    if (typeof id !== 'string') throw new AppError('Invalid report ID', 400);

    const { status } = req.body as { status?: ReportStatus };
    if (!status || !Object.values(ReportStatus).includes(status)) {
      throw new AppError('Valid report status is required', 400);
    }

    const updated = await reportsService.updateReportStatus(
      id,
      status,
      req.user.universityId,
      req.user.role === 'SUPER_ADMIN'
    );

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
}
