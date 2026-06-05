import { z } from 'zod';
import { LETTER_IDS } from '~/lib/constants/letters';

/**
 * Schema for fetching visible letters for a child profile.
 */
export const getVisibleLettersSchema = z.object({
  profileId: z.string().uuid({ message: 'Invalid profile ID.' }),
});
export type GetVisibleLettersInput = z.infer<typeof getVisibleLettersSchema>;

/**
 * Schema for toggling a single letter ON or OFF for a child profile.
 */
export const toggleLetterSchema = z.object({
  profileId: z.string().uuid({ message: 'Invalid profile ID.' }),
  letterId: z.enum(LETTER_IDS, { message: 'Invalid letter ID.' }),
  isVisible: z.boolean({ message: 'isVisible must be a boolean.' }),
});
export type ToggleLetterInput = z.infer<typeof toggleLetterSchema>;

/**
 * Schema for bulk-toggling multiple letters ON or OFF for a child profile.
 */
export const bulkToggleLettersSchema = z.object({
  profileId: z.string().uuid({ message: 'Invalid profile ID.' }),
  letterIds: z
    .array(z.enum(LETTER_IDS, { message: 'Invalid letter ID in array.' }), {
      message: 'letterIds must be an array of letter IDs.',
    })
    .min(1, { message: 'At least one letter ID is required.' })
    .max(28, { message: 'Maximum of 28 letter IDs allowed.' }),
  isVisible: z.boolean({ message: 'isVisible must be a boolean.' }),
});
export type BulkToggleLettersInput = z.infer<typeof bulkToggleLettersSchema>;
