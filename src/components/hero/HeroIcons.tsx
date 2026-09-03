import type { ReactNode } from 'react';
import type { StatIcon } from '@/lib/site.config';

/**
 * The hero's line icons, drawn rather than downloaded.
 *
 * All of them are hairline strokes in `currentColor`, so they inherit the gold
 * from whatever they sit inside and never need a second colour token. Each one
 * fills its parent — size them by sizing the element they are placed in, which
 * keeps two competing `h-*` utilities from ever landing on the same node.
 */
function Stroke({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.05}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className="h-full w-full"
    >
      {children}
    </svg>
  );
}

/** Years behind the camera. */
export function CameraIcon() {
  return (
    <Stroke>
      <path d="M9.1 6.4l1.1-2.1h3.6l1.1 2.1" />
      <rect x="2.6" y="6.4" width="18.8" height="13.2" rx="1.8" />
      <circle cx="12" cy="13" r="3.9" />
      <path d="M18.1 9.6h.01" />
    </Stroke>
  );
}

/** Couples and families photographed. */
export function PeopleIcon() {
  return (
    <Stroke>
      <circle cx="9.2" cy="8.4" r="3.1" />
      <path d="M3.4 19.8c0-3.2 2.6-5.4 5.8-5.4s5.8 2.2 5.8 5.4" />
      <circle cx="17.2" cy="9.6" r="2.2" />
      <path d="M16.4 14.6c2.6.3 4.4 2.3 4.4 5.2" />
    </Stroke>
  );
}

/** Finished sets of frames. */
export function FramesIcon() {
  return (
    <Stroke>
      <path d="M7.4 8.2V5.4h13.2v10.4h-2.9" />
      <rect x="3" y="8.2" width="14.7" height="11.4" rx="1.4" />
      <circle cx="7.4" cy="12.2" r="1.3" />
      <path d="M4.1 18.2l3.6-3.7 2.6 2.4 2.4-2.7 3.9 4" />
    </Stroke>
  );
}

/**
 * An average review score. Filled rather than stroked: a hairline five-pointed
 * star at 20px closes its own gaps and reads as a blob, and this is the one
 * figure whose glyph is conventional enough to be recognised as a shape.
 */
export function RatingIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className="h-full w-full"
    >
      <path d="M12 3.1l2.72 5.62 6.18.84-4.5 4.3 1.11 6.14L12 17.09l-5.51 2.91 1.11-6.14-4.5-4.3 6.18-.84z" />
    </svg>
  );
}

const STAT_ICONS: Record<StatIcon, () => ReactNode> = {
  camera: CameraIcon,
  people: PeopleIcon,
  frames: FramesIcon,
  rating: RatingIcon,
};

/** Picks the icon a configured statistic asked for. */
export function StatGlyph({ icon }: { icon: StatIcon }) {
  const Glyph = STAT_ICONS[icon];
  return <Glyph />;
}

/** Sits at the top of the wedding badge. */
export function CrownIcon() {
  return (
    <Stroke>
      <path d="M3.9 17.6h16.2" />
      <path d="M4.6 17.6L3.1 8.4l4.6 3.3L12 5.4l4.3 6.3 4.6-3.3-1.5 9.2" />
      <circle cx="3.1" cy="7.4" r="0.9" />
      <circle cx="12" cy="4.3" r="0.9" />
      <circle cx="20.9" cy="7.4" r="0.9" />
    </Stroke>
  );
}

/** Opens the "book a shoot" enquiry, in the masthead. */
export function CalendarIcon() {
  return (
    <Stroke>
      <rect x="3.4" y="5.6" width="17.2" height="15" rx="1.6" />
      <path d="M8.2 3.4v4M15.8 3.4v4M3.4 10.4h17.2" />
      <path d="M8.2 14.4h.01M12 14.4h.01M15.8 14.4h.01" />
    </Stroke>
  );
}

/**
 * The showreel trigger. Filled rather than stroked: a hollow triangle at this
 * size reads as an outline, and the reference's play mark is solid gold.
 */
export function PlayIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className="h-full w-full"
    >
      <path d="M9 6.6l8.4 5.4L9 17.4z" />
    </svg>
  );
}
