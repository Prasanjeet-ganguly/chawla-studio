'use client';

import { useEffect, useRef, useState } from 'react';
import { LoaderBackground } from './LoaderBackground';
import { LoaderLogo } from './LoaderLogo';
import { LoaderMotes } from './LoaderMotes';
import { LoaderProgress } from './LoaderProgress';
import { LoaderQuote } from './LoaderQuote';
import { LoaderStats } from './LoaderStats';
import { LoaderTagline } from './LoaderTagline';
import { criticalAssets } from './tasks';
import { useAssetProgress } from './useAssetProgress';
import { useLockBodyScroll } from '@/lib/hooks/useLockBodyScroll';
import { useReducedMotion } from '@/lib/hooks/useMediaQuery';
import { finishIntro, isIntroFinished } from '@/lib/loading-state';
import { loadingScreen } from '@/lib/site.config';
import { cx } from '@/lib/utils';

/**
 * The cinematic curtain: the studio's frame, its name, and the real state of the
 * page arriving behind it.
 *
 * Three rules govern the timing, and none of them is a fixed wait. The bar
 * follows genuine asset readiness (fonts, the images the components have marked
 * critical, the loader's own first frame — see tasks.ts). `minVisible` stops the
 * screen flashing past on a warm cache, and `maxVisible` is a hard release, so a
 * stalled request cannot strand the visitor. When motion is reduced the whole
 * composition is simply already assembled and the minimum drops, because there
 * is no entrance left to watch.
 *
 * The visuals are `aria-hidden` and one live region carries the state in words —
 * a per-cent counter announced on every frame would be unusable. There is no
 * focus trap: nothing here is focusable, so a keyboard lands in the page beneath
 * as soon as the curtain leaves.
 */
export function CinematicLoader() {
  // A client navigation back to the home route must not replay the intro; the
  // hand-off flag is module state and survives it. On a full load it is false.
  const [gone, setGone] = useState(isIntroFinished);
  const [shown, setShown] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const startedAt = useRef(0);

  const reduced = useReducedMotion();
  const { percent, ready } = useAssetProgress(criticalAssets);
  const { timing } = loadingScreen;

  useLockBodyScroll(!gone);

  // One frame between the first paint and the entrance, so the staged reveal has
  // a state to transition *from*. The hard release is armed here, at the same
  // moment the clock starts.
  useEffect(() => {
    startedAt.current = performance.now();
    const frame = requestAnimationFrame(() => setShown(true));
    const hard = window.setTimeout(() => setLeaving(true), timing.maxVisible);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(hard);
    };
  }, [timing.maxVisible]);

  // Released when the assets have settled *and* the number the visitor is
  // watching has caught up with them — a curtain that lifts at 94% looks like a
  // bug, however honest the count behind it was.
  const settled = ready && percent >= 100;

  useEffect(() => {
    if (!settled || leaving) return;

    const floor = reduced ? timing.minVisibleReduced : timing.minVisible;
    const remaining = Math.max(0, floor - (performance.now() - startedAt.current));
    const id = window.setTimeout(() => setLeaving(true), remaining);

    return () => window.clearTimeout(id);
  }, [settled, leaving, reduced, timing.minVisible, timing.minVisibleReduced]);

  // The page's own entrance starts with the fade, not after it, so the hero is
  // already rising as the curtain thins. Unmounting waits for the fade to finish
  // — with motion reduced there is nothing to wait for, and holding an invisible
  // overlay over the page would swallow the first click.
  useEffect(() => {
    if (!leaving) return;

    finishIntro();
    const id = window.setTimeout(() => setGone(true), reduced ? 60 : timing.exit);

    return () => window.clearTimeout(id);
  }, [leaving, reduced, timing.exit]);

  if (gone) return null;

  // Coarse enough that a screen reader hears at most five updates for a screen
  // that lives for a second and a half.
  const quartile = Math.min(100, Math.floor(percent / 25) * 25);

  return (
    <div
      id="cinematic-loader"
      className={cx(
        'fixed inset-0 z-[100] overflow-hidden transition-[opacity,transform] ease-[var(--ease-out-expo)]',
        leaving ? 'pointer-events-none scale-[1.04] opacity-0' : 'scale-100 opacity-100'
      )}
      style={{ transitionDuration: `${timing.exit}ms` }}
    >
      {/* Without scripting nothing can ever dismiss this, so it is never shown. */}
      <noscript
        dangerouslySetInnerHTML={{
          __html: '<style>#cinematic-loader{display:none!important}</style>',
        }}
      />

      <LoaderBackground shown={shown} reduced={reduced} />
      {reduced ? null : <LoaderMotes />}

      {/* Centred, but scrollable rather than clipped: a landscape phone is 375px
          tall and this composition is taller than that, and losing the closing
          line off the bottom of the frame would be worse than a scroll the
          visitor almost never needs. Vertical only — nothing here is wider than
          its column. */}
      <div
        aria-hidden="true"
        className="no-scrollbar absolute inset-0 overflow-x-hidden overflow-y-auto overscroll-contain"
      >
        {/* One measure for the whole composition, so the bar, the panel and the
            closing line share an edge with the name above them. It widens once
            there is room for the name to hold a single line at its full tracking
            — a two-line "CHAWLA STUDIO" is a different composition, not a
            smaller one. */}
        <div className="mx-auto flex min-h-full w-full max-w-[30rem] flex-col items-center justify-center px-5 py-8 sm:max-w-[34rem] sm:px-8 sm:py-10 md:max-w-[42rem] lg:max-w-[46rem]">
          <LoaderLogo shown={shown} reduced={reduced} />

          <div className="mt-6 w-full md:mt-9">
            <LoaderTagline shown={shown} reduced={reduced} />
          </div>

          <div className="mt-6 w-full md:mt-10">
            <LoaderProgress percent={percent} shown={shown} reduced={reduced} />
          </div>

          <div className="mt-6 w-full md:mt-10">
            <LoaderStats shown={shown} reduced={reduced} />
          </div>

          <div className="mt-6 w-full md:mt-9">
            <LoaderQuote shown={shown} reduced={reduced} />
          </div>
        </div>
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {leaving
          ? `${loadingScreen.brand} is ready.`
          : `Loading ${loadingScreen.brand} — ${quartile} per cent.`}
      </p>
    </div>
  );
}
