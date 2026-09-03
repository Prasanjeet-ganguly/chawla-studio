'use client';

import type { LoadTask } from './useAssetProgress';

/**
 * What the loading screen actually waits for.
 *
 * Only the first screen: the four typefaces the site sets, every image a
 * component has marked as critical, and the loader's own first painted frame.
 * Nothing else — the portfolio is forty-six photographs and lazy-loads as the
 * visitor scrolls, so waiting on it would be a lie about what "ready" means and
 * a five-second wall in front of the page.
 */

/**
 * The typefaces, read back out of the cascade rather than named here.
 *
 * next/font mangles each family into a build-specific name and hands it over as
 * a custom property, so these are the only stable handles on it — and they are
 * the same four `@theme` uses, which means a face that gets swapped out of
 * layout.tsx stops being waited on automatically.
 */
const FONT_VARIABLES = [
  '--font-playfair',
  '--font-allura',
  '--font-archivo',
  '--font-plex-mono',
] as const;

/** Turns any settlement — resolve or reject — into a resolution. */
const settle = (promise: Promise<unknown>): Promise<void> =>
  promise.then(
    () => undefined,
    () => undefined
  );

/**
 * One task per typeface.
 *
 * `document.fonts.load` starts the fetch and resolves when that family's faces
 * are usable; `document.fonts.ready` alone would not do, because at the moment
 * the loader mounts nothing has yet asked for the display face and the set is
 * already "ready".
 */
function fontTasks(): LoadTask[] {
  if (!('fonts' in document)) return [];

  const styles = getComputedStyle(document.documentElement);

  return FONT_VARIABLES.flatMap((variable) => {
    const family = styles.getPropertyValue(variable).trim();
    if (family.length === 0) return [];

    return [
      {
        key: `font:${variable}`,
        run: () => {
          try {
            return settle(document.fonts.load(`400 1rem ${family}`));
          } catch {
            // An unparseable family list is not worth holding the page for.
            return Promise.resolve();
          }
        },
      },
    ];
  });
}

/**
 * One task per image a component has declared critical.
 *
 * The declaration is `fetchPriority="high"`, which `<Photo priority>` and the
 * loader's own background already set — so this tracks whatever the first screen
 * genuinely needs without naming a single file, and without issuing a second
 * request for something the document is already fetching.
 */
function imageTasks(): LoadTask[] {
  const images = Array.from(
    document.querySelectorAll<HTMLImageElement>('img[fetchpriority="high"]')
  );

  return images.map((image, index) => ({
    key: `image:${index}`,
    run: () => {
      // `complete` is also true for an image that failed, which is the answer we
      // want: settled, not successful.
      if (image.complete) return Promise.resolve();

      return settle(
        new Promise<void>((resolve) => {
          image.addEventListener('load', () => resolve(), { once: true });
          image.addEventListener('error', () => resolve(), { once: true });
        })
      );
    },
  }));
}

/**
 * The loader's own first frame.
 *
 * Two animation frames, which is the honest test of "the visitor can see this":
 * the first is scheduled before layout, the second after it has been painted.
 */
const firstFrameTask: LoadTask = {
  key: 'first-frame',
  run: () =>
    new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    }),
};

/** Everything the percentage is measured against, collected from the document. */
export const criticalAssets = (): LoadTask[] => [
  firstFrameTask,
  ...fontTasks(),
  ...imageTasks(),
];
