import { CrownIcon } from './HeroIcons';
import { RISE, STAGE, after, risen } from './stage';
import { figures } from '@/lib/site.config';
import { cx } from '@/lib/utils';

/**
 * One laurel branch, stroked at the same hairline weight as the icons.
 *
 * Local to the badge because it is a frame rather than an interface glyph, and
 * it only ever appears twice — once as drawn, once mirrored.
 */
function Laurel({ mirrored = false }: { mirrored?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cx(
        'h-[5.4rem] w-[1.6rem] shrink-0 text-gold/70 md:h-[6.2rem] md:w-[1.9rem]',
        mirrored && 'scale-x-[-1]'
      )}
    >
      <svg
        viewBox="0 0 26 70"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.05}
        strokeLinecap="round"
        strokeLinejoin="round"
        focusable="false"
        className="h-full w-full"
      >
        <path d="M21 6C12 20 10 44 18 64" />
        <path d="M17.5 17c-6-1-9-5-10-10 6 0 9 4 10 10z" />
        <path d="M14 28c-6-1-9.5-4.5-11-9.5 6-.5 9.5 3.5 11 9.5z" />
        <path d="M12 39c-6 0-10-3-12-8 6-1 10 2 12 8z" />
        <path d="M12.5 50c-6 1-10-1.5-12.5-6 6-1.5 10 .5 12.5 6z" />
        <path d="M15 60c-5.5 1.5-9.5 0-12-4 5.5-2 9.5-1 12 4z" />
      </svg>
    </span>
  );
}

/**
 * The wedding count, set as a crest.
 *
 * Deliberately small and held in the lower right of the frame, where the
 * photograph is already dark and nobody's face is — a medal over a bride is
 * worse than no medal at all.
 *
 * The figure is sample content until the studio confirms it, and says so in
 * eight-point type rather than pretending. See `figures` in site.config.ts.
 */
export function WeddingBadge({ shown }: { shown: boolean }) {
  const { value, label } = figures.weddings;

  return (
    <div
      className={cx('flex items-center', RISE, risen(shown))}
      style={after(STAGE.badge)}
    >
      <Laurel />
      <div className="-mx-1 flex flex-col items-center gap-1 text-center">
        <span className="h-4 w-4 text-gold md:h-[1.1rem] md:w-[1.1rem]">
          <CrownIcon />
        </span>
        <p className="font-display text-[1.7rem] leading-none text-gold md:text-[2rem]">
          {value}
        </p>
        <p className="text-[0.58rem] leading-tight tracking-[0.18em] text-paper-dim uppercase md:text-[0.62rem]">
          {label}
        </p>
        {figures.confirmed ? null : (
          <p className="text-[0.5rem] tracking-[0.14em] text-paper-dim/60 uppercase">
            Sample
          </p>
        )}
      </div>
      <Laurel mirrored />
    </div>
  );
}
