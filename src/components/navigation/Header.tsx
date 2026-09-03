'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MobileMenu } from './MobileMenu';
import { Wordmark } from './Wordmark';
import { CalendarIcon } from '@/components/hero/HeroIcons';
import { Button } from '@/components/ui/Button';
import { useActiveSection } from '@/lib/hooks/useActiveSection';
import { useScrollProgress } from '@/lib/hooks/useScrollProgress';
import { navLinks } from '@/lib/site.config';
import { cx } from '@/lib/utils';

/** Scroll distance, in px, after which the bar earns a background. */
const SETTLE = 64;

/**
 * The fixed masthead.
 *
 * Bare over the hero and backed by ink once the page moves, so the photography
 * is never competing with a bar. The wordmark sits left, the navigation is
 * centred, and the enquiry pill closes the line on the right — the arrangement
 * the opening frame is composed around.
 *
 * The active-section mark is driven by an observer rather than by hover, and
 * every control is reachable from the keyboard; the hairline under the bar
 * doubles as a reading-progress rule.
 */
export function Header() {
  const [settled, setSettled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/';
  const activeSection = useActiveSection();
  const { progress } = useScrollProgress();
  const active = isHome ? activeSection : null;

  // The drawer's open state is scoped to the route it was opened on, so a route
  // change closes it by derivation rather than by an effect firing afterwards.
  const [openFor, setOpenFor] = useState<string | null>(null);
  const open = openFor === pathname;

  useEffect(() => {
    const onScroll = () => setSettled(window.scrollY > SETTLE);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header
        className={cx(
          'fixed inset-x-0 top-0 z-50 transition-colors duration-700 ease-[var(--ease-out-expo)]',
          settled ? 'bg-ink/85 backdrop-blur-md' : 'bg-transparent'
        )}
      >
        {/*
          The three-part masthead — wordmark, centred nav, enquiry pill — needs
          about 830px of its own before anything has to shrink, so it waits for
          `lg`. Between 768 and 1024 the drawer stays: a tablet gets the wordmark
          and one control rather than a squeezed row with a wrapped wordmark and a
          pill hanging off the right edge.
        */}
        <div className="shell flex items-center justify-between gap-6 py-4 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:gap-5 lg:py-5">
          <Wordmark className="lg:justify-self-start" />

          <nav aria-label="Primary" className="hidden lg:block">
            {/*
              At 1024 the three columns and the nav's own gaps come to within a
              few pixels of the shell, and `1fr` tracks refuse to go below
              min-content — so the row would overflow rather than tighten. The
              nav closes up by four pixels a side at `lg` to keep about thirty
              pixels of slack there, and opens back out at `xl`.
            */}
            <ul className="flex items-center gap-7 xl:gap-10">
              {navLinks.map((link) => {
                const isActive = link.section !== null && active === link.section;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      data-active={isActive}
                      aria-current={isActive ? 'true' : undefined}
                      className={cx(
                        'link-underline text-label tracked transition-colors duration-500',
                        isActive ? 'text-gold' : 'text-ivory/70 hover:text-ivory'
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="hidden lg:flex lg:justify-end">
            <Button href="/#contact" variant="gilt" size="compact">
              <span className="inline-flex items-center gap-2.5">
                <span className="h-[0.95rem] w-[0.95rem] shrink-0 text-gold">
                  <CalendarIcon />
                </span>
                Book a shoot
              </span>
            </Button>
          </div>

          <button
            type="button"
            onClick={() => setOpenFor(pathname)}
            aria-expanded={open}
            aria-haspopup="dialog"
            // The only control on a phone masthead, so it carries a full 44px
            // touch target: the label's own line box is about 16px, and stating
            // the minimum height keeps the box honest if the type changes.
            className="-mr-2 inline-flex min-h-11 items-center px-2 text-label tracked text-ivory transition-colors duration-500 hover:text-gold lg:hidden"
          >
            Menu
          </button>
        </div>

        {/* Reading progress, drawn as the bar's own bottom edge. */}
        <div className={cx('relative h-px w-full', settled ? 'bg-hairline' : 'bg-transparent')}>
          <div
            className="h-px origin-left bg-gold transition-transform duration-200 ease-linear"
            style={{ transform: `scaleX(${progress})` }}
          />
        </div>
      </header>

      <MobileMenu open={open} onClose={() => setOpenFor(null)} active={active} />
    </>
  );
}
