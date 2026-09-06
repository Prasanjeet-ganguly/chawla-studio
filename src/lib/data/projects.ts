/**
 * The studio's curated work.
 *
 * Every photograph referenced here is a real frame from /Photos — there is no
 * placeholder imagery anywhere on the site. What *is* placeholder is the
 * editorial copy: `title` and `description` were written from the pictures
 * themselves so the pages read properly, and Chawla Studio should replace them
 * with the real client stories. Nothing here asserts a fact about the studio,
 * a client, a venue or a location.
 *
 * Years are never typed by hand. They are read from each frame's EXIF capture
 * date and omitted entirely when the camera did not record one — see
 * `deriveYear` below.
 */
import { PHOTOS, getPhoto, type Photo } from '@/lib/photos';

/** Portfolio group discriminator. */
export type PortfolioGroup = 'photography' | 'video';

/** Exact photography subcategories in visible order. */
export type PhotographyCategory =
  | 'Wedding'
  | 'Pre-Wedding'
  | 'Haldi'
  | 'Mehendi'
  | 'Ring Ceremony';

/** Exact video subcategories in visible order. */
export type VideoCategory =
  | 'Teaser'
  | 'Trailer'
  | 'Highlights'
  | 'Reels';

/** Union of all valid project categories. */
export type ProjectCategory = PhotographyCategory | VideoCategory;

/** Master category lists for UI and validation. */
export const PHOTOGRAPHY_CATEGORIES: readonly PhotographyCategory[] = [
  'Wedding',
  'Pre-Wedding',
  'Haldi',
  'Mehendi',
  'Ring Ceremony',
] as const;

export const VIDEO_CATEGORIES: readonly VideoCategory[] = [
  'Teaser',
  'Trailer',
  'Highlights',
  'Reels',
] as const;

// ─── Base & Discriminated Union Types ────────────────────────────────────────

/** Base project properties shared by both photography and video. */
type BaseProject = {
  /** Optional internal ID for reference (not used in routing). */
  id?: string;
  /** URL-friendly slug for static routes. */
  slug: string;
  /** Human-readable title. */
  title: string;
  /** Editorial description (placeholder copy to be replaced with real stories). */
  description: string;
  /** Cover frame ID from /Photos library. */
  coverId: string;
  /** Whether this project takes the featured lead slot on homepage. */
  featured?: boolean;
  /** Capture year from EXIF, or null if unavailable. */
  year: number | null;
  /** Human-readable month/year from EXIF, or null if unavailable. */
  month: string | null;
  /** Number of frames/media items in the project. */
  frameCount: number;
  /** Displayable category name (e.g. "Wedding"). */
  categoryName: string;
};

/** Photography-specific project properties. */
export type PhotographyProject = BaseProject & {
  type: 'photography';
  category: PhotographyCategory;
  /** Every frame in the series, in reading order. */
  photoIds: readonly string[];
};

/** Video-specific project properties. */
export type VideoProject = BaseProject & {
  type: 'video';
  category: VideoCategory;
  /** URL to hosted video (YouTube, Vimeo, or self-hosted). */
  videoUrl?: string | null;
  /** Aspect ratio of the video (9/16 for reels, 16/9 for cinematic). */
  aspectRatio?: number;
  /** Human-readable duration (e.g. "0:45", "2:30"). */
  duration?: string | null;
  /** Optional accompanying still frames/gallery. */
  photoIds?: readonly string[];
};

/** Union of all valid project types. */
export type Project = PhotographyProject | VideoProject;

// ─── EXIF Helpers ────────────────────────────────────────────────────────────

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

/**
 * The year the series was photographed, or null.
 *
 * Read from EXIF, never assumed. Sixteen of the studio's originals came off a
 * body whose clock had never been set, so `capture.year` is null for them; a
 * series made up entirely of those frames simply has no year and the UI omits
 * the field rather than printing a guess.
 */
export function deriveYear(photoIds: readonly string[]): number | null {
  const years = photoIds
    .map((id) => getPhoto(id).capture.year)
    .filter((year): year is number => year !== null);
  return years.length > 0 ? Math.min(...years) : null;
}

/** "March 2024", or null when no frame in the series carries a date. */
export function deriveMonth(photoIds: readonly string[]): string | null {
  const dates = photoIds
    .map((id) => getPhoto(id).capture.date)
    .filter((date): date is string => date !== null)
    .sort();
  const first = dates[0];
  if (!first) return null;
  const [year, month] = first.split('-');
  const name = MONTHS[Number(month) - 1];
  return name ? `${name} ${year}` : year ?? null;
}

