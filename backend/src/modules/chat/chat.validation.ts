import { z } from 'zod';

export const createConversationSchema = z.object({
  participantId: z.string().cuid(),
});

export const createMessageSchema = z.object({
  content: z.string().trim().min(1).max(4_000),
});
