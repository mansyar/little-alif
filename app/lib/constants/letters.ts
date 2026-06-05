/**
 * Canonical source of truth for the 28 Hijaiyah letter IDs and metadata.
 *
 * Migrated from `app/db/schema.ts` so that validation, seed data, and UI
 * components all import from a single, domain-level constants file rather
 * than a database schema file.
 */

/**
 * 28 Hijaiyah letter IDs in canonical order (ا to ي).
 */
export const LETTER_IDS = [
  'alif',
  'ba',
  'ta',
  'tsa',
  'jim',
  'ha',
  'kho',
  'dal',
  'dzal',
  'ra',
  'zai',
  'sin',
  'syin',
  'shad',
  'dhad',
  'tha',
  'dzha',
  'ain',
  'ghain',
  'fa',
  'qaf',
  'kaf',
  'lam',
  'mim',
  'nun',
  'waw',
  'hae',
  'ya',
] as const;

export type LetterId = (typeof LETTER_IDS)[number];

/**
 * 28 deterministic soft pastel background colors keyed by `letterId`.
 *
 * Each cell stays soft and never competes with the dark glyph rendered
 * on top of it. Generated from LETTER_IDS to guarantee type safety and
 * completeness.
 */
export const LETTER_BG_COLORS: Record<LetterId, string> = {
  alif: 'bg-rose-100',
  ba: 'bg-orange-100',
  ta: 'bg-amber-100',
  tsa: 'bg-yellow-100',
  jim: 'bg-lime-100',
  ha: 'bg-green-100',
  kho: 'bg-emerald-100',
  dal: 'bg-teal-100',
  dzal: 'bg-cyan-100',
  ra: 'bg-sky-100',
  zai: 'bg-blue-100',
  sin: 'bg-indigo-100',
  syin: 'bg-violet-100',
  shad: 'bg-purple-100',
  dhad: 'bg-fuchsia-100',
  tha: 'bg-pink-100',
  dzha: 'bg-rose-200',
  ain: 'bg-orange-200',
  ghain: 'bg-amber-200',
  fa: 'bg-yellow-200',
  qaf: 'bg-lime-200',
  kaf: 'bg-green-200',
  lam: 'bg-emerald-200',
  mim: 'bg-teal-200',
  nun: 'bg-cyan-200',
  waw: 'bg-sky-200',
  hae: 'bg-blue-200',
  ya: 'bg-indigo-200',
};
