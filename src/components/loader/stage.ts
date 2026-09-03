import type { CSSProperties } from 'react';

/**
 * The loading screen's entrance, as a running clock in milliseconds.
 *
 * The order is the order the eye should assemble the frame: the photograph is
 * already there, then the camera mark, the name, the discipline under it, the
 * promise, the bar the visitor is actually waiting on, the figures, and last the
 * line at the foot of the frame. Everything is composed inside 1.3 seconds — this
 * is a title card, not an interlude, and it has to be finished before the page
 * behind it is ready to take over.
 */
export const LOADER_STAGE = {
  backdrop: 0,
  mark: 80,
  brand: 180,
  subtitle: 280,
  tagline: 370,
  progress: 460,
  stats: 550,
  quote: 640,
} as const;

/**
 * Faster than the hero's 1.2s rise, for the same reason the delays are tighter:
 * a curtain that is still arriving when it has to leave reads as a stutter.
 */
export const LOADER_RISE =
  'transition-[opacity,transform] duration-[640ms] ease-[var(--ease-out-expo)]';

/** Where a staged element sits before and after it is let in. */
export const loaderRisen = (shown: boolean): string =>
  shown ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0';

/**
 * A stage delay, or none at all.
 *
 * globals.css collapses transition *durations* under `prefers-reduced-motion` but
 * not delays — left alone, a staggered composition would become a sequence of
 * instant pops, which is worse than arriving all at once. So when motion is
 * reduced the whole frame is simply already there.
 */
export const staged = (ms: number, reduced: boolean): CSSProperties => ({
  transitionDelay: reduced ? '0ms' : `${ms}ms`,
});
