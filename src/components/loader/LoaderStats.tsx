import { StatGlyph } from '../hero/HeroIcons';
import { LOADER_RISE, LOADER_STAGE, loaderRisen, staged } from './stage';
import { figures, loadingStats } from '@/lib/site.config';
import { cx } from '@/lib/utils';

/**
 * The four figures, in one gilded panel.
 *
 * A description list, as in the hero — these are labels and their values, and
 * `order` puts the number above its label while the DOM keeps `dt` before `dd`.
 * The hairlines between the cells are the grid's own gap showing through a gold
 * backing, which is the one construction that stays correct in both
 * arrangements: four across from `md`, two by two below it, with no cell left
 * carrying a border along an outside edge.
 *
 * The numbers are sample content until the studio confirms them — the same gate
 * the hero's panel uses, `NEXT_PUBLIC_FIGURES_CONFIRMED`. Until it is set, a
 * quiet line says so, because a loading screen is a poor place to start making
 * claims about someone else's business.
 */
export function LoaderStats({ shown, reduced }: { shown: boolean; reduced: boolean }) {
  return (
    <div
      className={cx('w-full', LOADER_RISE, loaderRisen(shown))}
      style={staged(LOADER_STAGE.stats, reduced)}
    >
      <dl className="gilt-panel grid grid-cols-2 divide-y divide-gold-line/40 overflow-hidden rounded-md border border-gold-line/60 bg-[rgba(8,8,10,0.62)] shadow-[0_4px_24px_rgba(0,0,0,0.6)] backdrop-blur-md sm:grid-cols-4 sm:divide-x sm:divide-y-0 sm:divide-gold-line/40">
        {loadingStats.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col items-center gap-1.5 px-3 py-3.5 text-center sm:px-2.5 sm:py-4 md:px-3 md:py-4.5 lg:px-4"
          >
            <span className="order-1 h-5 w-5 text-gold-bright sm:h-5 sm:w-5 md:h-[1.35rem] md:w-[1.35rem]">
              <StatGlyph icon={stat.icon} />
            </span>
            <dd className="order-2 mt-0.5 font-display text-[1.25rem] font-normal leading-none text-ivory sm:text-[1.4rem] md:text-[1.6rem]">
              {stat.value}
              {stat.mark ? <span className="ml-0.5 text-gold-bright">{stat.mark}</span> : null}
            </dd>
            <dt className="order-3 text-[0.52rem] leading-tight tracking-[0.16em] text-paper-dim/90 uppercase sm:text-[0.56rem] md:text-[0.62rem]">
              {stat.label}
            </dt>
          </div>
        ))}
      </dl>

      {figures.confirmed ? null : (
        <p className="mt-2.5 text-center font-mono text-[0.52rem] leading-relaxed tracking-[0.16em] text-paper-dim/60 uppercase">
          Sample figures — pending studio confirmation
        </p>
      )}
    </div>
  );
}
