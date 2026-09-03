'use client';

import { useEffect, useRef, useState } from 'react';

/** One thing the loader genuinely waits for. */
export type LoadTask = {
  key: string;
  /**
   * Resolves when the asset is usable. Must never reject — a failed asset is
   * still a finished one, or the visitor would be held for something that is
   * never coming.
   */
  run: () => Promise<void>;
};

export type AssetProgress = {
  /** 0–100, eased toward the real ratio so the bar moves rather than jumps. */
  percent: number;
  /** True once every task has settled. */
  ready: boolean;
};

/**
 * How fast the displayed number closes the gap to the real one, per millisecond.
 *
 * The percentage is never invented: `settled / total` is a real count of assets,
 * and this only controls how quickly the printed figure catches up to it. It
 * always approaches from below, so the loader cannot claim progress it has not
 * made.
 */
const CATCH_UP_PER_MS = 0.006;

/** Below this the bar has arrived; chasing the last fraction of a pixel is noise. */
const ARRIVED = 0.4;

/**
 * Drives the loader's percentage from real asset readiness.
 *
 * Tasks are counted, not timed, and are collected by `build` on the client — they
 * describe fonts and images that exist in the document, so they cannot be
 * enumerated during a server render. Every task settles exactly once: `run()`
 * resolves on success *and* on failure, so a 404 on the background moves the bar
 * forward instead of stalling it, and `ready` always arrives.
 */
export function useAssetProgress(build: () => readonly LoadTask[]): AssetProgress {
  const [percent, setPercent] = useState(0);
  const [ready, setReady] = useState(false);

  // The real ratio, written as tasks settle and read by the animation frame. A
  // ref rather than state: the target changing should not re-render, only the
  // displayed number should.
  const target = useRef(0);
  const shown = useRef(0);

  useEffect(() => {
    let live = true;
    let frame = 0;
    const tasks = build();

    if (tasks.length === 0) {
      // A document with no webfonts and no critical images. Nothing to measure,
      // so the bar is already full — announced on the next frame rather than in
      // the effect body, which would be a second render before the first has
      // been painted.
      target.current = 100;
      frame = requestAnimationFrame(() => setReady(true));
    }

    let settled = 0;
    for (const task of tasks) {
      void task.run().then(() => {
        if (!live) return;
        settled += 1;
        target.current = (settled / tasks.length) * 100;
        if (settled === tasks.length) setReady(true);
      });
    }

    return () => {
      live = false;
      cancelAnimationFrame(frame);
    };
    // `build` reads the document once, on mount. Re-running it would restart the
    // count against a page that has already loaded.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // One frame loop for the whole bar, easing the printed figure toward the real
  // one. It stops as soon as it reaches 100 — an idle rAF loop behind a dismissed
  // loader would keep a phone's GPU awake for nothing.
  useEffect(() => {
    let frame = 0;
    let previous = performance.now();

    const tick = (now: number) => {
      // A backgrounded tab hands back one enormous delta; clamping it stops the
      // bar jumping to the target the instant the visitor returns.
      const elapsed = Math.min(now - previous, 100);
      previous = now;

      const gap = target.current - shown.current;
      shown.current += gap * Math.min(1, CATCH_UP_PER_MS * elapsed);
      if (Math.abs(gap) < ARRIVED) shown.current = target.current;

      const next = Math.round(shown.current);
      setPercent((current) => (current === next ? current : next));

      if (shown.current < 100) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return { percent, ready };
}
