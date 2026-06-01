import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

/**
 * Better Auth schema tables for email/password authentication.
 *
 * These four tables (`user`, `session`, `account`, `verification`) are the
 * canonical schema that the Better Auth Drizzle adapter expects. Column
 * names follow Better Auth's conventions so we don't need a `usePlural`
 * mapping.
 *
 * Kept in a separate file from `schema.ts` so the application tables
 * (profiles, letters, letter_toggles) stay decoupled from auth and can
 * be reasoned about independently.
 */

/** The registered user. */
export const user = sqliteTable('user', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' })
    .notNull()
    .default(false),
  image: text('image'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

/** A session token issued to a user. */
export const session = sqliteTable('session', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: text('expires_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

/** A linked account (email/password, OAuth, etc.). */
export const account = sqliteTable('account', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  providerId: text('provider_id').notNull(),
  accountId: text('account_id').notNull(),
  password: text('password'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

/** Email verification, password reset, and other one-time token records. */
export const verification = sqliteTable('verification', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: text('expires_at').notNull(),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

export type AuthUser = typeof user.$inferSelect;
export type NewAuthUser = typeof user.$inferInsert;
export type AuthSession = typeof session.$inferSelect;
export type NewAuthSession = typeof session.$inferInsert;
export type AuthAccount = typeof account.$inferSelect;
export type NewAuthAccount = typeof account.$inferInsert;
export type AuthVerification = typeof verification.$inferSelect;
export type NewAuthVerification = typeof verification.$inferInsert;
