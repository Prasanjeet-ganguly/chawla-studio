import { LOADER_RISE, LOADER_STAGE, loaderRisen, staged } from './stage';
import { loadingScreen } from '@/lib/site.config';
import { cx } from '@/lib/utils';

/**
 * The bar, and the two lines that read it.
 *
 * `percent` is a real count of settled assets (see useAssetProgress), so the
 * width is the truth about how much of the first screen has arrived rather than
 * a timer dressed up as one. The fill carries a small luminous head at its
 * leading edge — the one glow on the loading screen, and the reason the bar
 * reads as light travelling along a track instead of a div growing.
 *
 * The head is hidden below a couple of per cent, where it would sit outside its
 * own track and glow in the corner of an empty bar.
 */
export function LoaderProgress({
  percent,
  shown,
  reduced,
}: {
  percent: number;
  shown: boolean;
  reduced: boolean;
}) {
  return (
    <div
      className={cx('w-full', LOADER_RISE, loaderRisen(shown))}
      style={staged(LOADER_STAGE.progress, reduced)}
    >
      {/* Wide horizontal progress track with thin gold border & dark transparent interior */}
      <div className="relative h-2.5 w-full rounded-full border border-gold-line-strong/85 bg-ink/65 p-[2px] shadow-[0_2px_12px_rgba(0,0,0,0.6)] backdrop-blur-sm sm:h-3">
        <div
          className="relative h-full rounded-full bg-[linear-gradient(90deg,var(--color-gold-deep)_0%,var(--color-gold)_50%,var(--color-gold-bright)_100%)] shadow-[0_0_12px_rgba(201,163,106,0.6)] transition-[width] duration-200 ease-out"
          style={{ width: `${percent}%` }}
        >
          {percent > 2 ? (
            <span
              aria-hidden="true"
              className="absolute top-1/2 right-0 h-2.5 w-2.5 -translate-y-1/2 translate-x-1/2 rounded-full bg-gold-bright shadow-[0_0_12px_4px_rgba(231,198,146,0.8)] sm:h-3 sm:w-3"
            />
          ) : null}
        </div>
      </div>

      {/* The status line centered and the percentage aligned right */}
      <div className="relative mt-3 flex items-center justify-between sm:mt-3.5">
        <div className="w-12 shrink-0 sm:w-16" aria-hidden="true" />
        <p className="loader-legible flex-1 text-center font-body text-[0.62rem] font-light tracking-[0.24em] text-paper/90 uppercase sm:text-[0.68rem] md:text-[0.74rem]">
          {loadingScreen.loadingText}
        </p>
        <p
          aria-hidden="true"
          className="loader-legible w-12 shrink-0 text-right font-mono text-[0.72rem] font-medium tracking-wider text-gold-bright sm:w-16 sm:text-[0.8rem] md:text-[0.86rem]"
        >
          {percent}%
        </p>
      </div>
    </div>
  );
}
