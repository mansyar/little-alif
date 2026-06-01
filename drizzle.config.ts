import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: ['./app/db/schema.ts', './app/db/auth-schema.ts'],
  out: './app/db/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'file:./data/little-alif.db',
  },
  verbose: true,
  strict: true,
});
