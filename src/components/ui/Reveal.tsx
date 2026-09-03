'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cx } from '@/lib/utils';

type RevealProps = {
  children: ReactNode;
  /** Seconds to wait after the element enters view. Used to stagger siblings. */
  delay?: number;
  /** `fade` moves and fades; `clip` wipes a mask upward, for photographs. */
  variant?: 'fade' | 'clip';
  as?: 'div' | 'section' | 'li' | 'figure' | 'span';
  className?: string;
};

/**
 * Reveals its children the first time they scroll into view, then stops
 * observing. One observer per element keeps this cheap and, unlike a
 * scroll-position library, it costs nothing while idle.
 *
 * Under `prefers-reduced-motion` the CSS in globals.css collapses the
 * transition to zero, so content still appears — just immediately.
 */
export function Reveal({
  children,
  delay = 0,
  variant = 'fade',
  as: Tag = 'div',
  className,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // No IntersectionObserver (or a very old browser): show immediately. The
    // microtask keeps this out of the effect's own render pass — the element is
    // visible either way, and React never has to re-run the tree twice in a row.
    if (typeof IntersectionObserver === 'undefined') {
      queueMicrotask(() => setShown(true));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            observer.disconnect();
          }
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.05 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const base =
    variant === 'clip'
      ? 'clip-reveal'
      : 'transition-[opacity,transform] duration-[900ms] ease-[var(--ease-out-expo)]';

  const state =
    variant === 'clip'
      ? undefined
      : shown
        ? 'opacity-100 translate-y-0'
        : 'opacity-0 translate-y-6';

  return (
    <Tag
      ref={ref as React.Ref<never>}
      data-shown={shown}
      className={cx(base, state, className)}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </Tag>
  );
}
