'use client';

import { useEffect, useRef } from 'react';
import { Photo } from '@/components/ui/Photo';
import { Reveal } from '@/components/ui/Reveal';
import { describe } from '@/lib/data/captions';
import { useIsTouch, useReducedMotion } from '@/lib/hooks/useMediaQuery';
import { usePointer } from '@/lib/hooks/usePointer';
import { allProjectPhotoIds, projects } from '@/lib/data/projects';
import { pickSpread } from '@/lib/photos';
import { frameNumber, lerp } from '@/lib/utils';

/** The four things the studio actually photographs. */
const TENETS = [
  { word: 'Light', line: 'We wait for it, we shape it, and we never fake it.' },
  { word: 'Moments', line: 'The unrehearsed half-second between two rehearsed ones.' },
  { word: 'People', line: 'The photograph is about them. Never about the camera.' },
  { word: 'Stories', line: 'A day has an order of its own. We keep it.' },
] as const;

/** Frames for the strip, spread across every series in the library. */
const STRIP = pickSpread(allProjectPhotoIds, 10, 3);

/**
 * The statement of intent, and the film strip under it.
 *
 * Each word drifts a few pixels against the pointer at its own rate, which gives
 * the block parallax without animating anything on a timer. The whole effect
 * lives in one animation frame loop that writes transforms directly — React
 * never re-renders while the pointer moves — and the loop is never started at
 * all on touch or under reduced motion, where the pointer ref stays at origin.
 */
export function PhilosophySection() {
  const section = useRef<HTMLElement>(null);
  const words = useRef<Array<HTMLSpanElement | null>>([]);
  const pointer = usePointer();
  const touch = useIsTouch();
  const reduced = useReducedMotion();

  useEffect(() => {
    // Nothing to drive: the pointer ref is pinned at origin in both cases.
    if (touch || reduced) return;

    const node = section.current;
    let frame = 0;
    const offsets = TENETS.map(() => 0);

    const tick = () => {
      const { x } = pointer.current;
      words.current.forEach((word, index) => {
        if (!word) return;
        // Alternating depth: odd rows lag and travel further.
        const depth = index % 2 === 0 ? 10 : 22;
        offsets[index] = lerp(offsets[index] ?? 0, x * depth, 0.06);
        word.style.transform = `translate3d(${(offsets[index] ?? 0).toFixed(2)}px, 0, 0)`;
      });
      frame = window.requestAnimationFrame(tick);
    };

    const start = () => {
      if (frame === 0) frame = window.requestAnimationFrame(tick);
    };
    const stop = () => {
      window.cancelAnimationFrame(frame);
      frame = 0;
    };

    // Only spend frames while the words are actually on screen.
    if (!node || typeof IntersectionObserver === 'undefined') {
      start();
      return stop;
    }

    const observer = new IntersectionObserver(
      ([entry]) => (entry?.isIntersecting ? start() : stop()),
      { rootMargin: '10% 0px' }
    );
    observer.observe(node);

    return () => {
      observer.disconnect();
      stop();
    };
  }, [pointer, touch, reduced]);

  return (
    <section
      ref={section}
      id="philosophy"
      aria-labelledby="philosophy-title"
      className="rebate-grid py-20 sm:py-24 md:py-36"
    >
      <p className="rebate-mark self-start pt-2">
        {projects.length} series · {allProjectPhotoIds.length} frames
      </p>

      <div className="shell">
        <Reveal>
          <p className="eyebrow text-gold">What we photograph</p>
          <h2 id="philosophy-title" className="sr-only">
            Our approach
          </h2>
        </Reveal>

        <dl className="mt-8 flex flex-col gap-8 sm:mt-12 sm:gap-10 md:gap-14">
          {TENETS.map((tenet, index) => (
            <Reveal
              key={tenet.word}
              delay={index * 0.06}
              className="grid items-baseline gap-2 border-b border-hairline/40 pb-6 sm:border-0 sm:pb-0 md:grid-cols-[minmax(0,1fr)_20rem] md:gap-12"
            >
              <dt>
                <span
                  ref={(node) => {
                    words.current[index] = node;
                  }}
                  className="block font-display uppercase leading-[0.9] text-display-m sm:text-display-l text-ivory"
                >
                  {tenet.word}
                </span>
              </dt>
              <dd className="max-w-sm text-sm leading-relaxed text-paper-dim md:pb-3">{tenet.line}</dd>
            </Reveal>
          ))}
        </dl>
      </div>

      {/* The contact strip: every series, edge to edge, dragged by hand. */}
      <div className="col-span-full mt-16 sm:mt-20 md:mt-28">
        <ul
          data-lenis-prevent
          className="no-scrollbar snap-rail flex list-none gap-4 overflow-x-auto px-gutter pb-4"
        >
          {STRIP.map((id, index) => (
            <li key={id} className="w-[74vw] shrink-0 sm:w-[38vw] lg:w-[23vw]">
              <Photo id={id} alt={describe(id)} sizes="(min-width: 1024px) 23vw, 74vw" />
              <p className="mt-3 eyebrow text-paper-dim">{frameNumber(index)}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
