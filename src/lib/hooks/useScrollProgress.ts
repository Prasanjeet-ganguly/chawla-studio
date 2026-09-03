'use client';

import { useEffect, useRef, useState } from 'react';
import { clamp } from '@/lib/utils';

/**
 * How far the page has been read, 0 → 1.
 *
 * Written to a ref *and* to state: the 3D hero reads the ref every frame
 * without re-rendering React, while chrome that genuinely needs to re-render
 * (the progress hairline) subscribes to the state. Updates are coalesced into
 * one rAF per scroll burst.
 */
export function useScrollProgress(): { progress: number; ref: React.RefObject<number> } {
  const ref = useRef(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;

    const measure = () => {
      frame = 0;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const next = scrollable > 0 ? clamp(window.scrollY / scrollable, 0, 1) : 0;
      ref.current = next;
      setProgress(next);
    };

    const onScroll = () => {
      if (frame === 0) frame = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return { progress, ref };
}
