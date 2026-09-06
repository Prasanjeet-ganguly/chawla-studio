'use client';

import { useState } from 'react';
import { Lightbox } from './Lightbox';
import { ProjectCard } from './ProjectCard';
import { VideoModal } from './VideoModal';
import { Photo } from '@/components/ui/Photo';
import { Reveal } from '@/components/ui/Reveal';
import { describe, noteFor } from '@/lib/data/captions';
import {
  PHOTOGRAPHY_CATEGORIES,
  VIDEO_CATEGORIES,
  getPhotosByCategory,
  projects,
  type PhotographyCategory,
  type PortfolioGroup,
  type VideoCategory,
  type VideoProject,
} from '@/lib/data/projects';
import { cx, frameNumber } from '@/lib/utils';

/** `all`, or one of the subcategories belonging to the open group. */
type Filter = 'all' | PhotographyCategory | VideoCategory;

/** The two primary groups, in the order they are shown. */
const GROUPS: ReadonlyArray<{ id: PortfolioGroup; label: string }> = [
  { id: 'photography', label: 'Photography' },
  { id: 'video', label: 'Videos' },
];

/**
 * Editorial rhythm for the photography photo grid.
 *
 * Frames keep their own natural aspect ratio without cropping, while column spans
 * and offsets create a dynamic magazine rhythm.
 */
const PHOTO_RHYTHM = [
  { className: 'md:col-span-8', sizes: '(min-width: 768px) 62vw, 92vw' },
  { className: 'md:col-span-4 md:mt-28', sizes: '(min-width: 768px) 31vw, 92vw' },
  { className: 'md:col-span-6', sizes: '(min-width: 768px) 46vw, 92vw' },
  { className: 'md:col-span-5 md:col-start-8 md:mt-20', sizes: '(min-width: 768px) 39vw, 92vw' },
  { className: 'md:col-span-12', sizes: '(min-width: 768px) 92vw, 92vw' },
  { className: 'md:col-span-5 md:col-start-2', sizes: '(min-width: 768px) 39vw, 92vw' },
  { className: 'md:col-span-6 md:col-start-7 md:mt-16', sizes: '(min-width: 768px) 46vw, 92vw' },
] as const;

/** Every subcategory of a group, whether or not it holds work yet. */
const subcategories = (group: PortfolioGroup): readonly Filter[] =>
  group === 'photography' ? PHOTOGRAPHY_CATEGORIES : VIDEO_CATEGORIES;

/**
 * The portfolio, organized into direct category galleries.
 *
 * 1. PHOTOGRAPHY: Selecting any category (ALL, WEDDING, PRE-WEDDING, HALDI, MEHENDI,
 *    RING CEREMONY) displays all photos in that category directly in an editorial
 *    gallery grid. Clicking any frame opens the full-screen Lightbox viewer.
 *
 * 2. VIDEOS: Selecting any video category (ALL, REELS, TEASER, HIGHLIGHTS) displays
 *    the corresponding video films. Clicking any video card opens the full-screen
 *    VideoModal player.
 */
/** Shape passed to VideoModal — queue plus the index of the video to start on. */
type PlayingVideo = { queue: readonly VideoProject[]; startIndex: number };

