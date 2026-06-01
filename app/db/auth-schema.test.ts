import { sqliteTable } from 'drizzle-orm/sqlite-core';
import { describe, expect, it } from 'vitest';
import { account, session, user, verification } from './auth-schema';

type DrizzleTable = ReturnType<typeof sqliteTable>;

function getTableColumns(table: DrizzleTable): string[] {
  // Drizzle stores column metadata in a symbol-keyed map on the table object.
  // Accessing it directly is stable across v0.38 and v0.45.
  const meta = (table as unknown as Record<symbol, Record<string, unknown>>)[
    Symbol.for('drizzle:Columns')
  ];
  if (!meta) {
    throw new Error('No drizzle:Columns symbol found on table');
  }
  return Object.keys(meta);
}

describe('auth schema tables', () => {
  it('user table has id, email, emailVerified, name, image, createdAt, updatedAt', () => {
    const cols = getTableColumns(user as unknown as DrizzleTable);
    for (const required of [
      'id',
      'email',
      'emailVerified',
      'name',
      'image',
      'createdAt',
      'updatedAt',
    ]) {
      expect(cols, `user.${required}`).toContain(required);
    }
  });

  it('session table has id, userId, token, expiresAt, createdAt, updatedAt, ipAddress, userAgent', () => {
    const cols = getTableColumns(session as unknown as DrizzleTable);
    for (const required of [
      'id',
      'userId',
      'token',
      'expiresAt',
      'createdAt',
      'updatedAt',
      'ipAddress',
      'userAgent',
    ]) {
      expect(cols, `session.${required}`).toContain(required);
    }
  });

  it('account table has id, userId, providerId, accountId, password, createdAt, updatedAt', () => {
    const cols = getTableColumns(account as unknown as DrizzleTable);
    for (const required of [
      'id',
      'userId',
      'providerId',
      'accountId',
      'password',
      'createdAt',
      'updatedAt',
    ]) {
      expect(cols, `account.${required}`).toContain(required);
    }
  });

  it('verification table has id, identifier, value, expiresAt, createdAt, updatedAt', () => {
    const cols = getTableColumns(verification as unknown as DrizzleTable);
    for (const required of ['id', 'identifier', 'value', 'expiresAt', 'createdAt', 'updatedAt']) {
      expect(cols, `verification.${required}`).toContain(required);
    }
  });
});
