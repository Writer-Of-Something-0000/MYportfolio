import { useEffect } from 'react';
import Lenis from 'lenis';
import { worldState } from './worldState';

export const prefersReducedMotion = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Smooth page scroll (Lenis) feeding worldState.scroll. The page itself stays a
 * normal document — the 3D world only listens to how far down it is.
 */
export function useSmoothScroll(): void {
  useEffect(() => {
    // the reel always starts from the top: a restored mid-page scroll would drop
    // the visitor halfway down the timeline with the intro already gone
    history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);

    const lenis = new Lenis({
      autoRaf: true,
      // reduced motion: no easing, the page moves exactly with the wheel
      lerp: prefersReducedMotion() ? 1 : 0.09,
    });

    const sync = () => {
      worldState.scroll = lenis.progress || 0;
      worldState.velocity = lenis.velocity || 0;
    };
    lenis.on('scroll', sync);
    sync();

    return () => lenis.destroy();
  }, []);
}
