import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text, uniqueIndex, index } from 'drizzle-orm/sqlite-core';
import type { LetterId } from '~/lib/constants/letters';
import { user } from './auth-schema';

export type { LetterId };

/**
 * Vowel mode enum used by profiles to determine which audio file plays
 * (none, fathah, kasrah, dammah).
 */
export const VOWEL_MODES = ['none', 'fathah', 'kasrah', 'dammah'] as const;
export type VowelMode = (typeof VOWEL_MODES)[number];

/**
 * Avatar keys for child profile pictures.
 * 8 themed avatars per docs/roadmap.md T-04.
 */
export const AVATAR_KEYS = [
  'alif-lamp',
  'ba-boat',
  'ta-table',
  'tsa-butterfly',
  'jim-mountain',
  'ha-jar',
  'kho-hat',
  'dal-book',
] as const;
export type AvatarKey = (typeof AVATAR_KEYS)[number];

/**
 * Profile: a child configuration under a parent user.
 * Deletion cascades to letter_toggles (Drizzle `onDelete: 'cascade'`).
 */
export const profiles = sqliteTable(
  'profiles',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    avatar: text('avatar').notNull().$type<AvatarKey>(),
    vowelMode: text('vowel_mode', { enum: VOWEL_MODES }).notNull().default('fathah'),
    createdAt: text('created_at').default(sql`(datetime('now'))`),
    updatedAt: text('updated_at').default(sql`(datetime('now'))`),
  },
  (table) => ({
    idxUserId: index('idx_profiles_user_id').on(table.userId),
  }),
);

/**
 * Letters: the 28-letter Hijaiyah master table.
 * `id` is a text enum matching LETTER_IDS.
 * `audioFiles` is a JSON string mapping vowel mode to filename.
 */
export const letters = sqliteTable('letters', {
  id: text('id').primaryKey().$type<LetterId>(),
  character: text('character').notNull(),
  displayOrder: integer('display_order').notNull(),
  audioFiles: text('audio_files').notNull().default('{}'),
});

/**
 * Letter toggles: per-profile visibility flags for each letter.
 * Unique on (profileId, letterId) so re-toggling is idempotent.
 * Deletion of a profile cascades to its toggles.
 */
export const letterToggles = sqliteTable(
  'letter_toggles',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    profileId: text('profile_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    letterId: text('letter_id')
      .notNull()
      .$type<LetterId>()
      .references(() => letters.id),
    isVisible: integer('is_visible', { mode: 'boolean' }).default(false),
    toggledAt: text('toggled_at').default(sql`(datetime('now'))`),
  },
  (table) => ({
    unqProfileLetter: uniqueIndex('unq_profile_letter').on(table.profileId, table.letterId),
  }),
);

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type Letter = typeof letters.$inferSelect;
export type NewLetter = typeof letters.$inferInsert;
export type LetterToggle = typeof letterToggles.$inferSelect;
export type NewLetterToggle = typeof letterToggles.$inferInsert;
