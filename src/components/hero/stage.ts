/**
 * The hero's entrance, as a running clock in milliseconds.
 *
 * Everything fades up on the same 1.2s curve; only the delays differ, and they
 * run in the order the eye should read the frame — the photograph is already
 * there, then the masthead, then down the left column, then the marginalia at
 * the bottom corners. Slow on purpose: the whole sequence is a little over two
 * seconds, which is a camera settling rather than a page assembling itself.
 *
 * The clock starts when the cinematic loader begins to lift, not on mount — see
 * lib/loading-state.ts — so the curtain and the hero move as one gesture.
 */
export const STAGE = {
  nav: 120,
  eyebrow: 300,
  headline: 420,
  script: 660,
  description: 840,
  actions: 980,
  stats: 1140,
  badge: 1280,
  statement: 1400,
} as const;

/**
 * The transition itself lives in lib/stage.ts, shared with the loading screen.
 * Re-exported here so every hero part keeps importing its staging from one place.
 */
export { RISE, after, risen } from '@/lib/stage';
