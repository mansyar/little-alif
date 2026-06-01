# Product Guidelines

## Design Language

Warm, inviting, and intentionally minimal. The UI should feel like a cozy learning corner — not a game, not a schoolroom. Earthy tones and soft gradients create a calm, distraction-free environment.

### Color Palette

| Token           | Hex                           | Usage                                        |
| --------------- | ----------------------------- | -------------------------------------------- |
| Sand            | `#E8D5B7`                     | Warm accent, decorative elements             |
| Sand Light      | `#F5EDE0`                     | Subtle backgrounds, hover states             |
| Sand Dark       | `#C9B394`                     | Borders, dividers                            |
| Green           | `#2D6A4F`                     | Primary actions, parent UI accents, ON state |
| Green Light     | `#40916C`                     | Hover states, highlights                     |
| Green Dark      | `#1B4332`                     | Active states, pressed buttons               |
| Orange          | `#F4A261`                     | Child mode accents, Reading Practice button  |
| Orange Light    | `#F7B977`                     | Hover states                                 |
| Coral           | `#E76F51`                     | Destructive actions, delete buttons          |
| Background Warm | `#FAF8F5`                     | Page backgrounds                             |
| Card Background | `#FFFFFF`                     | Cards, modals, form areas                    |
| Text Dark       | `#1A1A2E`                     | Primary text                                 |
| Text Muted      | `#8A8A9A`                     | Secondary text, labels                       |
| Radius          | `16px`                        | Card corner radius                           |
| Radius Small    | `10px`                        | Button/form corner radius                    |
| Radius Large    | `24px`                        | Screen container radius                      |
| Shadow          | `0 2px 16px rgba(0,0,0,0.06)` | Card shadows                                 |
| Shadow Large    | `0 8px 32px rgba(0,0,0,0.1)`  | Modal/dialog shadows                         |

### Typography

- **Latin Text:** Nunito (400, 600, 700, 800 weights) — friendly, rounded sans-serif
- **Arabic Text:** Cairo (400, 600, 700, 900 weights) — clear Arabic glyph rendering with proper diacritic support
- **Font Loading:** Cairo preloaded with `<link rel="preload">` and `font-display: block` to eliminate FOUT/FOIT
- **Body Size:** 15–16px for parent UI
- **Arabic Glyph Size:** 28–38px on letter cards, 120px during full-screen playback

## UX Principles

### For the Child (Pre-literate, ages 3–6)

1. **Zero Text Instructions:** Children cannot read. All feedback must be visual or auditory.
2. **Large Touch Targets:** Minimum 64x64dp tap area, preferably larger on tablets.
3. **Instant Feedback:** Tap → action within 150ms (especially audio playback).
4. **Single Purpose:** Each screen has one clear action. No menus, no settings visible to the child.
5. **Safe Exploration:** Every interaction is reversible. No destructive actions in child mode.
6. **Consistent Patterns:** Letters always behave the same way. Predictable = comfortable.

### For the Parent

1. **Parent-Led Control:** Parent decides what the child sees. The app never auto-advances.
2. **Clear Status:** Dashboard shows exactly which letters are visible per child and which vowel mode is active.
3. **Bilingual UI:** Toggle between English and Indonesian via a persistent cookie.
4. **Simple CRUD:** Add/edit/delete child profiles with minimal friction.
5. **Transparent State:** Toggle state reads from database, not client cache. No sync confusion.

## Accessibility

- **WCAG AA Target:** All interactive elements meet contrast and touch target requirements
- **High Contrast:** Text maintains sufficient contrast against all background colors
- **Reduced Motion:** Respect `prefers-reduced-motion` — animations are optional enhancements
- **Keyboard Navigation:** Radix UI primitives provide keyboard interaction by default for parent UI
- **Screen Readers:** Radix UI components include ARIA attributes. Arabic glyphs use appropriate alt text.

## Mobile-First Responsive

- **Primary Breakpoint:** Portrait phone (360px+) — default layout
- **Secondary:** Landscape phone and small tablets (768px+)
- **Tertiary:** Large tablets and desktops (1024px+) — content remains centered, max-width constrained
- **Touch First:** All interactive elements designed for finger taps, not mouse clicks
- **No Hover Dependency:** Critical interactions never require hover

## Voice & Tone

- **Warm and Encouraging** but not childish — respects the learner
- **Minimal text** in child-facing UI — icons and glyphs communicate intent
- **Clear and direct** in parent-facing UI — parents need efficiency, not fluff
- **Bilingual parity:** English and Indonesian translations should convey the same tone

## Audio Guidelines

- **Latency Target:** Tap to audible playback < 150ms
- **Preload Strategy:** Visible letters' audio first, remaining on idle
- **Fallback:** Graceful degradation if audio unavailable — no error state, just silent interaction
- **Duration:** 1–2 seconds per letter+vowel combination
- **Format:** MP3 (128kbps CBR, 44.1kHz, mono) or Web Speech API

## Branding

- **Logo:** Stylized لا (Lam-Alif ligature) in green gradient box
- **App Name:** "Little Alif" — lowercase 'L' in "Little", uppercase 'A' in "Alif"
- **Tagline:** "Introducing the Arabic alphabet, one letter at a time."
- **Icon Library:** Lucide React for consistent, lightweight SVG icons
- **Avatar Set:** 8 themed illustrations (Alif-lamp, Ba-boat, Ta-table, Tsa-butterfly, Jim-mountain, Ha-jar, Kho-hat, Dal-book)
