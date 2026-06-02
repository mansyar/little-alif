import { createServerFn } from '@tanstack/react-start';
import { and, eq, sql } from 'drizzle-orm';
import { getDb, type DbClient } from '~/db';
import { profiles, letters, letterToggles } from '~/db/schema';
import {
  getVisibleLettersSchema,
  toggleLetterSchema,
  bulkToggleLettersSchema,
  type ToggleLetterInput,
  type BulkToggleLettersInput,
} from '~/lib/validations/letters';
import { validateSessionFn } from './auth-fns';

// ─── Pure helper functions (unit-testable) ────────────────────────────

/**
 * Result shape for a single letter with its toggle state.
 */
export interface VisibleLetter {
  letterId: string;
  character: string;
  displayOrder: number;
  audioFile: string;
  isVisible: boolean;
}

/**
 * Verify that the given profile belongs to the given user.
 * Throws if not found or not owned.
 */
async function verifyProfileOwnership(
  db: DbClient,
  userId: string,
  profileId: string,
): Promise<void> {
  const profile = await db
    .select()
    .from(profiles)
    .where(and(eq(profiles.id, profileId), eq(profiles.userId, userId)))
    .then((rows) => rows[0] ?? null);

  if (!profile) {
    throw new Error('Profile not found or does not belong to you.');
  }
}

/**
 * Get all 28 letters with their toggle state for a given profile.
 * Letters are returned in display order (1–28).
 * Validates that the profile belongs to the authenticated user.
 */
export async function getVisibleLetters(
  db: DbClient,
  userId: string,
  profileId: string,
): Promise<VisibleLetter[]> {
  await verifyProfileOwnership(db, userId, profileId);

  const rows = await db
    .select({
      letterId: letters.id,
      character: letters.character,
      displayOrder: letters.displayOrder,
      audioFile: sql`json_extract(${letters.audioFiles}, '$.none')`.as('audio_file'),
      isVisible: sql`COALESCE(${letterToggles.isVisible}, 0)`.as('is_visible'),
    })
    .from(letters)
    .leftJoin(
      letterToggles,
      and(eq(letterToggles.letterId, letters.id), eq(letterToggles.profileId, profileId)),
    )
    .orderBy(letters.displayOrder);

  return rows.map((row) => ({
    letterId: row.letterId,
    character: row.character,
    displayOrder: row.displayOrder,
    audioFile: (row.audioFile ?? '') as string,
    isVisible: Boolean(row.isVisible),
  }));
}

/**
 * Toggle a single letter ON or OFF for a child profile.
 * Uses upsert (INSERT ... ON CONFLICT DO UPDATE) for idempotent toggling.
 * Validates that the profile belongs to the authenticated user.
 */
export async function toggleLetter(db: DbClient, userId: string, data: ToggleLetterInput) {
  await verifyProfileOwnership(db, userId, data.profileId);

  // Upsert: insert or update on conflict (unique on profileId + letterId)
  await db
    .insert(letterToggles)
    .values({
      profileId: data.profileId,
      letterId: sql`${data.letterId}`,
      isVisible: data.isVisible,
    })
    .onConflictDoUpdate({
      target: [letterToggles.profileId, letterToggles.letterId],
      set: {
        isVisible: data.isVisible,
        toggledAt: sql`(datetime('now'))`,
      },
    });

  return {
    letterId: data.letterId,
    isVisible: data.isVisible,
  };
}

/**
 * Bulk toggle multiple letters ON or OFF for a child profile.
 * Validates that the profile belongs to the authenticated user.
 */
export async function bulkToggleLetters(
  db: DbClient,
  userId: string,
  data: BulkToggleLettersInput,
) {
  await verifyProfileOwnership(db, userId, data.profileId);

  await db
    .insert(letterToggles)
    .values(
      data.letterIds.map((letterId) => ({
        profileId: data.profileId,
        letterId: sql`${letterId}`,
        isVisible: data.isVisible,
      })),
    )
    .onConflictDoUpdate({
      target: [letterToggles.profileId, letterToggles.letterId],
      set: {
        isVisible: data.isVisible,
        toggledAt: sql`(datetime('now'))`,
      },
    });

  return {
    updatedCount: data.letterIds.length,
  };
}

// ─── Server Function Wrappers ─────────────────────────────────────────

/**
 * Server function: get visible letters for a child profile.
 * Requires auth (parent JWT or child-mode cookie).
 */
export const getVisibleLettersFn = createServerFn({ method: 'GET' })
  .inputValidator(getVisibleLettersSchema)
  .handler(async ({ data }) => {
    const session = await validateSessionFn();
    if (session === null) {
      throw new Error('Unauthenticated.');
    }
    const db = getDb();
    return getVisibleLetters(db, session.user.id, data.profileId);
  });

/**
 * Server function: toggle a single letter ON/OFF for a child profile.
 * Requires parent JWT (children cannot toggle).
 */
export const toggleLetterFn = createServerFn({ method: 'POST' })
  .inputValidator(toggleLetterSchema)
  .handler(async ({ data }) => {
    const session = await validateSessionFn();
    if (session === null) {
      throw new Error('Unauthenticated.');
    }
    const db = getDb();
    return toggleLetter(db, session.user.id, data);
  });

/**
 * Server function: bulk toggle multiple letters ON/OFF for a child profile.
 * Requires parent JWT (children cannot toggle).
 */
export const bulkToggleLettersFn = createServerFn({ method: 'POST' })
  .inputValidator(bulkToggleLettersSchema)
  .handler(async ({ data }) => {
    const session = await validateSessionFn();
    if (session === null) {
      throw new Error('Unauthenticated.');
    }
    const db = getDb();
    return bulkToggleLetters(db, session.user.id, data);
  });