export function WorkSection() {
  const [group, setGroup] = useState<PortfolioGroup>('photography');
  const [filter, setFilter] = useState<Filter>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [playing, setPlaying] = useState<PlayingVideo | null>(null);

  // Photography dataset: resolve all photo IDs for active filter
  const photoCategoryFilter = filter as 'all' | PhotographyCategory;
  const photoIds =
    group === 'photography' ? getPhotosByCategory(photoCategoryFilter) : [];

  // Video dataset: resolve video projects for active filter
  const videoCategoryFilter = filter as 'all' | VideoCategory;
  const videoProjects =
    group === 'video'
      ? (projects.filter(
          (p): p is VideoProject =>
            p.type === 'video' &&
            (videoCategoryFilter === 'all' || p.category === videoCategoryFilter)
        ))
      : [];

  const isEmpty =
    group === 'photography' ? photoIds.length === 0 : videoProjects.length === 0;

  const currentTitle =
    filter === 'all'
      ? group === 'photography'
        ? 'All Photographs'
        : 'All Films'
      : `${filter} ${group === 'photography' ? 'Photography' : 'Films'}`;

  /** Chip shape, shared by both tiers so the bar reads as one control. */
  const chip = (active: boolean) =>
    cx(
      'inline-flex min-h-11 shrink-0 snap-start items-center border px-4 text-data tracked-wide whitespace-nowrap transition-colors duration-500',
      active
        ? 'border-gold bg-gold/10 text-ivory'
        : 'border-hairline text-paper-dim hover:border-gold-line hover:text-paper'
    );

  /** Tier-one tab (Photography / Videos) — bigger touch target with the gold rule. */
  const groupTab = (active: boolean) =>
    cx(
      'relative -mb-px inline-flex min-h-12 items-center px-1 pb-3 font-display text-lg tracking-[0.14em] uppercase transition-colors duration-500 md:text-xl',
      active ? 'text-ivory' : 'text-paper-dim hover:text-paper'
    );

  return (
    <section id="work" aria-labelledby="work-title" className="rebate-grid py-24 md:py-36">
      <p className="rebate-mark self-start pt-2">Selected work</p>

      <div className="shell">
        <Reveal className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">The work</p>
            <h2 id="work-title" className="mt-5 font-display uppercase text-display-l">
              Selected
              <br />
              Stories
            </h2>
          </div>

          {/* First tier: the discipline. Type on a gold rule rather than a filled
              box, so it reads as a heading the second tier hangs beneath. */}
          <div
            role="group"
            aria-label="Portfolio group"
            className="no-scrollbar -mx-gutter flex snap-x snap-mandatory gap-6 overflow-x-auto border-b border-hairline px-gutter md:mx-0 md:flex-wrap md:gap-10 md:px-0"
          >
            {GROUPS.map((entry) => {
              const active = group === entry.id;
              return (
                <button
                  key={entry.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setGroup(entry.id);
                    setFilter('all');
                    setLightboxIndex(null);
                  }}
                  className={cx(
                    'snap-start',
                    groupTab(active)
                  )}
                >
                  {entry.label}
                  <span
                    aria-hidden="true"
                    className={cx(
                      'absolute inset-x-0 bottom-0 h-px origin-left bg-gold transition-transform duration-500 ease-[var(--ease-out-expo)]',
                      active ? 'scale-x-100' : 'scale-x-0'
                    )}
                  />
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* Second tier: the ceremony, or the cut. One row, scrolled sideways on a
            phone — the section itself never gains a horizontal scrollbar. */}
        <Reveal
          delay={0.06}
          className="no-scrollbar -mx-gutter mt-8 flex snap-x snap-mandatory gap-2 overflow-x-auto px-gutter md:mx-0 md:flex-wrap md:px-0"
        >
          <div role="group" aria-label={`Filter ${group} by category`} className="flex gap-2 md:flex-wrap">
            <button
              type="button"
              aria-pressed={filter === 'all'}
              onClick={() => {
                setFilter('all');
                setLightboxIndex(null);
              }}
              className={chip(filter === 'all')}
            >
              All
            </button>

            {subcategories(group).map((category) => (
              <button
                key={category}
                type="button"
                aria-pressed={filter === category}
                onClick={() => {
                  setFilter(category);
                  setLightboxIndex(null);
                }}
                className={chip(filter === category)}
              >
                {category}
              </button>
            ))}
          </div>
        </Reveal>

        <div className="mt-8 flex items-center justify-between border-t border-hairline pt-4">
          <p className="eyebrow text-paper-dim">
            {filter === 'all' ? `All ${group}` : `${filter}`}
          </p>
          <p className="eyebrow text-paper-dim">
            {group === 'photography'
              ? `${photoIds.length} ${photoIds.length === 1 ? 'frame' : 'frames'}`
              : `${videoProjects.length} ${videoProjects.length === 1 ? 'film' : 'films'}`}
          </p>
        </div>

        {/* Empty State when category has no published items yet */}
        {isEmpty ? (
          <Reveal className="mt-16 flex flex-col items-center gap-6 py-10 text-center md:py-16">
            <span aria-hidden="true" className="hairline-gold block h-px w-24" />
            <p className="eyebrow text-gold">Coming soon</p>
            <p className="max-w-md font-display text-display-s text-ivory">
              New stories are being captured.
            </p>
            <span aria-hidden="true" className="hairline-gold block h-px w-24" />
          </Reveal>
        ) : group === 'photography' ? (
          /* Photography Direct Photo Gallery Grid */
          <ul className="mt-10 grid list-none grid-cols-1 gap-x-8 gap-y-14 p-0 sm:mt-12 sm:gap-y-16 md:grid-cols-12 md:gap-y-20">
            {photoIds.map((id, index) => {
              const note = noteFor(id);
              const slot = PHOTO_RHYTHM[index % PHOTO_RHYTHM.length]!;

              return (
                <Reveal
                  as="li"
                  key={id}
                  variant="clip"
                  delay={index % 2 === 0 ? 0 : 0.08}
                  className={slot.className}
                >
                  <button
                    type="button"
                    onClick={() => setLightboxIndex(index)}
                    aria-label={`Open frame ${frameNumber(index)} full screen: ${describe(id)}`}
                    className="group block w-full text-left"
                  >
                    <span className="mb-2.5 flex items-baseline justify-between gap-4 sm:mb-3">
                      <span className="eyebrow text-gold/80 transition-colors duration-300 group-hover:text-gold">
                        {frameNumber(index)}
                      </span>
                      <span className="eyebrow text-gold opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100">
                        View Frame &#8594;
                      </span>
                    </span>

                    <div className="overflow-hidden">
                      <Photo
                        id={id}
                        alt={describe(id)}
                        sizes={slot.sizes}
                        zoom
                      />
                    </div>
                  </button>

                  {note ? (
                    <p className="mt-3 max-w-sm text-sm text-paper-dim sm:mt-3.5">{note}</p>
                  ) : null}
                </Reveal>
              );
            })}
          </ul>
        ) : (
          /* Videos Direct Gallery Grid (responsive, balanced layout) */
          <ul
            className={cx(
              'mt-12 grid list-none gap-x-8 gap-y-16 p-0',
              videoProjects.length === 1
                ? 'mx-auto max-w-2xl grid-cols-1'
                : videoProjects.length === 2
                  ? 'mx-auto max-w-4xl grid-cols-1 md:grid-cols-2'
                  : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            )}
          >
            {videoProjects.map((project, index) => (
              <ProjectCard
                key={project.slug}
                project={project}
                scale={videoProjects.length === 1 ? 'lead' : 'default'}
                sizes={
                  videoProjects.length === 1
                    ? '(min-width: 768px) 672px, 92vw'
                    : videoProjects.length === 2
                      ? '(min-width: 768px) 448px, 92vw'
                      : '(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 92vw'
                }
                aspect={project.aspectRatio === 9 / 16 ? 9 / 16 : 16 / 9}
                delay={index % 3 === 0 ? 0 : index % 3 === 1 ? 0.08 : 0.16}
                onPlay={() => setPlaying({ queue: videoProjects, startIndex: index })}
              />
            ))}
          </ul>
        )}
      </div>

      {/* Lightbox for Photography */}
      {lightboxIndex !== null && photoIds.length > 0 ? (
        <Lightbox
          ids={photoIds}
          index={lightboxIndex}
          title={currentTitle}
          onIndex={setLightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      ) : null}

      {/* Video Modal Player (with playlist navigation) */}
      {playing ? (
        <VideoModal
          queue={playing.queue}
          startIndex={playing.startIndex}
          onClose={() => setPlaying(null)}
        />
      ) : null}
    </section>
  );
}
