import { z } from 'zod';

export const createReportSchema = z.object({
  targetType: z.enum(['LISTING', 'USER', 'TUTOR_PROFILE', 'MESSAGE']),
  targetId: z.string().min(1, 'targetId is required'),
  reason: z.string().min(3, 'Reason must be at least 3 characters long').max(1000),
});

export const updateReportStatusSchema = z.object({
  status: z.enum(['PENDING', 'REVIEWED', 'DISMISSED', 'ACTION_TAKEN']),
});
