import type { CSSProperties } from 'react';

/**
 * The shared entrance transition, used by the hero and the loading screen.
 *
 * Kept in one place because Tailwind's `transition-*` and `duration-*` utilities
 * are mutually exclusive — two elements each bringing their own would be resolved
 * by stylesheet order rather than by intent. Under `prefers-reduced-motion`
 * globals.css collapses the duration to nothing, so a staged composition simply
 * arrives complete.
 */
export const RISE =
  'transition-[opacity,transform] duration-[1200ms] ease-[var(--ease-out-expo)]';

/** Where a staged element sits before and after it is let in. */
export const risen = (shown: boolean): string =>
  shown ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0';

/** Delays only exist at runtime, so Tailwind cannot see them. */
export const after = (ms: number): CSSProperties => ({ transitionDelay: `${ms}ms` });
