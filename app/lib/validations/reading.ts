import { z } from 'zod';

/**
 * Schema for fetching reading practice data for a child profile.
 * Returns the toggled-on letters and the profile's current vowel mode.
 */
export const getReadingDataSchema = z.object({
  profileId: z.string().uuid({ message: 'Invalid profile ID.' }),
});
export type GetReadingDataInput = z.infer<typeof getReadingDataSchema>;
