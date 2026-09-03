'use client';

/**
 * One bit of state shared between the cinematic loader and the page beneath it:
 * has the curtain started to lift?
 *
 * The loader lives in the root layout and the hero lives in the page, so they are
 * siblings with no common component to hold this. A three-line store is a smaller
 * thing to add than a provider wrapped around every route, and it says exactly
 * what it is — the hero's entrance is not the hero's own business, it is the end
 * of the loader's.
 *
 * `finished` is module state, so it survives client-side navigation: coming back
 * to the home route from /blog does not replay the intro, and the hero animates
 * on mount as it always did.
 */

let finished = false;
const listeners = new Set<() => void>();

/** True once the loader has released the page — or if there was never a loader. */
export const isIntroFinished = (): boolean => finished;

/**
 * Called by the loader as its exit begins, so the hero's entrance overlaps the
 * fade rather than following it. Idempotent.
 */
export function finishIntro(): void {
  if (finished) return;
  finished = true;
  for (const listener of listeners) listener();
}

/** Subscribes to the hand-off. Returns its own unsubscribe. */
export function onIntroFinish(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
