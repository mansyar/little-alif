import { z } from 'zod';

/**
 * Email + password registration input validation.
 * Password must be at least 8 characters to align with Better Auth's defaults.
 */
export const registerSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long.' })
    .max(128, { message: 'Password is too long.' }),
});
export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * Email + password login input validation.
 * Same shape as registration; passwords aren't length-checked at login
 * (we want to reject mismatched credentials, not enforce policy at the door).
 */
export const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});
export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Schema for enabling child mode on a profile.
 * Only `profileId` is required — the associated profile's name and avatar
 * are read from the database server-side.
 */
export const enableChildModeSchema = z.object({
  profileId: z.string().uuid({ message: 'Invalid profile ID.' }),
});
export type EnableChildModeInput = z.infer<typeof enableChildModeSchema>;
