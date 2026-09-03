'use client';

import { useEffect } from 'react';

/**
 * Freezes the page behind an open drawer or lightbox.
 *
 * The scrollbar's width is handed back as padding so the layout does not jump
 * sideways when it disappears, and the previous inline styles are restored on
 * unlock rather than being cleared — nesting two locks stays safe.
 */
export function useLockBodyScroll(locked: boolean): void {
  useEffect(() => {
    if (!locked) return;

    const { body } = document;
    const previousOverflow = body.style.overflow;
    const previousPadding = body.style.paddingRight;
    const gap = window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = 'hidden';
    if (gap > 0) body.style.paddingRight = `${gap}px`;

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPadding;
    };
  }, [locked]);
}
