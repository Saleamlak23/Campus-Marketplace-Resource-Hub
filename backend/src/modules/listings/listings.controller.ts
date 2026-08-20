import { Request, Response, NextFunction } from 'express';
import { ListingCategory, ListingStatus } from '@prisma/client';
import * as listingService from './listings.service';

function routeId(req: Request) {
  const { id } = req.params;
  if (typeof id !== 'string') throw new Error('Invalid route identifier');
  return id;
}

// 1. Create a listing
export async function createListingHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?.userId;
    const universityId = req.user?.universityId;

    if (!userId || !universityId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const listing = await listingService.createListing({
      ...req.body,
      sellerId: userId,
      universityId,
    });

    return res.status(201).json({ success: true, data: { listing } });
  } catch (error) {
    next(error);
  }
}

// 2. Get listings with search & filters (University-scoped)
export async function getListingsHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const universityId = req.user?.universityId;

    if (!universityId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const {
      search,
      category,
      department,
      status,
      sellerId,
      minPrice,
      maxPrice,
      page,
      pageSize,
    } = req.query;

    const requestedCategory = category ? String(category).toUpperCase() : undefined;
    const validCategory =
      requestedCategory &&
      Object.values(ListingCategory).includes(requestedCategory as ListingCategory)
        ? (requestedCategory as ListingCategory)
        : undefined;

    const requestedStatus = status ? String(status).toUpperCase() : undefined;
    const validStatus =
      requestedStatus &&
      Object.values(ListingStatus).includes(requestedStatus as ListingStatus)
        ? (requestedStatus as ListingStatus)
        : undefined;

    const pageNum = Math.max(1, parseInt(String(page || '1'), 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(String(pageSize || '20'), 10) || 20));

    const result = await listingService.getListings({
      universityId,
      search: search ? String(search) : undefined,
      category: validCategory,
      department: department ? String(department) : undefined,
      status: validStatus,
      sellerId: sellerId ? String(sellerId) : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      page: pageNum,
      pageSize: limit,
    });

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

// 3. Get listing by ID
export async function getListingByIdHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const listing = await listingService.getListingById(routeId(req));

    if (!listing) {
      return res.status(404).json({ success: false, error: 'Listing not found' });
    }

    return res.status(200).json({ success: true, data: { listing } });
  } catch (error) {
    next(error);
  }
}

// 4. Update a listing (Seller ownership check)
export async function updateListingHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = routeId(req);
    const userId = req.user?.userId;

    const existingListing = await listingService.getListingById(id);
    if (!existingListing) {
      return res.status(404).json({ success: false, error: 'Listing not found' });
    }

    // Ensure only the seller or super admin can edit the listing
    if (existingListing.sellerId !== userId && req.user?.role !== 'SUPER_ADMIN') {
      return res
        .status(403)
        .json({ success: false, error: 'Forbidden: You can only edit your own listings' });
    }

    const updatedListing = await listingService.updateListing(id, req.body);
    return res.status(200).json({ success: true, data: { listing: updatedListing } });
  } catch (error) {
    next(error);
  }
}

// 5. Delete a listing (Seller ownership check)
export async function deleteListingHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = routeId(req);
    const userId = req.user?.userId;

    const existingListing = await listingService.getListingById(id);
    if (!existingListing) {
      return res.status(404).json({ success: false, error: 'Listing not found' });
    }

    // Ensure only the seller or super admin can delete the listing
    if (existingListing.sellerId !== userId && req.user?.role !== 'SUPER_ADMIN') {
      return res
        .status(403)
        .json({ success: false, error: 'Forbidden: You can only delete your own listings' });
    }

    await listingService.deleteListing(id);
    return res.status(200).json({ success: true, data: { message: 'Listing deleted successfully' } });
  } catch (error) {
    next(error);
  }
}
