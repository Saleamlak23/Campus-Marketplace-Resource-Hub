import { Request, Response, NextFunction } from 'express';
import { ListingCategory } from '@prisma/client';
import * as listingService from './listings.service.js';

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
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const listing = await listingService.createListing({
      ...req.body,
      sellerId: userId,
      universityId,
    });

    return res.status(201).json(listing);
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
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { search, category, department, minPrice, maxPrice } = req.query;

    const requestedCategory = category ? String(category) : undefined;
    const validCategory = requestedCategory && Object.values(ListingCategory).includes(requestedCategory as ListingCategory)
      ? requestedCategory as ListingCategory
      : undefined;

    const listings = await listingService.getListings({
      universityId,
      search: search ? String(search) : undefined,
      category: validCategory,
      department: department ? String(department) : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    });

    return res.status(200).json(listings);
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
      return res.status(404).json({ error: 'Listing not found' });
    }

    return res.status(200).json(listing);
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
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Ensure only the seller can edit the listing
    if (existingListing.sellerId !== userId) {
      return res.status(403).json({ error: 'Forbidden: You can only edit your own listings' });
    }

    const updatedListing = await listingService.updateListing(id, req.body);
    return res.status(200).json(updatedListing);
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
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Ensure only the seller can delete the listing
    if (existingListing.sellerId !== userId) {
      return res.status(403).json({ error: 'Forbidden: You can only delete your own listings' });
    }

    await listingService.deleteListing(id);
    return res.status(200).json({ message: 'Listing deleted successfully' });
  } catch (error) {
    next(error);
  }
}
