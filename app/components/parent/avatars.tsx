import type { AvatarKey } from '~/db/schema';
import type { SVGProps } from 'react';

/**
 * Alif-lamp: A classic oil lamp shape.
 */
export function AlifLamp(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="32" cy="32" r="30" fill="#FFF3E0" stroke="#F57C00" strokeWidth="2" />
      <path d="M32 14c-2 0-4 2-4 6v4h8v-4c0-4-2-6-4-6z" fill="#FFB74D" />
      <rect x="28" y="24" width="8" height="12" rx="2" fill="#FF8F00" />
      <rect x="26" y="36" width="12" height="3" rx="1" fill="#E65100" />
      <rect x="30" y="39" width="4" height="4" rx="1" fill="#E65100" />
      <path d="M28 43h8l1 4H27l1-4z" fill="#F57C00" />
      <circle cx="36" cy="18" r="3" fill="#FFF9C4" opacity="0.8" />
    </svg>
  );
}

/**
 * Ba-boat: A simple sailboat.
 */
export function BaBoat(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="32" cy="32" r="30" fill="#E3F2FD" stroke="#1976D2" strokeWidth="2" />
      <path d="M16 44l6-20h4l6 20H16z" fill="#64B5F6" />
      <rect x="22" y="24" width="4" height="20" rx="1" fill="#1565C0" />
      <path d="M26 26l10-4v18l-10-4V26z" fill="#90CAF9" />
      <path d="M14 44h36v4H14v-4z" fill="#0D47A1" rx="1" />
      <circle cx="42" cy="22" r="2" fill="#BBDEFB" />
    </svg>
  );
}

/**
 * Ta-table: A small wooden table.
 */
export function TaTable(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="32" cy="32" r="30" fill="#FBE9E7" stroke="#D84315" strokeWidth="2" />
      <rect x="14" y="22" width="36" height="4" rx="2" fill="#8D6E63" />
      <rect x="18" y="14" width="4" height="8" rx="1" fill="#A1887F" />
      <rect x="42" y="14" width="4" height="8" rx="1" fill="#A1887F" />
      <rect x="18" y="38" width="4" height="8" rx="1" fill="#A1887F" />
      <rect x="42" y="38" width="4" height="8" rx="1" fill="#A1887F" />
      <rect x="14" y="46" width="36" height="3" rx="1.5" fill="#6D4C41" />
      <rect x="28" y="26" width="8" height="12" rx="1" fill="#FFCC80" opacity="0.6" />
    </svg>
  );
}

/**
 * Tsa-butterfly: A colorful butterfly.
 */
export function TsaButterfly(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="32" cy="32" r="30" fill="#F3E5F5" stroke="#7B1FA2" strokeWidth="2" />
      <ellipse cx="22" cy="26" rx="10" ry="14" fill="#CE93D8" />
      <ellipse cx="42" cy="26" rx="10" ry="14" fill="#BA68C8" />
      <ellipse cx="22" cy="26" rx="6" ry="10" fill="#E1BEE7" />
      <ellipse cx="42" cy="26" rx="6" ry="10" fill="#CE93D8" />
      <rect x="30" y="20" width="4" height="24" rx="2" fill="#4A148C" />
      <circle cx="32" cy="18" r="3" fill="#4A148C" />
      <path d="M26 14l-4-2M38 14l4-2" stroke="#7B1FA2" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="20" cy="14" r="2" fill="#FFAB91" opacity="0.7" />
      <circle cx="44" cy="14" r="2" fill="#FFAB91" opacity="0.7" />
    </svg>
  );
}

/**
 * Jim-mountain: A stylized mountain peak.
 */
