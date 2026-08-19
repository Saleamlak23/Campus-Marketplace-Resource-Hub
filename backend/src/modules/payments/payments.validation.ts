import { z } from 'zod';

export const initiatePaymentSchema = z.object({
  relatedType: z.enum(['LISTING_PURCHASE', 'TUTORING_BOOKING']),
  relatedId: z.string().min(1, 'relatedId is required'),
  amount: z.number().positive(),
  returnUrl: z.string().url().optional(),
});

export const chapaWebhookSchema = z.object({
  event: z.string().optional(),
  status: z.string(),
  tx_ref: z.string(),
  amount: z.union([z.number(), z.string()]),
  currency: z.string(),
});

export const getTransactionsQuerySchema = z.object({
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});
