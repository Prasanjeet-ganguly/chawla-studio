'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';

/**
 * Tracks a media query.
 *
 * Reads through `useSyncExternalStore`, which is the honest description of what
 * a media query is: external state React does not own. The server snapshot is
 * `false` so the markup matches, then the first client read settles on the real
 * value without a second render pass of its own.
 */
export function useMediaQuery(query: string): boolean {
  const list = useMemo(
    () => (typeof window === 'undefined' ? null : window.matchMedia(query)),
    [query]
  );

  const subscribe = useCallback(
    (notify: () => void) => {
      list?.addEventListener('change', notify);
      return () => list?.removeEventListener('change', notify);
    },
    [list]
  );

  return useSyncExternalStore(
    subscribe,
    () => list?.matches ?? false,
    () => false
  );
}

/** True when the visitor has asked the OS to reduce motion. */
export const useReducedMotion = (): boolean =>
  useMediaQuery('(prefers-reduced-motion: reduce)');

/** True on viewports narrow enough to warrant the simplified compositions. */
export const useIsMobile = (): boolean => useMediaQuery('(max-width: 47.99rem)');

/** True for devices without a fine pointer — no hover, no custom cursor. */
export const useIsTouch = (): boolean => useMediaQuery('(hover: none)');