export function JimMountain(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="32" cy="32" r="30" fill="#E8F5E9" stroke="#388E3C" strokeWidth="2" />
      <path d="M10 48h44L38 20l-6 10-8-14L10 48z" fill="#66BB6A" />
      <path d="M24 30l-6 18h12l-6-18z" fill="#43A047" />
      <path d="M38 20l6 28H28l10-28z" fill="#81C784" />
      <path d="M32 30l-4 8h8l-4-8z" fill="#2E7D32" opacity="0.5" />
      <circle cx="38" cy="20" r="3" fill="#C8E6C9" />
      <path d="M20 38h24" stroke="#1B5E20" strokeWidth="1" strokeDasharray="2 2" />
    </svg>
  );
}

/**
 * Ha-jar: A small clay jar.
 */
export function HaJar(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="32" cy="32" r="30" fill="#FFF8E1" stroke="#F9A825" strokeWidth="2" />
      <path d="M22 30c0-8 4-16 10-16s10 8 10 16v14H22V30z" fill="#FFCC80" />
      <ellipse cx="32" cy="30" rx="10" ry="4" fill="#FFB74D" />
      <rect x="28" y="14" width="8" height="4" rx="2" fill="#F57C00" />
      <path d="M24 44h16l2 4H22l2-4z" fill="#E65100" />
      <circle cx="30" cy="28" r="1.5" fill="#BF360C" opacity="0.4" />
      <circle cx="36" cy="32" r="1.5" fill="#BF360C" opacity="0.4" />
      <ellipse cx="32" cy="44" rx="12" ry="2" fill="#F57C00" />
    </svg>
  );
}

/**
 * Kho-hat: A simple top hat.
 */
export function KhoHat(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="32" cy="32" r="30" fill="#ECEFF1" stroke="#546E7A" strokeWidth="2" />
      <rect x="14" y="34" width="36" height="6" rx="3" fill="#607D8B" />
      <rect x="20" y="14" width="24" height="22" rx="4" fill="#78909C" />
      <rect x="20" y="14" width="24" height="4" rx="2" fill="#546E7A" />
      <rect x="22" y="18" width="20" height="14" rx="2" fill="#90A4AE" />
      <rect x="14" y="36" width="36" height="4" rx="2" fill="#455A64" />
      <circle cx="32" cy="46" r="3" fill="#CFD8DC" />
    </svg>
  );
}

/**
 * Dal-book: An open book.
 */
export function DalBook(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="32" cy="32" r="30" fill="#E0F2F1" stroke="#00796B" strokeWidth="2" />
      <path d="M12 16h18v32H12V16z" fill="#80CBC4" />
      <path d="M34 16h18v32H34V16z" fill="#4DB6AC" />
      <path d="M12 16h18v2H12v-2zM34 16h18v2H34v-2z" fill="#004D40" />
      <line x1="21" y1="22" x2="21" y2="40" stroke="#004D40" strokeWidth="1" opacity="0.3" />
      <line x1="43" y1="22" x2="43" y2="40" stroke="#004D40" strokeWidth="1" opacity="0.3" />
      <rect x="24" y="24" width="4" height="2" rx="0.5" fill="#004D40" opacity="0.5" />
      <rect x="36" y="24" width="4" height="2" rx="0.5" fill="#004D40" opacity="0.5" />
      <rect x="24" y="28" width="4" height="2" rx="0.5" fill="#004D40" opacity="0.5" />
      <rect x="36" y="28" width="4" height="2" rx="0.5" fill="#004D40" opacity="0.5" />
      <path d="M30 16l2-2 2 2" fill="#00796B" />
    </svg>
  );
}

/**
 * Avatar key to component mapping.
 */
export const AVATAR_MAP: Record<AvatarKey, React.ComponentType<SVGProps<SVGSVGElement>>> = {
  'alif-lamp': AlifLamp,
  'ba-boat': BaBoat,
  'ta-table': TaTable,
  'tsa-butterfly': TsaButterfly,
  'jim-mountain': JimMountain,
  'ha-jar': HaJar,
  'kho-hat': KhoHat,
  'dal-book': DalBook,
};
