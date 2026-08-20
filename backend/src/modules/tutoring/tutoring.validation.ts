import { z } from 'zod';

export const tutorProfileSchema = z.object({
  subjects: z.array(z.string().trim().min(1)).min(1),
  hourlyRate: z.number().positive(),
  availability: z.string().trim().max(2_000).optional(),
  bio: z.string().trim().max(2_000).optional(),
});

export const createBookingSchema = z.object({
  tutorId: z.string().cuid(),
  subject: z.string().trim().min(1).max(200),
  scheduledAt: z.coerce.date().refine((date) => date > new Date(), {
    message: 'scheduledAt must be in the future',
  }),
  notes: z.string().trim().max(2_000).optional(),
});

export const updateBookingSchema = z.object({
  status: z.enum(['ACCEPTED', 'DECLINED', 'COMPLETED', 'CANCELLED']),
});
