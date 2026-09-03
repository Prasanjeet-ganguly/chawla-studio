/**
 * The five things the studio does.
 *
 * Copy is the studio's own. No pricing appears anywhere: rates are quoted per
 * event, and inventing a number would be worse than omitting one. If Chawla
 * Studio wants packages on the site later, add a `from` field here and render
 * it — do not let a component hard-code a figure.
 */

export type Service = {
  id: string;
  title: string;
  /** One line, printed under the title. */
  summary: string;
  /**
   * A frame from the library that shows this kind of work, or null where the
   * studio has not published an example yet.
   */
  photoId: string | null;
};

export const services: readonly Service[] = [
  {
    id: 'wedding-stories',
    title: 'Wedding Stories',
    summary: 'Full-day coverage, told as one continuous story.',
    photoId: '0f5a9991',
  },
  {
    id: 'pre-wedding',
    title: 'Pre-Wedding',
    summary: 'Relaxed, cinematic sessions before the celebration.',
    photoId: null,
  },
  {
    id: 'portraits',
    title: 'Portraits',
    summary: 'Honest portraits with intentional light.',
    photoId: '0f5a6329',
  },
  {
    id: 'events',
    title: 'Events',
    summary: 'Celebrations, functions and family gatherings.',
    photoId: '0f5a6488',
  },
  {
    id: 'cinematic-films',
    title: 'Cinematic Films',
    summary: 'Films that feel like memory, not documentation.',
    photoId: null,
  },
];

/** Closing line for the services section, followed by the enquiry CTA. */
export const servicesClosing = 'Let’s create something unforgettable.';
