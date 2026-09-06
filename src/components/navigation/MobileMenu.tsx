'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { Wordmark } from './Wordmark';
import { CalendarIcon } from '@/components/hero/HeroIcons';
import { Button } from '@/components/ui/Button';
import { useLockBodyScroll } from '@/lib/hooks/useLockBodyScroll';
import { navLinks, siteConfig } from '@/lib/site.config';
import { cx } from '@/lib/utils';

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
  /** Section id currently in view, or null when off the home route. */
  active: string | null;
};

/** Elements that can hold focus inside the drawer. */
const FOCUSABLE = 'a[href], button:not([disabled])';

/**
 * The narrow-viewport navigation: a full-screen sheet rather than a slide-out,
 * because at this size the menu *is* the page for a moment.
 *
 * It is gated at `lg`, the same boundary the masthead uses — a tablet gets the
 * wordmark and one control rather than a squeezed row, so the drawer has to be
 * available everywhere that control is. (Gating the two differently leaves a
 * band of widths where the trigger is visible and the sheet is not.)
 *
 * Behaves like a modal dialog — focus moves in on open, Tab cycles inside it,
 * Escape closes it, the page behind cannot scroll, and focus returns to the
 * trigger afterwards.
 */
export function MobileMenu({ open, onClose, active }: MobileMenuProps) {
  const panel = useRef<HTMLDivElement>(null);
  useLockBodyScroll(open);

  useEffect(() => {
    if (!open) return;

    const node = panel.current;
    const opener = document.activeElement as HTMLElement | null;
    node?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !node) return;

      const items = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE));
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      opener?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={panel}
      role="dialog"
      aria-modal="true"
      aria-label="Site navigation"
      data-lenis-prevent
      className="fixed inset-0 z-[70] flex flex-col bg-ink lg:hidden"
    >
      <div className="flex items-center justify-between border-b border-hairline px-gutter py-5 pt-[calc(1.25rem+env(safe-area-inset-top,0px))]">
        <Wordmark onClick={onClose} />
        <button
          type="button"
          onClick={onClose}
          // A twelve-pixel label in a padded box comes to about 32px tall, which
          // is under the 44px a thumb needs. The minimum height states that
          // intent directly rather than leaving it to padding arithmetic that
          // any change of type size would quietly undo.
          className="-mr-2 inline-flex min-h-11 items-center px-2 text-label tracked text-paper-dim transition-colors hover:text-gold active:text-gold"
        >
          Close
        </button>
      </div>

      <nav aria-label="Primary" className="flex-1 overflow-y-auto px-gutter py-6">
        <ul className="flex flex-col gap-1">
          {navLinks.map((link, index) => {
            const isActive = link.section !== null && active === link.section;
            return (
              <li key={link.href} className="border-b border-hairline">
                <Link
                  href={link.href}
                  onClick={onClose}
                  aria-current={isActive ? 'true' : undefined}
                  className="flex items-baseline gap-4 py-4 sm:py-5"
                >
                  <span className="eyebrow text-gold/70">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span
                    className={cx(
                      'font-display text-display-s transition-colors',
                      isActive ? 'text-gold' : 'text-ivory'
                    )}
                  >
                    {link.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Studio quick contact channels on mobile */}
        <div className="mt-8 border-t border-hairline pt-6">
          <p className="eyebrow text-gold">Direct channels</p>
          <div className="mt-4 flex flex-col gap-3">
            {siteConfig.contact.phone ? (
              <a
                href={`tel:${siteConfig.contact.phone.replace(/[^+\d]/g, '')}`}
                className="inline-flex min-h-11 items-center gap-3 text-sm text-paper-dim transition-colors hover:text-paper"
              >
                <span className="eyebrow text-gold">Phone</span>
                <span>{siteConfig.contact.phone}</span>
              </a>
            ) : null}
            {siteConfig.contact.email ? (
              <a
                href={`mailto:${siteConfig.contact.email}`}
                className="inline-flex min-h-11 items-center gap-3 text-sm text-paper-dim transition-colors hover:text-paper"
              >
                <span className="eyebrow text-gold">Email</span>
                <span className="truncate">{siteConfig.contact.email}</span>
              </a>
            ) : null}
          </div>
        </div>
      </nav>

      <div className="border-t border-hairline px-gutter py-6 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]">
        <Button href="/#contact" variant="gilt" size="compact" onClick={onClose}>
          <span className="inline-flex items-center gap-2.5">
            <span className="h-[0.95rem] w-[0.95rem] shrink-0 text-gold">
              <CalendarIcon />
            </span>
            Book a shoot
          </span>
        </Button>
        <p className="eyebrow mt-4 text-[0.62rem] text-paper-dim/75">{siteConfig.tagline}</p>
      </div>
    </div>
  );
}
