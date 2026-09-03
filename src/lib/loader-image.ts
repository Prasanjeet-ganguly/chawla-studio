import { LOADER_BACKGROUND, type LoaderImage } from './loader-image.generated';

export type { LoaderImage };

/**
 * The loading screen's background photograph, or null.
 *
 * Null is a real state, not an error: /Loading Screen can be emptied, and the
 * preloader then composes over its own ink gradient rather than a broken frame.
 * Callers must handle it — see LoaderBackground.
 */
export const loaderBackground: LoaderImage | null = LOADER_BACKGROUND;

/**
 * The tone painted under the photograph while it decodes.
 *
 * Measured off the frame itself at build time, so the loader's first painted
 * pixel is already the right temperature instead of flashing from black to
 * candlelight. Falls back to the site's ink when there is no frame.
 */
export const loaderBaseColor = loaderBackground?.baseColor ?? '#08080a';
