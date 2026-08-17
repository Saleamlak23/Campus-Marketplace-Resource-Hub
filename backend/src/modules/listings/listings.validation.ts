import { z } from 'zod';

export const createListingSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().min(5, 'Description must be at least 5 characters'),
    category: z.string().min(1, 'Category is required'),
    price: z.number().positive('Price must be greater than 0'),
    condition: z.string().min(1, 'Condition is required'),
    department: z.string().min(1, 'Department is required'),
    images: z.array(z.string().url()).optional().default([]),
  }),
});

export const updateListingSchema = z.object({
  body: createListingSchema.shape.body.partial().extend({
    status: z.enum(['AVAILABLE', 'RESERVED', 'SOLD']).optional(),
  }),
});

export const getListingsQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    category: z.string().optional(),
    department: z.string().optional(),
    minPrice: z.string().optional(),
    maxPrice: z.string().optional(),
  }),
});