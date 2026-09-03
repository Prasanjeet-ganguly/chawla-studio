'use client';

import { useEffect, useRef, useState } from 'react';
import { useLockBodyScroll } from '@/lib/hooks/useLockBodyScroll';
import type { VideoProject } from '@/lib/data/projects';
import { cx, toEmbedUrl } from '@/lib/utils';

type VideoModalProps = {
  /** Every video in the currently filtered category, in playback order. */
  queue: readonly VideoProject[];
  /** Index into `queue` of the video that should play first. */
  startIndex: number;
  onClose: () => void;
};

const FOCUSABLE =
  'a[href], button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])';

/**
 * An accessible full-screen dialog for video playback with playlist navigation.
 *
 * Visitors can step between every video in the active category using the
 * on-screen next/prev controls, the keyboard (←, →), or the iframe's own
 * end-of-video behaviour. The progress indicator (`3 of 5`) makes the
 * playlist feel intentional rather than accidental.
 *
 * When the embed URL is missing, an honest placeholder card is rendered
 * instead of a fake play button. Escape closes, the page behind is locked,
 * and focus returns to the card that opened the player.
 */
export function VideoModal({ queue, startIndex, onClose }: VideoModalProps) {
  const panel = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(() =>
    Math.max(0, Math.min(startIndex, queue.length - 1))
  );
  useLockBodyScroll(true);

  const total = queue.length;
  const safeIndex = Math.max(0, Math.min(index, total - 1));
  const project = queue[safeIndex];
  const hasPrev = safeIndex > 0;
  const hasNext = safeIndex < total - 1;

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
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        if (safeIndex < total - 1) setIndex(safeIndex + 1);
        return;
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        if (safeIndex > 0) setIndex(safeIndex - 1);
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
  }, [onClose, safeIndex, total]);

  if (!project) return null;

  const embedUrl = toEmbedUrl(project.videoUrl);
  const isVertical = project.aspectRatio === 9 / 16;

  const goPrev = () => {
    if (hasPrev) setIndex(safeIndex - 1);
  };
  const goNext = () => {
    if (hasNext) setIndex(safeIndex + 1);
  };

  return (
    <div
      ref={panel}
      role="dialog"
      aria-modal="true"
      aria-label={`${project.title} — ${project.categoryName}`}
      data-lenis-prevent
      className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/95 p-4 backdrop-blur-md sm:p-6 md:p-8"
      onClick={(e) => {
        if (e.target === panel.current) {
          onClose();
        }
      }}
    >
      {/* Close button with 44px minimum hit target */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close video"
        className="absolute top-4 right-4 z-20 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-hairline bg-ink/80 text-paper-dim transition-colors duration-300 hover:border-gold-line hover:text-ivory"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
          className="pointer-events-none"
        >
          <path
            d="M15 5L5 15M5 5l10 10"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <div
        className={cx(
          'relative w-full max-h-[90vh] flex flex-col',
          isVertical ? 'max-w-sm' : 'max-w-5xl'
        )}
      >
        {/* Player + side navigation */}
        <div className="relative flex items-center gap-3 sm:gap-5">
          {/* Previous film */}
          <button
            type="button"
            onClick={goPrev}
            disabled={!hasPrev}
            aria-label="Previous film"
            className={cx(
              'shrink-0 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border transition-colors duration-300',
              hasPrev
                ? 'border-hairline text-paper-dim hover:border-gold-line hover:text-ivory'
                : 'cursor-not-allowed border-hairline/40 text-paper-dim/30'
            )}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
              className="pointer-events-none"
            >
              <path
                d="M12.5 4L6 10l6.5 6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Player / placeholder */}
          <div className="relative flex-1">
            {embedUrl ? (
              <div
                className="relative w-full overflow-hidden rounded-md border border-gold-line/40 bg-ink shadow-[0_8px_32px_rgba(0,0,0,0.8)]"
                style={{
                  aspectRatio: isVertical ? '9 / 16' : '16 / 9',
                }}
              >
                <iframe
                  key={project.slug}
                  src={embedUrl}
                  title={project.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                  className="absolute inset-0 h-full w-full border-0"
                />
              </div>
            ) : (
              <div
                className="relative flex w-full flex-col items-center justify-center gap-6 rounded-md border border-gold-line/40 bg-[rgba(8,8,10,0.85)] p-8 text-center shadow-[0_8px_32px_rgba(0,0,0,0.8)] backdrop-blur-md sm:p-12"
                style={{
                  aspectRatio: isVertical ? '9 / 16' : '16 / 9',
                }}
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-full border border-gold-line/60 bg-gold/10 text-gold-bright shadow-[0_0_20px_rgba(201,163,106,0.2)]">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 28 28"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M11 9.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"
                      fill="currentColor"
                    />
                    <path
                      d="M4 7h2l2.5-2.5h11l2.5 2.5H24a2 2 0 012 2v13a2 2 0 01-2 2H4a2 2 0 01-2-2V9a2 2 0 012-2z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                    <path d="M18 17l6-4-6-4v8z" fill="currentColor" />
                  </svg>
                </span>

                <div>
                  <p className="eyebrow text-gold">Film in production</p>
                  <h3 className="mt-3 font-display text-display-s text-ivory">
                    {project.title}
                  </h3>
                  <p className="mt-2 max-w-sm text-sm text-paper-dim">
                    {project.description}
                  </p>
                </div>

                <p className="font-mono text-[0.56rem] tracking-widest text-paper-dim/60 uppercase">
                  {project.categoryName}
                  {project.duration ? ` · ${project.duration}` : ''}
                </p>
              </div>
            )}
          </div>

          {/* Next film */}
          <button
            type="button"
            onClick={goNext}
            disabled={!hasNext}
            aria-label="Next film"
            className={cx(
              'shrink-0 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border transition-colors duration-300',
              hasNext
                ? 'border-hairline text-paper-dim hover:border-gold-line hover:text-ivory'
                : 'cursor-not-allowed border-hairline/40 text-paper-dim/30'
            )}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
              className="pointer-events-none"
            >
              <path
                d="M7.5 4L14 10l-6.5 6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Caption bar + playlist progress */}
        <div className="mt-4 flex items-center justify-between gap-4 border-t border-hairline/40 pt-4">
          <div className="min-w-0">
            <p className="truncate font-display text-lg text-ivory">{project.title}</p>
            <p className="eyebrow mt-1 text-paper-dim">
              {project.categoryName}
              {project.duration ? ` · ${project.duration}` : ''}
            </p>
          </div>
          {total > 1 ? (
            <p className="eyebrow shrink-0 text-paper-dim">
              {safeIndex + 1} of {total}
            </p>
          ) : project.year !== null ? (
            <p className="eyebrow shrink-0 text-paper-dim">{project.year}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
