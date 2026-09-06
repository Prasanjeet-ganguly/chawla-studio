import { RISE, STAGE, after, risen } from './stage';
import { siteConfig } from '@/lib/site.config';
import { cx } from '@/lib/utils';

/**
 * The left column: what the studio does, said once, in three registers.
 *
 * The two capitalised lines and the script accent are one `h1` — a heading that
 * reads "We capture moments that last forever" to a screen reader and to a
 * search engine, and only looks like three separate marks. The script is set in
 * its own face and colour rather than italicised, which is why it can carry the
 * emphasis without the serif having to shout.
 */
export function HeroContent({ shown }: { shown: boolean }) {
  const { eyebrow, headingLines, scriptLine, description } = siteConfig.hero;

  return (
    <div className="max-w-[42rem]">
      <div
        className={cx('flex items-center gap-4', RISE, risen(shown))}
        style={after(STAGE.eyebrow)}
      >
        <p className="eyebrow text-gold">{eyebrow}</p>
        <span aria-hidden="true" className="gold-rule w-14 shrink-0 md:w-20" />
      </div>

      <h1 id="hero-title" className="mt-5 font-display text-ivory md:mt-7">
        {headingLines.map((line, index) => (
          <span
            key={line}
            className={cx(
              'block uppercase leading-[1.04] tracking-[0.015em] text-hero',
              RISE,
              risen(shown)
            )}
            style={after(STAGE.headline + index * 130)}
          >
            {line}
          </span>
        ))}

        {/* The script sits tight under the caps and slightly indented, the way a
            signature sits under a line of type. Its line box is trimmed because
            a calligraphic face carries most of its height in ascenders and
            descenders nothing else needs to clear. */}
        <span
          className={cx(
            'mt-1 block pl-1 font-script normal-case leading-[0.78] tracking-normal text-gold text-script md:mt-2',
            RISE,
            risen(shown)
          )}
          style={after(STAGE.script)}
        >
          {scriptLine}
        </span>
      </h1>

      <p
        className={cx(
          'mt-6 max-w-lg text-base leading-relaxed text-ivory/85 sm:mt-7 md:mt-8 md:text-[1.05rem]',
          RISE,
          risen(shown)
        )}
        style={after(STAGE.description)}
      >
        {description.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </p>
    </div>
  );
}
