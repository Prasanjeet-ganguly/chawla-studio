import { LoaderApertureRing, LoaderCameraMark, LoaderFocusFrame } from './LoaderMarks';
import { LOADER_RISE, LOADER_STAGE, loaderRisen, staged } from './stage';
import { loadingScreen } from '@/lib/site.config';
import { cx } from '@/lib/utils';

/**
 * The head of the composition: the camera inside its focus box with subtle rotating
 * aperture guide, then the bold CHAWLA STUDIO brand, then PHOTOGRAPHY.
 *
 * Three stages rather than one, assembling the sequence: mark → brand → discipline.
 */
export function LoaderLogo({ shown, reduced }: { shown: boolean; reduced: boolean }) {
  return (
    <div className="flex flex-col items-center text-center">
      {/* Central Camera Mark with viewfinder and delicate rotating aperture ring */}
      <div
        className={cx(
          'relative flex h-20 w-20 items-center justify-center sm:h-24 sm:w-24 md:h-28 md:w-28 lg:h-32 lg:w-32',
          LOADER_RISE,
          loaderRisen(shown)
        )}
        style={staged(LOADER_STAGE.mark, reduced)}
      >
        {/* Soft dark radial halo local to the mark to ensure crisp contrast */}
        <span
          aria-hidden="true"
          className="absolute -inset-8 rounded-full bg-[radial-gradient(circle,rgba(8,8,10,0.72)_0%,rgba(8,8,10,0.3)_60%,transparent_100%)]"
        />

        {/* Subtle rotating aperture hairline ring */}
        {reduced ? null : (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -inset-3.5 animate-[spin_40s_linear_infinite] text-gold-bright opacity-40"
          >
            <LoaderApertureRing />
          </span>
        )}

        {/* Viewfinder corner brackets */}
        <span className="absolute inset-0 text-gold/55 drop-shadow-[0_2px_12px_rgba(8,8,10,0.85)]">
          <LoaderFocusFrame />
        </span>

        {/* Central camera icon with aperture & heart detail */}
        <span className="absolute inset-[17%] text-gold-bright drop-shadow-[0_2px_16px_rgba(8,8,10,0.95)]">
          <LoaderCameraMark />
        </span>
      </div>

      {/* Brand Name: CHAWLA STUDIO (Strongest element) */}
      <p
        className={cx(
          'loader-legible mt-5 font-display text-[2.15rem] font-normal leading-none tracking-[0.18em] text-ivory uppercase sm:text-[2.7rem] sm:tracking-[0.2em] md:mt-6 md:text-[3.25rem] lg:text-[3.65rem]',
          LOADER_RISE,
          loaderRisen(shown)
        )}
        style={staged(LOADER_STAGE.brand, reduced)}
      >
        {loadingScreen.brand}
      </p>

      {/* Discipline: PHOTOGRAPHY */}
      <p
        className={cx(
          'loader-legible mt-2.5 font-body text-[0.68rem] font-medium tracking-[0.44em] text-gold-bright uppercase sm:text-[0.74rem] sm:tracking-[0.48em] md:mt-3 md:text-[0.8rem]',
          LOADER_RISE,
          loaderRisen(shown)
        )}
        style={staged(LOADER_STAGE.subtitle, reduced)}
      >
        {loadingScreen.subtitle}
      </p>
    </div>
  );
}
