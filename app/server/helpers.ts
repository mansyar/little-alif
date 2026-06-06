import { and, eq } from 'drizzle-orm';
import { type DbClient } from '~/db';
import { profiles } from '~/db/schema';
import { ErrorCode, ServerFunctionError } from '~/lib/errors';

/**
 * Verify that the given profile belongs to the given user.
 * Throws ServerFunctionError(NOT_FOUND) if not found or not owned.
 */
export async function verifyProfileOwnership(
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
    throw new ServerFunctionError(ErrorCode.NOT_FOUND, 'ERROR_NOT_FOUND');
  }
}
