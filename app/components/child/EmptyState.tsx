import { BookOpen } from 'lucide-react';

/**
 * Icon-only placeholder shown when the active child has zero visible letters.
 *
 * Per PRD REQ-5.8 and the "no text instructions" core tenet, the child UI is
 * glyph-driven (pre-literate children). A large, centered BookOpen icon plus
 * generous vertical padding tells the child "this surface exists, but is empty
 * right now" without a single word.
 */
export function EmptyState() {
  return (
    <div
      role="img"
      aria-label="No letters available"
      className="flex items-center justify-center py-24"
    >
      <BookOpen className="h-24 w-24 text-sand-dark" strokeWidth={1.5} aria-hidden="true" />
    </div>
  );
}
