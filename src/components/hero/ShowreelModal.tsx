'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Placeholder } from '@/components/ui/Placeholder';
import { useLockBodyScroll } from '@/lib/hooks/useLockBodyScroll';
import { siteConfig } from '@/lib/site.config';
import { toEmbedUrl } from '@/lib/utils';

const FOCUSABLE = 'a[href], button:not([disabled])';

/**
 * The showreel, or an honest account of its absence.
 *
 * The same dialog contract as the lightbox: focus moves in, Tab cycles inside,
 * Escape closes, the page behind is locked, and focus returns to the button that
 * opened it. Clicking the surround closes it too.
 *
 * When `NEXT_PUBLIC_SHOWREEL_URL` is unset there is no film to play, so the
 * dialog says exactly that and points at the portfolio instead. It does not draw
 * a play button over a still and call it a video.
 */
export function ShowreelModal({ onClose }: { onClose: () => void }) {
  const panel = useRef<HTMLDivElement>(null);
  const { showreelUrl, primaryCta } = siteConfig.hero;
  const embedUrl = toEmbedUrl(showreelUrl);
  useLockBodyScroll(true);

  useEffect(() => {
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
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${siteConfig.brandName} showreel`}
      data-lenis-prevent
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/95 px-gutter py-10 backdrop-blur-sm"
    >
      <div ref={panel} className="w-full max-w-4xl">
        <div className="flex items-baseline justify-between gap-4">
          <p className="eyebrow text-gold">Showreel</p>
          <button
            type="button"
            onClick={onClose}
            className="-mr-3 inline-flex min-h-11 items-center px-3 text-label tracked text-paper-dim transition-colors duration-500 hover:text-paper"
          >
            Close
          </button>
        </div>

        <div className="mt-4">
          {!embedUrl ? (
            <Placeholder source="NEXT_PUBLIC_SHOWREEL_URL">
              <p>
                The studio film has not been published yet, so there is nothing here to
                play. Once the reel is online, set its embed address in the environment
                and this dialog plays it.
              </p>
              <div className="mt-6">
                <Button href={primaryCta.href} variant="outline" withArrow>
                  {primaryCta.label}
                </Button>
              </div>
            </Placeholder>
          ) : (
            <div className="gilt-panel aspect-video w-full overflow-hidden rounded-sm">
              <iframe
                src={embedUrl}
                title={`${siteConfig.brandName} showreel`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                className="h-full w-full border-0"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
