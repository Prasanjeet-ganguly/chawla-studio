'use client';

import { useEffect, useRef } from 'react';
import { useIsTouch, useReducedMotion } from './useMediaQuery';
import { usePointer } from './usePointer';
import { lerp } from '@/lib/utils';

/**
 * Pointer travel, in px. Both are deliberately tiny: the hero is a composed
 * photograph, and anything larger stops reading as a camera settling and starts
 * reading as a widget. The photograph moves against the pointer and the type
 * moves with it, which is what separates them into two planes.
 */
const BACKDROP_PULL = 5;
const CONTENT_PULL = 2;

/** Per-frame approach to the pointer — slow, so the drift is never a snap. */
const EASE = 0.055;

/**
 * The hero's depth: two layers that lean a few pixels toward the pointer.
 *
 * One animation frame drives both, written straight to `style.transform` so the
 * drift never costs a React render. The loop is parked while the hero is off
 * screen or the tab is hidden, and it is never started at all on touch devices
 * or under `prefers-reduced-motion` — in which case the transforms declared in
 * JSX stand, and the hero is simply still.
 */
export function useHeroParallax() {
  const section = useRef<HTMLElement>(null);
  const backdrop = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const pointer = usePointer();
  const reduced = useReducedMotion();
  const touch = useIsTouch();

  useEffect(() => {
    if (reduced || touch) return;

    const node = section.current;
    const at = { x: 0, y: 0 };
    let frame = 0;
    let onScreen = true;

    const tick = () => {
      const target = pointer.current ?? { x: 0, y: 0 };
      at.x = lerp(at.x, target.x, EASE);
      at.y = lerp(at.y, target.y, EASE);

      // The zoom stays in a custom property so the breakpoints can own it; only
      // the offset is written here.
      if (backdrop.current) {
        const x = (-at.x * BACKDROP_PULL).toFixed(2);
        const y = (-at.y * BACKDROP_PULL).toFixed(2);
        backdrop.current.style.transform = `translate3d(${x}px, ${y}px, 0) scale(var(--hero-zoom))`;
      }
      if (content.current) {
        const x = (at.x * CONTENT_PULL).toFixed(2);
        const y = (at.y * CONTENT_PULL).toFixed(2);
        content.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }

      frame = window.requestAnimationFrame(tick);
    };

    const sync = () => {
      const shouldRun = onScreen && !document.hidden;
      if (shouldRun && frame === 0) frame = window.requestAnimationFrame(tick);
      if (!shouldRun && frame !== 0) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      }
    };

    const observer =
      node && typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver(
            ([entry]) => {
              onScreen = Boolean(entry?.isIntersecting);
              sync();
            },
            { threshold: 0 }
          )
        : null;

    observer?.observe(node as HTMLElement);
    document.addEventListener('visibilitychange', sync);
    sync();

    return () => {
      if (frame !== 0) window.cancelAnimationFrame(frame);
      observer?.disconnect();
      document.removeEventListener('visibilitychange', sync);
    };
  }, [pointer, reduced, touch]);

  return { section, backdrop, content };
}
