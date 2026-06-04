/**
 * Gesture timings for the child-route Parent Gate.
 *
 * The Parent Gate is a hidden low-contrast lock icon in the top-right of
 * `/learn` and `/learn/reading`. It is intentionally invisible to a 3-year-old
 * in normal use but is unlockable by a parent via one of two gestures:
 *
 *  - Long-press: hold the icon for PARENT_GATE_LONG_PRESS_MS (with up to
 *    100ms of allowed movement tolerance). A subtle progress ring fills
 *    during the hold so a parent can see it working.
 *
 *  - Rapid-tap: tap the icon PARENT_GATE_TAP_COUNT times within
 *    PARENT_GATE_TAP_WINDOW_MS. This is a fallback for parents who can't
 *    long-press (e.g. motor difficulties, hardware mouse vs. touch).
 *
 * Both gestures are designed to be hard to trigger accidentally by a child.
 */

/** How long the parent must hold the lock icon to unlock the gate. */
export const PARENT_GATE_LONG_PRESS_MS = 1500;

/** Maximum delay (ms) between consecutive taps of the rapid-tap fallback. */
export const PARENT_GATE_TAP_WINDOW_MS = 1000;

/** Number of rapid taps required to unlock the gate. */
export const PARENT_GATE_TAP_COUNT = 3;
