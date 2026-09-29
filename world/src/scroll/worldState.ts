/**
 * Scroll state shared with anything that animates from it. Plain mutable values,
 * not React state: they change every frame and are polled by animation loops.
 */
export const worldState = {
  /** page scroll progress, 0 at the top → 1 at the bottom (from Lenis) */
  scroll: 0,
  /** signed scroll speed in px/frame */
  velocity: 0,
};
