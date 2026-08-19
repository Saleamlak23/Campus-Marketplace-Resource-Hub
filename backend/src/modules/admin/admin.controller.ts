import { Request, Response, NextFunction } from 'express';
import prisma from '../../lib/prisma';

export class AdminController {
  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const universityId = req.user?.universityId;
      if (!universityId) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }

      const users = await prisma.user.findMany({
        where: { universityId },
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

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          isBanned: true,
          banReason: banReason || 'No reason provided',
        },
      });

      res.json({ success: true, data: updatedUser });
    } catch (error) {
      next(error);
    }
  }

  async unbanUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.userId;

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

      res.json({ success: true, data: updatedUser });
    } catch (error) {
      next(error);
    }
  }

  async deleteListing(req: Request, res: Response, next: NextFunction) {
    try {
      const listingId = req.params.id;

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
}