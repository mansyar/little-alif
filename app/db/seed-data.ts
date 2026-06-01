import type { LetterId } from './schema';

/**
 * Seed data for the 28 Hijaiyah letters.
 *
 * Order and IDs follow docs/tdd.md §6 with one correction: the soft ه
 * (hāʼ) is named `hae` to avoid a primary-key collision with the
 * throaty ح (also transliterated `ha`). The TDD's seed table on line 739
 * has a duplicate `ha` id bug; we follow the TDD's stated intent from
 * line 303 ('ha' = ح, 'hae' = ه).
 */
export interface SeedLetter {
  readonly id: LetterId;
  readonly character: string;
  readonly displayOrder: number;
  readonly audioFiles: {
    none: string;
    fathah: string;
    kasrah: string;
    dammah: string;
  };
}

export const SEED_LETTERS: readonly SeedLetter[] = [
  { id: 'alif', character: 'ا', displayOrder: 1, audioFiles: { none: 'alif.mp3', fathah: 'alif_fathah.mp3', kasrah: 'alif_kasrah.mp3', dammah: 'alif_dammah.mp3' } },
  { id: 'ba',   character: 'ب', displayOrder: 2, audioFiles: { none: 'ba.mp3', fathah: 'ba_fathah.mp3', kasrah: 'ba_kasrah.mp3', dammah: 'ba_dammah.mp3' } },
  { id: 'ta',   character: 'ت', displayOrder: 3, audioFiles: { none: 'ta.mp3', fathah: 'ta_fathah.mp3', kasrah: 'ta_kasrah.mp3', dammah: 'ta_dammah.mp3' } },
  { id: 'tsa',  character: 'ث', displayOrder: 4, audioFiles: { none: 'tsa.mp3', fathah: 'tsa_fathah.mp3', kasrah: 'tsa_kasrah.mp3', dammah: 'tsa_dammah.mp3' } },
  { id: 'jim',  character: 'ج', displayOrder: 5, audioFiles: { none: 'jim.mp3', fathah: 'jim_fathah.mp3', kasrah: 'jim_kasrah.mp3', dammah: 'jim_dammah.mp3' } },
  { id: 'ha',   character: 'ح', displayOrder: 6, audioFiles: { none: 'ha.mp3', fathah: 'ha_fathah.mp3', kasrah: 'ha_kasrah.mp3', dammah: 'ha_dammah.mp3' } },
  { id: 'kho',  character: 'خ', displayOrder: 7, audioFiles: { none: 'kho.mp3', fathah: 'kho_fathah.mp3', kasrah: 'kho_kasrah.mp3', dammah: 'kho_dammah.mp3' } },
  { id: 'dal',  character: 'د', displayOrder: 8, audioFiles: { none: 'dal.mp3', fathah: 'dal_fathah.mp3', kasrah: 'dal_kasrah.mp3', dammah: 'dal_dammah.mp3' } },
  { id: 'dzal', character: 'ذ', displayOrder: 9, audioFiles: { none: 'dzal.mp3', fathah: 'dzal_fathah.mp3', kasrah: 'dzal_kasrah.mp3', dammah: 'dzal_dammah.mp3' } },
  { id: 'ra',   character: 'ر', displayOrder: 10, audioFiles: { none: 'ra.mp3', fathah: 'ra_fathah.mp3', kasrah: 'ra_kasrah.mp3', dammah: 'ra_dammah.mp3' } },
  { id: 'zai',  character: 'ز', displayOrder: 11, audioFiles: { none: 'zai.mp3', fathah: 'zai_fathah.mp3', kasrah: 'zai_kasrah.mp3', dammah: 'zai_dammah.mp3' } },
  { id: 'sin',  character: 'س', displayOrder: 12, audioFiles: { none: 'sin.mp3', fathah: 'sin_fathah.mp3', kasrah: 'sin_kasrah.mp3', dammah: 'sin_dammah.mp3' } },
  { id: 'syin', character: 'ش', displayOrder: 13, audioFiles: { none: 'syin.mp3', fathah: 'syin_fathah.mp3', kasrah: 'syin_kasrah.mp3', dammah: 'syin_dammah.mp3' } },
  { id: 'shad', character: 'ص', displayOrder: 14, audioFiles: { none: 'shad.mp3', fathah: 'shad_fathah.mp3', kasrah: 'shad_kasrah.mp3', dammah: 'shad_dammah.mp3' } },
  { id: 'dhad', character: 'ض', displayOrder: 15, audioFiles: { none: 'dhad.mp3', fathah: 'dhad_fathah.mp3', kasrah: 'dhad_kasrah.mp3', dammah: 'dhad_dammah.mp3' } },
  { id: 'tha',  character: 'ط', displayOrder: 16, audioFiles: { none: 'tha.mp3', fathah: 'tha_fathah.mp3', kasrah: 'tha_kasrah.mp3', dammah: 'tha_dammah.mp3' } },
  { id: 'dzha', character: 'ظ', displayOrder: 17, audioFiles: { none: 'dzha.mp3', fathah: 'dzha_fathah.mp3', kasrah: 'dzha_kasrah.mp3', dammah: 'dzha_dammah.mp3' } },
  { id: 'ain',  character: 'ع', displayOrder: 18, audioFiles: { none: 'ain.mp3', fathah: 'ain_fathah.mp3', kasrah: 'ain_kasrah.mp3', dammah: 'ain_dammah.mp3' } },
  { id: 'ghain', character: 'غ', displayOrder: 19, audioFiles: { none: 'ghain.mp3', fathah: 'ghain_fathah.mp3', kasrah: 'ghain_kasrah.mp3', dammah: 'ghain_dammah.mp3' } },
  { id: 'fa',   character: 'ف', displayOrder: 20, audioFiles: { none: 'fa.mp3', fathah: 'fa_fathah.mp3', kasrah: 'fa_kasrah.mp3', dammah: 'fa_dammah.mp3' } },
  { id: 'qaf',  character: 'ق', displayOrder: 21, audioFiles: { none: 'qaf.mp3', fathah: 'qaf_fathah.mp3', kasrah: 'qaf_kasrah.mp3', dammah: 'qaf_dammah.mp3' } },
  { id: 'kaf',  character: 'ك', displayOrder: 22, audioFiles: { none: 'kaf.mp3', fathah: 'kaf_fathah.mp3', kasrah: 'kaf_kasrah.mp3', dammah: 'kaf_dammah.mp3' } },
  { id: 'lam',  character: 'ل', displayOrder: 23, audioFiles: { none: 'lam.mp3', fathah: 'lam_fathah.mp3', kasrah: 'lam_kasrah.mp3', dammah: 'lam_dammah.mp3' } },
  { id: 'mim',  character: 'م', displayOrder: 24, audioFiles: { none: 'mim.mp3', fathah: 'mim_fathah.mp3', kasrah: 'mim_kasrah.mp3', dammah: 'mim_dammah.mp3' } },
  { id: 'nun',  character: 'ن', displayOrder: 25, audioFiles: { none: 'nun.mp3', fathah: 'nun_fathah.mp3', kasrah: 'nun_kasrah.mp3', dammah: 'nun_dammah.mp3' } },
  { id: 'waw',  character: 'و', displayOrder: 26, audioFiles: { none: 'waw.mp3', fathah: 'waw_fathah.mp3', kasrah: 'waw_kasrah.mp3', dammah: 'waw_dammah.mp3' } },
  { id: 'hae',  character: 'ه', displayOrder: 27, audioFiles: { none: 'hae.mp3', fathah: 'hae_fathah.mp3', kasrah: 'hae_kasrah.mp3', dammah: 'hae_dammah.mp3' } },
  { id: 'ya',   character: 'ي', displayOrder: 28, audioFiles: { none: 'ya.mp3', fathah: 'ya_fathah.mp3', kasrah: 'ya_kasrah.mp3', dammah: 'ya_dammah.mp3' } },
] as const;
