import { LOADER_RISE, LOADER_STAGE, loaderRisen, staged } from './stage';
import { loadingScreen } from '@/lib/site.config';
import { cx } from '@/lib/utils';

/**
 * The promise, with a gold hairline running out to either side.
 *
 * The rules are two flex children that take whatever is left over, so the pair
 * stays symmetrical at any width and the whole line centres on the type rather
 * than on the box. Each fades toward the type's end, which is how the reference
 * keeps them from reading as a rule the words are sitting on.
 */
export function LoaderTagline({ shown, reduced }: { shown: boolean; reduced: boolean }) {
  return (
    <div
      className={cx('flex w-full items-center justify-center gap-3 sm:gap-4 md:gap-6', LOADER_RISE, loaderRisen(shown))}
      style={staged(LOADER_STAGE.tagline, reduced)}
    >
      <span
        aria-hidden="true"
        className="h-px min-w-6 flex-1 bg-[linear-gradient(to_right,transparent,var(--color-gold-line-strong))]"
      />
      <p className="loader-legible shrink-0 text-center font-body text-[0.6rem] font-normal leading-normal tracking-[0.28em] text-paper/90 uppercase sm:text-[0.68rem] sm:tracking-[0.32em] md:text-[0.74rem]">
        {loadingScreen.tagline}
      </p>
      <span
        aria-hidden="true"
        className="h-px min-w-6 flex-1 bg-[linear-gradient(to_left,transparent,var(--color-gold-line-strong))]"
      />
    </div>
  );
}
