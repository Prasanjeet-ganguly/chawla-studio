'use client';

import { useEffect, useRef } from 'react';
import { Photo } from '@/components/ui/Photo';
import { describe, noteFor } from '@/lib/data/captions';
import { useLockBodyScroll } from '@/lib/hooks/useLockBodyScroll';
import { getPhoto } from '@/lib/photos';
import { cx } from '@/lib/utils';

type LightboxProps = {
  /** Every frame in the sequence, in reading order. */
  ids: readonly string[];
  /** Which frame is open. */
  index: number;
  onIndex: (next: number) => void;
  onClose: () => void;
  /** Series title, used to label the dialog. */
  title: string;
};

const FOCUSABLE = 'a[href], button:not([disabled])';

/** The frame fills the viewport minus the two bars, without ever cropping. */
const FRAME_HEIGHT = '66svh';

/** Capture data, in the order a photographer would read it off the frame. */
function captureRows(id: string): Array<[string, string]> {
  const { capture } = getPhoto(id);
  const rows: Array<[string, string | null]> = [
    ['Camera', capture.camera],
    ['Lens', capture.lens],
    ['Focal', capture.focal],
    ['Aperture', capture.aperture],
    ['Shutter', capture.shutter],
    ['ISO', capture.iso === null ? null : String(capture.iso)],
    ['Date', capture.date],
  ];
  return rows.filter((row): row is [string, string] => row[1] !== null);
}

/**
 * The full-screen viewer.
 *
 * A real dialog: focus moves in, Tab cycles inside, Escape closes, the page
 * behind is locked, and focus returns to the frame that opened it. Left and
 * right arrows move through the series, wrapping at both ends.
 *
 * The data printed under each frame is read from the file's own EXIF — camera,
 * lens, focal length, aperture, shutter, ISO — so it is the truth about how the
 * photograph was made, and a frame whose camera wrote none says so.
 */
export function Lightbox({ ids, index, onIndex, onClose, title }: LightboxProps) {
  const panel = useRef<HTMLDivElement>(null);
  useLockBodyScroll(true);

  const count = ids.length;
  const id = ids[index] ?? ids[0] ?? '';
  const step = (delta: number) => onIndex((index + delta + count) % count);

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
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        onIndex((index + (event.key === 'ArrowRight' ? 1 : -1) + count) % count);
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
    // `index` is read inside the handler, so the listener is re-bound with it.
  }, [count, index, onClose, onIndex]);

  if (!id) return null;

  const ratio = getPhoto(id).aspectRatio;
  const rows = captureRows(id);
  const note = noteFor(id);
  // Close, Prev and Next share one shape. The minimum height is the thumb
  // target: a twelve-pixel label in a padded box is only about 40px tall.
  const control =
    'inline-flex min-h-11 items-center px-4 text-label tracked text-paper-dim transition-colors duration-500 hover:text-paper';

  return (
    <div
      ref={panel}
      role="dialog"
      aria-modal="true"
      aria-label={`${title}, frame ${index + 1} of ${count}`}
      data-lenis-prevent
      className="fixed inset-0 z-[80] flex flex-col bg-ink/95 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between gap-4 border-b border-hairline px-gutter py-4">
        <p className="eyebrow truncate">{title}</p>
        <p aria-live="polite" className="eyebrow shrink-0">
          {String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
        </p>
        <button type="button" onClick={onClose} className={cx(control, '-mr-4')}>
          Close
        </button>
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden px-gutter py-6">
        {/* Width is derived from the frame's own ratio, so the photograph is
            contained by the viewport rather than cropped to fit it. */}
        <div style={{ width: `min(100%, calc(${FRAME_HEIGHT} * ${ratio}))` }}>
          <Photo key={id} id={id} alt={describe(id)} sizes="92vw" priority className="w-full" />
        </div>
      </div>

      <div className="border-t border-hairline px-gutter py-4">
        {note ? <p className="mb-3 max-w-prose text-sm text-paper-dim">{note}</p> : null}

        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3">
          {rows.length > 0 ? (
            <dl className="flex flex-wrap items-baseline gap-x-6 gap-y-2 text-data tracked-wide text-muted">
              {rows.map(([label, value]) => (
                <div key={label} className="flex items-baseline gap-2">
                  <dt className="sr-only">{label}</dt>
                  <dd className="font-mono">{value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-data tracked-wide text-muted">No capture data recorded</p>
          )}

          <div className="ml-auto flex items-center">
            <button type="button" onClick={() => step(-1)} className={control}>
              &#8592; Prev
            </button>
            <button type="button" onClick={() => step(1)} className={cx(control, '-mr-4')}>
              Next &#8594;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
