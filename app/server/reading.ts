import { and, eq } from 'drizzle-orm';
import { createServerFn } from '@tanstack/react-start';
import { getDb, type DbClient } from '~/db';
import { profiles, letters, letterToggles } from '~/db/schema';
import { type VowelMode } from '~/lib/utils/harakat';
import { getReadingDataSchema } from '~/lib/validations/reading';
import { ErrorCode, ServerFunctionError } from '~/lib/errors';
import { authorizeChildAccess, validateSessionFn } from './auth-fns';
import { verifyProfileOwnership } from './helpers';

// ─── Pure helper functions (unit-testable) ────────────────────────────

/**
 * Result shape for the reading practice data.
 */
export interface ReadingData {
  letters: { letterId: string; character: string }[];
  vowelMode: VowelMode;
}

/**
 * Get reading practice data for a child profile.
 *
 * Returns the set of toggled-ON letters (sorted by displayOrder) and
 * the profile's persisted vowel mode.
 *
 * If zero letters are toggled on, returns `{ letters: [], vowelMode }`
 * — does NOT throw.
 */
export async function getReadingData(
  db: DbClient,
  userId: string,
  profileId: string,
): Promise<ReadingData> {
  await verifyProfileOwnership(db, userId, profileId);

  // Fetch the profile's persisted vowel mode
  const [profile] = await db
    .select({ vowelMode: profiles.vowelMode })
    .from(profiles)
    .where(eq(profiles.id, profileId));

  const vowelMode = profile?.vowelMode ?? 'fathah';

  // Fetch toggled-ON letters, joined with the letters table, sorted by displayOrder
  const rows = await db
    .select({
      letterId: letters.id,
      character: letters.character,
    })
    .from(letterToggles)
    .innerJoin(letters, eq(letters.id, letterToggles.letterId))
    .where(and(eq(letterToggles.profileId, profileId), eq(letterToggles.isVisible, true)))
    .orderBy(letters.displayOrder);

  return {
    letters: rows.map((row) => ({
      letterId: row.letterId,
      character: row.character,
    })),
    vowelMode,
  };
}

// ─── Server Function Wrapper ─────────────────────────────────────────

/**
 * Server function: get reading practice data for a child profile.
 * Requires auth (parent JWT or child-mode cookie).
 */
export const getReadingDataFn = createServerFn({ method: 'GET' })
  .inputValidator(getReadingDataSchema)
  .handler(async ({ data }) => {
    const session = await validateSessionFn();
    if (session === null) {
      throw new ServerFunctionError(ErrorCode.AUTH, 'ERROR_AUTH');
    }
    authorizeChildAccess(session, data.profileId);
    const db = await getDb();
    return getReadingData(db, session.user.id, data.profileId);
  });
