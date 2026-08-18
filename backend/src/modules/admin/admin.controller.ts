import { Request, Response, NextFunction } from 'express';
import prisma from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';

export class AdminController {
  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const universityId = req.user?.universityId;
      if (!universityId) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }

      const users = await prisma.user.findMany({
        where: {
          universityId: universityId,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isBanned: true,
          isVerified: true,
          createdAt: true,
        },
      });

      res.json({ success: true, data: users });
    } catch (error) {
      next(error);
    }
  }

  async banUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.userId;
      if (Array.isArray(userId)) {
        return res.status(400).json({ success: false, error: 'Invalid user ID' });
      }

      const { banReason } = req.body;

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      if (req.user?.role !== 'SUPER_ADMIN' && user.universityId !== req.user?.universityId) {
        return res.status(403).json({
          success: false,
          error: 'Cannot ban users from other universities',
        });
      }

      if (user.role === 'UNIVERSITY_ADMIN' && req.user?.role !== 'SUPER_ADMIN') {
        return res.status(403).json({
          success: false,
          error: 'Cannot ban an admin',
        });
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          isBanned: true,
          banReason: banReason || 'No reason provided',
        },
      });

      res.json({
        success: true,
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }

  async unbanUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.userId;
      if (Array.isArray(userId)) {
        return res.status(400).json({ success: false, error: 'Invalid user ID' });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      if (req.user?.role !== 'SUPER_ADMIN' && user.universityId !== req.user?.universityId) {
        return res.status(403).json({
          success: false,
          error: 'Cannot unban users from other universities',
        });
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          isBanned: false,
          banReason: null,
        },
      });

      res.json({
        success: true,
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteListing(req: Request, res: Response, next: NextFunction) {
    try {
      const listingId = req.params.id;
      if (Array.isArray(listingId)) {
        return res.status(400).json({ success: false, error: 'Invalid listing ID' });
      }

      const listing = await prisma.listing.findUnique({
        where: { id: listingId },
      });

      if (!listing) {
        return res.status(404).json({ success: false, error: 'Listing not found' });
      }

      if (req.user?.role !== 'SUPER_ADMIN' && listing.universityId !== req.user?.universityId) {
        return res.status(403).json({
          success: false,
          error: 'Cannot delete listing from other university',
        });
      }

      await prisma.listing.delete({
        where: { id: listingId },
      });

      res.json({
        success: true,
        data: { message: 'Listing deleted successfully' },
      });
    } catch (error) {
      next(error);
    }
  }

  async getUniversitiesStats(req: Request, res: Response, next: NextFunction) {
    try {
      const universities = await prisma.university.findMany({
        include: {
          users: {
            select: { id: true, name: true, email: true, role: true },
          },
          listings: {
            select: { id: true, title: true, status: true },
          },
          tutorProfiles: {
            select: { id: true, userId: true },
          },
          bookings: {
            select: { id: true, status: true },
          },
        },
      });

      res.json({
        success: true,
        data: universities,
      });
    } catch (error) {
      next(error);
    }
  }

  async createUniversity(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, allowedEmailDomains } = req.body;

      if (!name || !allowedEmailDomains || !Array.isArray(allowedEmailDomains)) {
        return res.status(400).json({
          success: false,
          error: 'Name and allowedEmailDomains array are required',
        });
      }

      const university = await prisma.university.create({
        data: {
          name,
          allowedEmailDomains,
        },
      });

      res.status(201).json({
        success: true,
        data: university,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUniversity(req: Request, res: Response, next: NextFunction) {
    try {
      const universityId = req.params.id;
      if (Array.isArray(universityId)) {
        return res.status(400).json({ success: false, error: 'Invalid university ID' });
      }

      const { name, allowedEmailDomains } = req.body;

      const university = await prisma.university.update({
        where: { id: universityId },
        data: {
          name: name,
          allowedEmailDomains: allowedEmailDomains,
        },
      });

      res.json({
        success: true,
        data: university,
      });
    } catch (error) {
      next(error);
    }
  }
}