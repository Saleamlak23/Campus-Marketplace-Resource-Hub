import { z } from 'zod';

export const initiatePaymentSchema = z.object({
  relatedType: z.enum(['LISTING_PURCHASE', 'TUTORING_BOOKING']),
  relatedId: z.string().cuid(),
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
