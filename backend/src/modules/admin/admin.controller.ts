import { NextFunction, Request, Response } from 'express';
import prisma from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';

export async function deleteListingHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (typeof id !== 'string') throw new AppError('Invalid listing ID', 400);
    if (!req.user) throw new AppError('Not authenticated', 401);

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
