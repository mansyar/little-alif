import { z } from 'zod';
import { AVATAR_KEYS } from '~/db/schema';

/**
 * Schema for creating a new child profile.
 * Name must be 1-50 characters; avatar must be a valid key from AVATAR_KEYS.
 * vowelMode defaults to 'fathah' server-side.
 */
export const createProfileSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Name is required.' })
    .max(50, { message: 'Name must be 50 characters or fewer.' }),
  avatar: z.enum(AVATAR_KEYS, { message: 'Please select a valid avatar.' }),
});
export type CreateProfileInput = z.infer<typeof createProfileSchema>;

/**
 * Schema for updating an existing child profile.
 * All fields are optional so partial updates work.
 */
export const updateProfileSchema = z.object({
  profileId: z.string().uuid({ message: 'Invalid profile ID.' }),
  name: z
    .string()
    .min(1, { message: 'Name is required.' })
    .max(50, { message: 'Name must be 50 characters or fewer.' })
    .optional(),
  avatar: z.enum(AVATAR_KEYS, { message: 'Please select a valid avatar.' }).optional(),
  vowelMode: z.enum(['none', 'fathah', 'kasrah', 'dammah']).optional(),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

/**
 * Schema for deleting a child profile.
 */
export const deleteProfileSchema = z.object({
  profileId: z.string().uuid({ message: 'Invalid profile ID.' }),
});
export type DeleteProfileInput = z.infer<typeof deleteProfileSchema>;
