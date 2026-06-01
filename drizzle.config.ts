import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: ['./app/db/schema.ts', './app/db/auth-schema.ts'],
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'file:./data/little-alif.db',
  },
  verbose: true,
  strict: true,
});