// ─── Curated Data ────────────────────────────────────────────────────────────

/** Photography series using verified real frames from /Photos organized by category folder. */
const RAW_PHOTOGRAPHY_SERIES = [
  {
    type: 'photography' as const,
    slug: 'the-beginning',
    title: 'The Beginning',
    category: 'Ring Ceremony' as const,
    description:
      'Rings in shallow dishes of kumkum, henna still drying, and a marble lobby held for two people. The evening a family starts saying yes.',
    coverId: '0f5a4587',
    featured: true,
    photoIds: [
      '0f5a4569',
      '0f5a4579',
      '0f5a4584',
      '0f5a4587',
      '0f5a4594',
      '0f5a4601',
      '0f5a4616',
      '0f5a4684',
      '0f5a5046',
      '0f5a5048',
      '0f5a5061',
      '0f5a5062',
      '0f5a5067',
      '0f5a6604',
      '0f5a6744',
    ],
    categoryName: 'Ring Ceremony',
  },
  {
    type: 'photography' as const,
    slug: 'night-of-celebration',
    title: 'Night of Celebration',
    category: 'Wedding' as const,
    description:
      'Cold sparks, low fog, and a room that goes quiet for a moment before the floor fills.',
    coverId: '0f5a6488',
    photoIds: [
      '0f5a6488',
      '0f5a6489',
      '0f5a6491',
      '0f5a6494',
      '0f5a6503',
      '0f5a6506',
      '0f5a6528',
      '0f5a6531',
      '0f5a6536',
      '0f5a6545',
      '0f5a6631',
    ],
    categoryName: 'Wedding',
  },
  {
    type: 'photography' as const,
    slug: 'two-souls',
    title: 'Two Souls',
    category: 'Wedding' as const,
    description:
      'A sword set down, an elder’s hands, a knot tied across the fire. The part of the day that belongs to the family rather than the camera.',
    coverId: '0f5a9991',
    photoIds: [
      '0f5a9678',
      '0f5a9697',
      '0f5a9856',
      '0f5a9946',
      '0f5a9959',
      '0f5a9962',
      '0f5a9983',
      '0f5a9991',
    ],
    categoryName: 'Wedding',
  },
  {
    type: 'photography' as const,
    slug: 'solitary-grace',
    title: 'Solitary Grace',
    category: 'Wedding' as const,
    description:
      'Maroon and silver against quiet light, emeralds placed, and the stillness before the celebrations begin.',
    coverId: '0f5a6329',
    photoIds: [
      '0f5a6305',
      '0f5a6324',
      '0f5a6329',
      '0f5a6360',
      '0f5a6366',
    ],
    categoryName: 'Wedding',
  },
];

const PHOTOGRAPHY_SERIES: readonly PhotographyProject[] = RAW_PHOTOGRAPHY_SERIES.map((p) => ({
  ...p,
  year: deriveYear(p.photoIds),
  month: deriveMonth(p.photoIds),
  frameCount: p.photoIds.length,
}));

