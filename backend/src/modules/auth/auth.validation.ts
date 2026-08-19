import { z } from 'zod';

const AAU_SIGNUP_RESTRICTION_MESSAGE =
  'Signups are currently restricted to Addis Ababa University students (@aau.edu.et).';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z
    .string()
    .email('Invalid email address')
    .refine((email) => email.toLowerCase().endsWith('@aau.edu.et'), AAU_SIGNUP_RESTRICTION_MESSAGE),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  department: z.string().optional(),
  universityIdNumber: z.string().trim().min(1, 'University ID is required'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});
