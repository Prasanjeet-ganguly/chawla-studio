'use client';

import { useEffect } from 'react';
import { useReducedMotion } from '@/lib/hooks/useMediaQuery';

/** Matches `scroll-padding-top` in globals.css, so anchors clear the header. */
const HEADER_OFFSET = -96;

/**
 * Inertial scrolling, and nothing else.
 *
 * Loaded for its effect only — it renders no markup. Lenis is imported inside
 * the effect so the library never reaches a visitor who has asked for reduced
 * motion, and it drives its own rAF loop (`autoRaf`) which stops when the tab
 * is hidden. Removing this component leaves the site fully usable with the
 * browser's native scrolling.
 */
export function SmoothScroll() {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;

    let instance: { destroy: () => void } | null = null;
    let cancelled = false;

    void import('lenis').then(({ default: Lenis }) => {
      if (cancelled) return;
      instance = new Lenis({
        duration: 1.05,
        // Gentle exponential settle; no bounce, no rubber band.
        easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
        autoRaf: true,
        anchors: { offset: HEADER_OFFSET },
        // Let the lightbox and the mobile drawer scroll natively inside.
        prevent: (node) => node.hasAttribute?.('data-lenis-prevent') ?? false,
      });
    });

    return () => {
      cancelled = true;
      instance?.destroy();
    };
  }, [reduced]);

  return null;
}
