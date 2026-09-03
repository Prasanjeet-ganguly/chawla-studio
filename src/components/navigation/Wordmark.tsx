import Link from 'next/link';
import { siteConfig } from '@/lib/site.config';
import { cx } from '@/lib/utils';

type WordmarkProps = {
  /** A plain lockup for places that are already inside a link, or are static. */
  as?: 'link' | 'text';
  onClick?: () => void;
  className?: string;
};

/**
 * The studio's mark: the name set in the script face, the discipline in small
 * tracked capitals beneath it.
 *
 * Two words of type rather than a graphic, which is what a photography studio's
 * masthead should be — it stays sharp at any size, it is selectable and
 * searchable, and it needs no asset. It lives in one file because the masthead
 * and the drawer must never drift apart.
 */
export function Wordmark({ as = 'link', onClick, className }: WordmarkProps) {
  const lockup = (
    <>
      <span className="font-script text-[1.7rem] leading-[0.95] whitespace-nowrap text-ivory transition-colors duration-500 ease-[var(--ease-out-expo)] group-hover:text-gold md:text-[1.9rem]">
        {siteConfig.brandName}
      </span>
      <span className="mt-1 text-[0.5rem] leading-none tracking-[0.3em] whitespace-nowrap text-gold/85 uppercase md:text-[0.55rem]">
        {siteConfig.discipline}
      </span>
    </>
  );

  const shape = cx('group inline-flex flex-col items-start', className);

  if (as === 'text') {
    return <span className={shape}>{lockup}</span>;
  }

  return (
    // The lockup's own two lines come to about 38px, so the link states a 44px
    // minimum and centres them inside it: on a phone masthead this is one of
    // only two controls, and it should take a thumb like one.
    <Link
      href="/"
      onClick={onClick}
      aria-label={`${siteConfig.brandName}, home`}
      className={cx(shape, 'min-h-11 justify-center')}
    >
      {lockup}
    </Link>
  );
}
