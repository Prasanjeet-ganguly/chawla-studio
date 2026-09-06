'use client';

import { useState } from 'react';
import { Lightbox } from './Lightbox';
import { Photo } from '@/components/ui/Photo';
import { Reveal } from '@/components/ui/Reveal';
import { describe, noteFor } from '@/lib/data/captions';
import { frameNumber } from '@/lib/utils';

type ProjectSequenceProps = {
  ids: readonly string[];
  /** Series title, passed through to the viewer's dialog label. */
  title: string;
};

/**
 * Slot widths, cycled down the sequence.
 *
 * Frames keep their own aspect ratio — only the column span changes — so the
 * page gets an editorial rhythm without a single photograph being cropped to
 * fit a shape it was not composed for.
 */
const RHYTHM = [
  'md:col-span-8',
  'md:col-span-4 md:mt-28',
  'md:col-span-6',
  'md:col-span-5 md:col-start-8 md:mt-20',
  'md:col-span-12',
  'md:col-span-5 md:col-start-2',
  'md:col-span-6 md:col-start-7 md:mt-16',
] as const;

const SIZES = [
  '(min-width: 768px) 62vw, 92vw',
  '(min-width: 768px) 31vw, 92vw',
  '(min-width: 768px) 46vw, 92vw',
  '(min-width: 768px) 39vw, 92vw',
  '(min-width: 768px) 92vw, 92vw',
  '(min-width: 768px) 39vw, 92vw',
  '(min-width: 768px) 46vw, 92vw',
] as const;

/**
 * The frame sequence on a project page, and the viewer it opens.
 *
 * Every frame is a button rather than a link: it opens the full-screen viewer in
 * place, which keeps the reading position and lets the keyboard move through the
 * series with the arrow keys.
 */
export function ProjectSequence({ ids, title }: ProjectSequenceProps) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <>
      <ul className="mt-16 grid list-none grid-cols-1 gap-x-8 gap-y-14 p-0 md:mt-24 md:grid-cols-12 md:gap-y-20">
        {ids.map((id, index) => {
          const note = noteFor(id);
          const slot = RHYTHM[index % RHYTHM.length]!;

          return (
            <Reveal
              as="li"
              key={id}
              variant="clip"
              delay={index % 2 === 0 ? 0 : 0.08}
              className={slot}
            >
              <button
                type="button"
                onClick={() => setOpen(index)}
                aria-label={`Open frame ${frameNumber(index)} full screen: ${describe(id)}`}
                className="group block w-full text-left"
              >
                <span className="mb-2.5 flex items-baseline justify-between gap-4 sm:mb-3">
                  <span className="eyebrow text-gold/80 transition-colors duration-300 group-hover:text-gold">
                    {frameNumber(index)}
                  </span>
                  <span className="eyebrow text-gold opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100">
                    View &#8594;
                  </span>
                </span>

                <Photo
                  id={id}
                  alt={describe(id)}
                  sizes={SIZES[index % SIZES.length]!}
                  zoom
                />
              </button>

              {note ? <p className="mt-3 max-w-sm text-sm text-paper-dim sm:mt-3.5">{note}</p> : null}
            </Reveal>
          );
        })}
      </ul>

      {open !== null ? (
        <Lightbox
          ids={ids}
          index={open}
          title={title}
          onIndex={setOpen}
          onClose={() => setOpen(null)}
        />
      ) : null}
    </>
  );
}
