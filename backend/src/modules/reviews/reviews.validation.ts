import { z } from 'zod';

export const createReviewSchema = z.object({
  targetUserId: z.string().min(1, 'targetUserId is required'),
  rating: z.number().int().min(1, 'Rating must be between 1 and 5').max(5, 'Rating must be between 1 and 5'),
  comment: z.string().max(1000).optional(),
});
