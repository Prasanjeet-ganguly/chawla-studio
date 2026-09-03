import { RISE, STAGE, after, risen } from './stage';
import { siteConfig } from '@/lib/site.config';
import { cx } from '@/lib/utils';

/**
 * The closing line in the bottom right of the frame.
 *
 * One sentence set in two voices — the aside in the script face, the promise in
 * gold capitals — so it reads as a single paragraph to a screen reader and as a
 * signature to the eye. The swash beneath it is drawn rather than typed,
 * because a text underline cannot curve.
 */
export function BrandStatement({ shown }: { shown: boolean }) {
  const { script, caps } = siteConfig.hero.statement;

  return (
    <p
      className={cx('flex flex-col items-end text-right', RISE, risen(shown))}
      style={after(STAGE.statement)}
    >
      <span className="font-script text-[1.65rem] leading-[0.9] text-ivory/90 md:text-[2.1rem]">
        {script}
      </span>
      <span className="mt-1.5 font-display text-[1.35rem] leading-none tracking-[0.045em] text-gold uppercase md:mt-2 md:text-[1.95rem]">
        {caps}
      </span>
      <svg
        viewBox="0 0 132 14"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.1}
        strokeLinecap="round"
        aria-hidden="true"
        focusable="false"
        className="mt-2 h-[0.6rem] w-[7.5rem] text-gold/75 md:w-[9.5rem]"
      >
        <path d="M2 4.5c26 6.5 78 7.5 128 1.5" />
        <path d="M112 11.5c7-1 13-2.5 18-4.5" />
      </svg>
    </p>
  );
}
