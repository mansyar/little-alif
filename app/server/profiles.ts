import { createServerFn } from '@tanstack/react-start';
import { getCookie, setCookie } from '@tanstack/react-start/server';
import { and, count, eq, sql, type SQL } from 'drizzle-orm';
import { z } from 'zod';
import { getDb, type DbClient } from '~/db';
import { profiles, letterToggles, LETTER_IDS } from '~/db/schema';
import {
  createProfileSchema,
  updateProfileSchema,
  deleteProfileSchema,
  getActiveProfileSchema,
} from '~/lib/validations/profiles';
import type { CreateProfileInput, UpdateProfileInput } from '~/lib/validations/profiles';
import { authorizeChildAccess, requireParentSession, validateSessionFn } from './auth-fns';

// ─── Pure helper functions (unit-testable) ────────────────────────────

/**
 * List all profiles for a given user, including the count of visible
 * (introduced) letters per profile.
 */
export async function listProfiles(db: DbClient, userId: string) {
  return db
    .select({
      id: profiles.id,
      userId: profiles.userId,
      name: profiles.name,
      avatar: profiles.avatar,
      vowelMode: profiles.vowelMode,
      createdAt: profiles.createdAt,
      updatedAt: profiles.updatedAt,
      introducedCount: count(sql`CASE WHEN ${letterToggles.isVisible} = 1 THEN 1 END`).as(
        'introduced_count',
      ),
    })
    .from(profiles)
    .leftJoin(letterToggles, eq(letterToggles.profileId, profiles.id))
    .where(eq(profiles.userId, userId))
    .groupBy(profiles.id);
}

/**
 * Create a new child profile for the given user.
 * Auto-seeds 28 letter_toggles (all OFF).
 * Enforces max 4 profiles per user.
 */
export async function createProfile(db: DbClient, userId: string, data: CreateProfileInput) {
  const existingCount = await db
    .select({ count: count() })
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .then((rows) => rows[0]?.count ?? 0);

  if (existingCount >= 4) {
    throw new Error('Maximum of 4 child profiles reached.');
  }

  const [inserted] = await db
    .insert(profiles)
    .values({
      userId,
      name: data.name,
      avatar: data.avatar,
    })
    .returning();

  if (!inserted) {
    throw new Error('Failed to create profile.');
  }

  // Seed 28 letter_toggles (all OFF by default)
  const toggleValues = LETTER_IDS.map((letterId) => ({
    profileId: inserted.id,
    letterId,
  }));
  await db.insert(letterToggles).values(toggleValues);

  return inserted;
}

/**
 * Update a child profile's fields. Only the provided fields are updated.
 * Validates that the profile belongs to the authenticated user.
 */
export async function updateProfile(db: DbClient, userId: string, data: UpdateProfileInput) {
  const existing = await db
    .select()
    .from(profiles)
    .where(and(eq(profiles.id, data.profileId), eq(profiles.userId, userId)))
    .then((rows) => rows[0] ?? null);

  if (!existing) {
    throw new Error('Profile not found or does not belong to you.');
  }

  const updateData: Record<string, string | SQL<unknown> | undefined> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.avatar !== undefined) updateData.avatar = data.avatar;
  if (data.vowelMode !== undefined) updateData.vowelMode = data.vowelMode;

  if (Object.keys(updateData).length === 0) {
    return existing;
  }

  updateData.updatedAt = sql`(datetime('now'))`;

  const [updated] = await db
    .update(profiles)
    .set(updateData)
    .where(eq(profiles.id, data.profileId))
    .returning();

  return updated;
}

/**
 * Delete a child profile. The DB cascade (onDelete: 'cascade') handles
 * removal of associated letter_toggles automatically.
 * Validates that the profile belongs to the authenticated user.
 */
export async function deleteProfile(db: DbClient, userId: string, profileId: string) {
  const existing = await db
    .select()
    .from(profiles)
    .where(and(eq(profiles.id, profileId), eq(profiles.userId, userId)))
    .then((rows) => rows[0] ?? null);

  if (!existing) {
    throw new Error('Profile not found or does not belong to you.');
  }

  await db.delete(profiles).where(eq(profiles.id, profileId));
  return { success: true };
}

/**
 * Fetch the active child profile's identifying fields.
 *
 * Returns the public-safe shape `{ id, name, avatar, vowelMode }` used by
 * the `/learn` route's `ProfileBadge`. Throws if the profile is missing
 * or not owned by `userId`.
 */
export async function getActiveProfile(db: DbClient, userId: string, profileId: string) {
  const profile = await db
    .select({
      id: profiles.id,
      name: profiles.name,
      avatar: profiles.avatar,
      vowelMode: profiles.vowelMode,
    })
    .from(profiles)
    .where(and(eq(profiles.id, profileId), eq(profiles.userId, userId)))
    .then((rows) => rows[0] ?? null);

  if (!profile) {
    throw new Error('Profile not found or does not belong to you.');
  }

  return profile;
}

// ─── Server Function Wrappers ─────────────────────────────────────────

/**
 * Server function: list all profiles for the authenticated parent.
 */
export const listProfilesFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({}).optional())
  .handler(async () => {
    const session = await validateSessionFn();
    requireParentSession(session);
    const db = getDb();
    return listProfiles(db, session.user.id);
  });

/**
 * Server function: create a new child profile.
 */
export const createProfileFn = createServerFn({ method: 'POST' })
  .inputValidator(createProfileSchema)
  .handler(async ({ data }) => {
    const session = await validateSessionFn();
    requireParentSession(session);
    const db = getDb();
    return createProfile(db, session.user.id, data);
  });

/**
 * Server function: update an existing child profile.
 */
export const updateProfileFn = createServerFn({ method: 'POST' })
  .inputValidator(updateProfileSchema)
  .handler(async ({ data }) => {
    const session = await validateSessionFn();
    requireParentSession(session);
    const db = getDb();
    return updateProfile(db, session.user.id, data);
  });

/**
 * Server function: delete a child profile (cascades to letter_toggles).
 */
export const deleteProfileFn = createServerFn({ method: 'POST' })
  .inputValidator(deleteProfileSchema)
  .handler(async ({ data }) => {
    const session = await validateSessionFn();
    requireParentSession(session);
    const db = getDb();

    await deleteProfile(db, session.user.id, data.profileId);

    // Clean up child-mode cookie if it references the deleted profile
    const childCookie = getCookie('child_mode');
    if (childCookie) {
      const { verifyChildModeCookie } = await import('~/lib/utils/child-mode.server');
      const payload = verifyChildModeCookie(childCookie);
      if (payload?.profileId === data.profileId) {
        setCookie('child_mode', '', { maxAge: 0, path: '/' });
      }
    }

    return { success: true };
  });

/**
 * Server function: get the active child profile's public fields.
 * Used by the `/learn` route to populate `ProfileBadge` without
 * embedding PII in the child-mode cookie.
 */
export const getActiveProfileFn = createServerFn({ method: 'GET' })
  .inputValidator(getActiveProfileSchema)
  .handler(async ({ data }) => {
    const session = await validateSessionFn();
    if (session === null) {
      throw new Error('Unauthenticated.');
    }
    authorizeChildAccess(session, data.profileId);
    const db = getDb();
    return getActiveProfile(db, session.user.id, data.profileId);
  });
