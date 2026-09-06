import { PlayIcon } from './HeroIcons';
import { RISE, STAGE, after, risen } from './stage';
import { Button } from '@/components/ui/Button';
import { siteConfig } from '@/lib/site.config';
import { cx } from '@/lib/utils';

type HeroActionsProps = {
  shown: boolean;
  /** Opens the showreel dialog. Owned by the hero, which holds the state. */
  onShowreel: () => void;
};

/**
 * The hero's two actions: go and see the work, or watch the film.
 *
 * The first is the only filled gold thing on the site, and it is a real link to
 * the portfolio section rather than a scripted scroll — so it survives a middle
 * click, a right click, and JavaScript failing to load. The second is a single
 * button that happens to contain a circle and a label, not a circle with a
 * caption next to it; one control, one focus stop, one accessible name.
 *
 * They wrap rather than shrink on a narrow phone, which is what keeps the pill
 * at its designed measure instead of squeezing the type inside it.
 */
export function HeroActions({ shown, onShowreel }: HeroActionsProps) {
  const { primaryCta } = siteConfig.hero;

  return (
    <div
      className={cx(
        'mt-7 flex flex-wrap items-center gap-x-6 gap-y-4 sm:mt-9 md:mt-12 md:gap-x-8',
        RISE,
        risen(shown)
      )}
      style={after(STAGE.actions)}
    >
      <Button href={primaryCta.href} variant="gold" size="hero" withArrow>
        {primaryCta.label}
      </Button>

      <button
        type="button"
        onClick={onShowreel}
        aria-haspopup="dialog"
        className="group inline-flex items-center gap-4"
      >
        <span
          className={cx(
            'grid h-12 w-12 shrink-0 place-items-center rounded-full border border-gold-line-strong text-gold',
            'transition-[background-color,border-color,transform] duration-500 ease-[var(--ease-out-expo)]',
            'group-hover:scale-105 group-hover:border-gold group-hover:bg-gold/12'
          )}
        >
          {/* Nudged right by a hair: a triangle's optical centre sits behind its
              geometric one, so a centred play mark always looks a little left. */}
          <span className="h-3.5 w-3.5 translate-x-[1px]">
            <PlayIcon />
          </span>
        </span>
        <span className="text-label tracked text-ivory transition-colors duration-500 ease-[var(--ease-out-expo)] group-hover:text-gold">
          Watch showreel
        </span>
      </button>
    </div>
  );
}
