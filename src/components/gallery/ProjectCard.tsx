'use client';

import Link from 'next/link';
import { Photo } from '@/components/ui/Photo';
import { Reveal } from '@/components/ui/Reveal';
import { describe } from '@/lib/data/captions';
import type { Project, VideoProject } from '@/lib/data/projects';
import { cx } from '@/lib/utils';

type ProjectCardProps = {
  project: Project;
  /** Browser hint for picking a variant — pass the card's real layout width. */
  sizes: string;
  /** Crop ratio for the cover. Varies by slot to keep the grid asymmetric. */
  aspect?: number | 'native';
  /** Larger type for the lead slot. */
  scale?: 'lead' | 'default';
  priority?: boolean;
  className?: string;
  delay?: number;
  /** Callback when a video card is clicked — opens VideoModal. */
  onPlay?: (project: VideoProject) => void;
};

/** True when `project` is a video project. */
function isVideo(project: Project): project is VideoProject {
  return project.type === 'video';
}

/**
 * One series, as it appears in a grid.
 *
 * Photography cards link to /work/[slug] for the gallery sequence.
 * Video cards open a VideoModal instead (no navigation).
 *
 * The whole card is a single interactive target, so a keyboard visitor
 * gets one stop and one focus ring. Metadata is always on the page —
 * hover only shifts it a few pixels and lifts the frame.
 */
export function ProjectCard({
  project,
  sizes,
  aspect = 'native',
  scale = 'default',
  priority = false,
  className,
  delay = 0,
  onPlay,
}: ProjectCardProps) {
  const video = isVideo(project);

  const cardContent = (
    <>
      <div className="relative overflow-hidden">
        <Photo
          id={project.coverId}
          alt={describe(project.coverId)}
          sizes={sizes}
          aspect={aspect}
          priority={priority}
          zoom
        />

        {/* Video play badge — centered gold circle */}
        {video ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/70 bg-ink/55 text-gold-bright backdrop-blur-sm shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:scale-110 sm:h-16 sm:w-16">
              {/* Play triangle */}
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
                className="ml-0.5"
              >
                <path d="M6 4l10 6-10 6V4z" />
              </svg>
            </span>
          </span>
        ) : null}

        {/* Duration pill — bottom-right corner of the cover frame */}
        {video && project.duration ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-3 bottom-3 rounded-sm border border-gold/40 bg-ink/75 px-2 py-1 text-[0.68rem] leading-none tracking-[0.16em] text-gold-bright backdrop-blur-sm sm:right-4 sm:bottom-4"
          >
            {project.duration}
          </span>
        ) : null}
      </div>

      <div className="mt-5 flex items-baseline justify-between gap-4">
        <h3
          className={cx(
            'font-display transition-colors duration-500 group-hover:text-selenium',
            scale === 'lead' ? 'text-display-m' : 'text-display-s'
          )}
        >
          {project.title}
        </h3>
        <span className="eyebrow shrink-0 text-paper-dim transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:-translate-y-0.5">
          {project.year ?? '—'}
        </span>
      </div>

      <p className="mt-2 eyebrow">
        {project.categoryName}
        {video && project.duration ? ` · ${project.duration}` : ` · ${project.frameCount} frames`}
      </p>

      {scale === 'lead' ? (
        <p className="mt-4 max-w-md text-sm text-paper-dim">{project.description}</p>
      ) : null}
    </>
  );

  if (video) {
    return (
      <Reveal
        as="li"
        variant="fade"
        delay={delay}
        className={cx('group cursor-pointer', className)}
      >
        <button
          type="button"
          onClick={() => onPlay?.(project)}
          className="block w-full text-left"
          aria-label={`Play ${project.title}`}
        >
          {cardContent}
        </button>
      </Reveal>
    );
  }

  return (
    <Reveal as="li" variant="fade" delay={delay} className={cx('group', className)}>
      <Link href={`/work/${project.slug}`}>{cardContent}</Link>
    </Reveal>
  );
}
