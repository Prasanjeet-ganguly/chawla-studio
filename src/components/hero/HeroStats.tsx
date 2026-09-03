import { StatGlyph } from './HeroIcons';
import { RISE, STAGE, after, risen } from './stage';
import { figures } from '@/lib/site.config';
import { cx } from '@/lib/utils';

/**
 * The gilded figures panel in the lower-left of the frame.
 *
 * A description list, because that is what it is: three labels and their
 * values. The DOM keeps `dt` before `dd` and two `order` utilities put the
 * number above its label, so the markup stays valid while the composition
 * matches the reference.
 *
 * The numbers are sample content until the studio confirms its own — see the
 * `figures` block in site.config.ts. Until then a quiet line under the panel
 * says so, because a made-up total presented as fact is a lie about someone
 * else's business. Set `NEXT_PUBLIC_FIGURES_CONFIRMED=true` and the line goes.
 */
export function HeroStats({ shown }: { shown: boolean }) {
  return (
    <div
      className={cx('w-full max-w-[27rem]', RISE, risen(shown))}
      style={after(STAGE.stats)}
    >
      <dl className="gilt-panel grid grid-cols-3 divide-x divide-gold-line rounded-sm">
        {figures.stats.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col items-center gap-2 px-3 py-5 text-center md:px-5"
          >
            <span className="order-1 h-5 w-5 text-gold md:h-[1.35rem] md:w-[1.35rem]">
              <StatGlyph icon={stat.icon} />
            </span>
            <dt className="eyebrow order-3 text-paper-dim">{stat.label}</dt>
            <dd className="order-2 font-display text-[1.55rem] leading-none text-ivory md:text-[1.9rem]">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>

      {figures.confirmed ? null : (
        <p className="mt-2.5 text-center text-[0.62rem] leading-relaxed tracking-[0.12em] text-paper-dim/70 uppercase md:text-left">
          Sample figures — pending studio confirmation
        </p>
      )}
    </div>
  );
}
