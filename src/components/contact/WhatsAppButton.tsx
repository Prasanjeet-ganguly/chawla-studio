'use client';

import { useEffect, useState } from 'react';
import { siteConfig } from '@/lib/site.config';
import { cx } from '@/lib/utils';

/**
 * The floating WhatsApp action.
 *
 * Renders nothing at all unless NEXT_PUBLIC_WHATSAPP_NUMBER is set — there is
 * no placeholder number to tap. It stays out of the way over the hero and steps
 * aside once the contact section is on screen, where the same action already
 * appears in the channel list.
 */
export function WhatsAppButton() {
  const [shown, setShown] = useState(false);
  const url = siteConfig.contact.whatsappUrl;

  useEffect(() => {
    if (!url) return;

    let atContact = false;
    let frame = 0;

    const measure = () => {
      frame = 0;
      setShown(!atContact && window.scrollY > window.innerHeight * 0.6);
    };

    const onScroll = () => {
      if (frame === 0) frame = window.requestAnimationFrame(measure);
    };

    const contact = document.getElementById('contact');
    let observer: IntersectionObserver | null = null;

    if (contact && typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        ([entry]) => {
          atContact = Boolean(entry?.isIntersecting);
          measure();
        },
        { rootMargin: '-20% 0px -20% 0px' }
      );
      observer.observe(contact);
    }

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      observer?.disconnect();
    };
  }, [url]);

  if (!url) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-hidden={shown ? undefined : true}
      tabIndex={shown ? undefined : -1}
      className={cx(
        'fixed right-gutter bottom-6 z-50 inline-flex items-center gap-3 border border-hairline-strong bg-ink-raise/90 px-5 py-3.5 text-label tracked text-paper backdrop-blur-md',
        'transition-[opacity,transform,border-color] duration-700 ease-[var(--ease-out-expo)]',
        'hover:border-selenium hover:text-selenium',
        shown ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
      )}
    >
      {/* A speech mark rather than the WhatsApp wordmark: the label carries the
          meaning, and the glyph stays in the studio's own line weight. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 11.5a8.5 8.5 0 0 1-12.4 7.55L3.5 20.5l1.5-4.6A8.5 8.5 0 1 1 21 11.5Z" />
        <path d="M8.8 9.2c0 3.3 2.7 6 6 6a1.6 1.6 0 0 0 1.6-1.6l-2-.8-.9 1a4.7 4.7 0 0 1-2.3-2.3l1-.9-.8-2A1.6 1.6 0 0 0 8.8 9.2Z" />
      </svg>
      <span>WhatsApp</span>
    </a>
  );
}
