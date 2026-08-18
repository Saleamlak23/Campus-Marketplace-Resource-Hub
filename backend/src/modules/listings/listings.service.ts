import prisma from '../../lib/prisma.js';
import { ListingCategory, ListingCondition, ListingStatus } from '@prisma/client';

export interface CreateListingInput {
  title: string;
  description: string;
  category: ListingCategory;
  price: number;
  condition: ListingCondition;
  department: string;
  images?: string[];
  sellerId: string;
  universityId: string;
}

export interface GetListingsFilter {
  universityId: string;
  search?: string;
  category?: ListingCategory;
  department?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface UpdateListingInput {
  title?: string;
  description?: string;
  category?: ListingCategory;
  price?: number;
  condition?: ListingCondition;
  department?: string;
  images?: string[];
  status?: ListingStatus;
}

// 1. Create a new listing (auto-scoped to seller's university)
export async function createListing(data: CreateListingInput) {
  return await prisma.listing.create({
    data: {
      title: data.title,
      description: data.description,
      category: data.category,
      price: data.price,
      condition: data.condition,
      department: data.department,
      images: data.images || [],
      sellerId: data.sellerId,
      universityId: data.universityId,
    },
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
  });
}

// 2. Get listings with search & filters (STRICTLY scoped to user's university)
export async function getListings(filters: GetListingsFilter) {
  const { universityId, search, category, department, minPrice, maxPrice } = filters;

  const whereClause: any = {
    universityId, // Always filter by the student's own university
  };

  if (category) {
    whereClause.category = { equals: category, mode: 'insensitive' };
  }

  if (department) {
    whereClause.department = { equals: department, mode: 'insensitive' };
  }

  if (search) {
    whereClause.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    whereClause.price = {};
    if (minPrice !== undefined) whereClause.price.gte = minPrice;
    if (maxPrice !== undefined) whereClause.price.lte = maxPrice;
  }

  return await prisma.listing.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
  });
}

// 3. Get single listing by ID
export async function getListingById(id: string) {
  return await prisma.listing.findUnique({
    where: { id },
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
      university: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

// 4. Update a listing
export async function updateListing(id: string, data: UpdateListingInput) {
  return await prisma.listing.update({
    where: { id },
    data,
  });
}

// 5. Delete a listing
export async function deleteListing(id: string) {
  return await prisma.listing.delete({
    where: { id },
  });
}
