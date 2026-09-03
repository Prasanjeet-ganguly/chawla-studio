import { LOADER_RISE, LOADER_STAGE, loaderRisen, staged } from './stage';
import { loadingScreen } from '@/lib/site.config';
import { cx } from '@/lib/utils';

/**
 * The line at the foot of the frame.
 *
 * One sentence with its middle word set in the calligraphic face — the same
 * pairing the hero uses, so the curtain and the page beneath it are speaking in
 * one voice. The script sits in an inline-block with its own leading so a face
 * with tall ascenders cannot stretch the line it is set in, and the hairline
 * under it fades at both ends: an underline that stopped square would read as a
 * link.
 */
export function LoaderQuote({ shown, reduced }: { shown: boolean; reduced: boolean }) {
  const { quote } = loadingScreen;

  return (
    <p
      className={cx(
        'loader-legible text-center font-display text-[0.92rem] leading-[1.9] text-paper/85 md:text-[1.05rem]',
        LOADER_RISE,
        loaderRisen(shown)
      )}
      style={staged(LOADER_STAGE.quote, reduced)}
    >
      {quote.first}{' '}
      <span className="relative inline-block px-0.5 align-baseline">
        <span className="font-script text-[1.55rem] leading-none text-gold-bright md:text-[1.85rem]">
          {quote.highlight}
        </span>
        <span
          aria-hidden="true"
          className="absolute inset-x-0 -bottom-0.5 h-px bg-[linear-gradient(to_right,transparent,var(--color-gold-line-strong),transparent)]"
        />
      </span>{' '}
      {quote.last}
    </p>
  );
}