/** Curated video series — official films from Chawla Studio. */
const RAW_VIDEO_SERIES = [
  {
    type: 'video' as const,
    slug: 'cinematic-wedding-teaser',
    title: 'Teaser 1',
    category: 'Teaser' as const,
    description:
      'A cinematic glimpse into the celebration, weaving together key moments and emotional highlights.',
    coverId: 'teaser-1',
    videoUrl: 'https://youtu.be/1etOrEXAWkA?si=05ibRs31vrKpTED8',
    aspectRatio: 16 / 9,
    duration: '6:38',
    photoIds: ['teaser-1', '0f5a9991', '0f5a9678', '0f5a9959', '0f5a9962'],
    categoryName: 'Teaser',
  },
  {
    type: 'video' as const,
    slug: 'cinematic-wedding-trailer',
    title: 'Trailer 1',
    category: 'Trailer' as const,
    description:
      'An emotional wedding film trailer capturing the joy, rituals, and unforgettable celebrations.',
    coverId: 'trailer-1',
    videoUrl: 'https://youtu.be/U0I1RKO-6Ho',
    aspectRatio: 16 / 9,
    duration: '7:03',
    photoIds: ['trailer-1', '0f5a9991', '0f5a9678', '0f5a9959', '0f5a9962'],
    categoryName: 'Trailer',
  },
  {
    type: 'video' as const,
    slug: 'cinematic-wedding-highlights',
    title: 'Highlights 1',
    category: 'Highlights' as const,
    description:
      'A curated highlight reel capturing the emotion, grandeur, and unforgettable celebrations.',
    coverId: 'highlight-1',
    videoUrl: 'https://youtu.be/Cb2fObhWWyQ',
    aspectRatio: 16 / 9,
    duration: '3:45',
    photoIds: ['highlight-1', '0f5a9991', '0f5a9678', '0f5a9959', '0f5a9962'],
    categoryName: 'Highlights',
  },
  {
    type: 'video' as const,
    slug: 'cinematic-wedding-highlights-2',
    title: 'Highlights 2',
    category: 'Highlights' as const,
    description:
      'A vivid wedding highlights film weaving together sacred ceremonies, celebration, and heartfelt memories.',
    coverId: 'highlight-2',
    videoUrl: 'https://youtu.be/XCMc5XBaqFA',
    aspectRatio: 16 / 9,
    duration: '4:12',
    photoIds: ['highlight-2', '0f5a9991', '0f5a9678', '0f5a9959', '0f5a9962'],
    categoryName: 'Highlights',
  },
];

const VIDEO_SERIES: readonly VideoProject[] = RAW_VIDEO_SERIES.map((p) => ({
  ...p,
  year: deriveYear(p.photoIds),
  month: deriveMonth(p.photoIds),
  frameCount: p.photoIds.length,
}));

/** Combined projects array for use throughout the application. */
export const projects: readonly Project[] = [
  ...PHOTOGRAPHY_SERIES,
  ...VIDEO_SERIES,
];

// ─── Derived Utilities ───────────────────────────────────────────────────────

/** URL-friendly slugs for all projects. */
export const projectSlugs = projects.map((p) => p.slug);

/** Retrieve a project by slug, or undefined if not found. */
export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

/** The series that takes the large slot on the home page. */
export const leadProject = projects.find((p) => p.featured) ?? projects[0];

/** Photography categories with at least one published series, for the archive filters. */
export const activeCategories = PHOTOGRAPHY_CATEGORIES.filter(
  (category) =>
    projects.some(
      (project) =>
        project.type === 'photography' && project.category === category
    )
);

/** Video categories with at least one published series. */
export const activeVideoCategories = VIDEO_CATEGORIES.filter(
  (category) =>
    projects.some(
      (project) => project.type === 'video' && project.category === category
    )
);

/** Previous and next series, wrapping, for the end of a project page. */
export function projectNeighbours(
  slug: string
): { prev: Project; next: Project } | null {
  const index = projects.findIndex((p) => p.slug === slug);
  if (index === -1) return null;
  const count = projects.length;
  return {
    prev: projects[(index - 1 + count) % count]!,
    next: projects[(index + 1) % count]!,
  };
}

/** Every frame the studio has published, in curation order. */
export const allProjectPhotoIds: readonly string[] = projects
  .filter((p): p is PhotographyProject => p.type === 'photography')
  .flatMap((p) => [...(p.photoIds ?? [])]);

/**
 * Detects the category of a photograph from its directory path in /Photos.
 */
export function getPhotoCategory(photo: Photo): PhotographyCategory | null {
  const parts = photo.source.split('/');
  if (parts.length >= 3 && parts[0]?.toLowerCase() === 'photos') {
    const folder = parts[1];
    if (!folder) return null;
    if (/^wedding$/i.test(folder)) return 'Wedding';
    if (/^pre-?wedding$/i.test(folder)) return 'Pre-Wedding';
    if (/^haldi$/i.test(folder)) return 'Haldi';
    if (/^mehendi$/i.test(folder)) return 'Mehendi';
    if (/^ring\s*ceremony$/i.test(folder)) return 'Ring Ceremony';
  }
  return null;
}

/**
 * Returns all photograph IDs belonging to a specific category or 'all'.
 */
export function getPhotosByCategory(
  category: 'all' | PhotographyCategory
): string[] {
  if (category === 'all') {
    return Object.keys(PHOTOS);
  }
  return Object.entries(PHOTOS)
    .filter(([_, photo]) => getPhotoCategory(photo) === category)
    .map(([id]) => id);
}

