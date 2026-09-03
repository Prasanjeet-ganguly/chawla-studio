/**
 * Single source of truth for everything Chawla Studio needs to change without
 * touching components.
 *
 * Real business details are intentionally absent from the codebase. Each value
 * below reads from an environment variable and falls back to `null`, which the
 * UI renders as a clearly-marked placeholder rather than inventing a number,
 * address or handle. Fill in .env.local (see .env.example) to go live.
 */

const env = (value: string | undefined): string | null => {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
};

/** Digits-only phone number for wa.me links, e.g. 919812345678. */
const whatsappNumber = env(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER);

export const siteConfig = {
  brandName: 'Chawla Studio',
  brandNameLines: ['Chawla', 'Studio'] as const,
  tagline: 'Stories, Framed Forever.',
  discipline: 'Photography & Films',
  heroKicker: 'Photography · Films · Stories',
  shortDescription:
    'Chawla Studio is a photography and cinematography studio. We make pictures that hold on to the feeling of the day, not just the look of it.',
  footerLine: 'Made to be remembered.',

  /**
   * The opening frame. Copy, the CTA target, and — importantly — which
   * photograph hangs behind the type, so the studio can swap the hero image by
   * changing one id here rather than editing layout code.
   *
   * `photoId` is a slug from the studio's own library (see lib/photos.ts).
   * Alternates that suit the same composition: '0f5a6503' (couple on the gilded
   * settee) and '0f5a9678' (the two of them on the stair, sword in hand).
   */
  hero: {
    eyebrow: 'Capturing real moments',
    headingLines: ['We capture', 'Moments that'] as const,
    /** Set in the calligraphic script, in gold. */
    scriptLine: 'last forever',
    description: [
      'From the vows to the forever,',
      'we capture your story beautifully.',
    ] as const,
    primaryCta: { label: 'Explore our work', href: '/#work' },
    photoId: '0f5a6488',
    /**
     * A real showreel, once there is one — anything an iframe can embed
     * (YouTube, Vimeo). Left unset, the showreel button still opens, and the
     * dialog says plainly that the film is not published yet.
     */
    showreelUrl: env(process.env.NEXT_PUBLIC_SHOWREEL_URL) ?? 'https://youtu.be/1etOrEXAWkA',
    statement: {
      script: 'We don’t just take pictures,',
      caps: 'We create memories.',
    },
  },

  /** Absolute site URL, used for canonicals, sitemap and Open Graph. */
  url: env(process.env.NEXT_PUBLIC_SITE_URL) ?? 'http://localhost:3000',

  contact: {
    email: env(process.env.NEXT_PUBLIC_CONTACT_EMAIL),
    phone: env(process.env.NEXT_PUBLIC_CONTACT_PHONE),
    whatsappNumber,
    whatsappUrl: whatsappNumber
      ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
          "Hello Chawla Studio, I'd like to enquire about a session."
        )}`
      : null,
    location: env(process.env.NEXT_PUBLIC_STUDIO_LOCATION),
  },

  social: {
    instagram: env(process.env.NEXT_PUBLIC_INSTAGRAM_URL),
    instagramHandle: env(process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE),
    youtube: env(process.env.NEXT_PUBLIC_YOUTUBE_URL),
  },

  /** Where the enquiry form posts. Falls back to a mailto: compose. */
  enquiryEndpoint: env(process.env.NEXT_PUBLIC_ENQUIRY_ENDPOINT),
} as const;

export type SiteConfig = typeof siteConfig;

/** Sections observed for the active-section indicator, in document order. */
export const sectionIds = [
  'hero',
  'philosophy',
  'work',
  'services',
  'about',
  'contact',
] as const;

export type SectionId = (typeof sectionIds)[number];

export type NavLink = {
  label: string;
  href: string;
  /** Section the link points at, for the active mark. `null` for real routes. */
  section: SectionId | null;
};

/** Primary navigation. In-page anchors on the home route, plus the journal. */
export const navLinks: readonly NavLink[] = [
  { label: 'Home', href: '/#hero', section: 'hero' },
  { label: 'About', href: '/#about', section: 'about' },
  { label: 'Services', href: '/#services', section: 'services' },
  { label: 'Portfolio', href: '/#work', section: 'work' },
  { label: 'Blog', href: '/blog', section: null },
  { label: 'Contact', href: '/#contact', section: 'contact' },
] as const;

export type StatIcon = 'camera' | 'people' | 'frames' | 'rating';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * PLACEHOLDER FIGURES — these are sample numbers, not Chawla Studio's record.
 * ─────────────────────────────────────────────────────────────────────────────
 * The hero's statistics card, the wedding badge and the loading screen's panel
 * are part of the design, so they need numbers to hold their shape. Every one of
 * them is a placeholder taken from the layout reference, and none of it has been
 * verified with the studio.
 *
 * To publish real figures, set them in .env.local:
 *
 *   NEXT_PUBLIC_STAT_YEARS=12+
 *   NEXT_PUBLIC_STAT_CLIENTS=640+
 *   NEXT_PUBLIC_STAT_PROJECTS=1500+
 *   NEXT_PUBLIC_STAT_WEDDINGS=1100+
 *   NEXT_PUBLIC_STAT_RATING=4.8
 *   NEXT_PUBLIC_FIGURES_CONFIRMED=true
 *
 * Until `NEXT_PUBLIC_FIGURES_CONFIRMED` is true the hero and the loading screen
 * print a quiet "sample figures" mark beside them, so the site never states a
 * count it cannot stand behind. Setting it is the studio's confirmation that the
 * numbers are theirs; the mark then disappears and the compositions match the
 * reference exactly.
 */
/**
 * Each number read once, so the hero panel, the wedding crest and the loading
 * screen cannot end up quoting different totals for the same thing.
 */
const counts = {
  years: env(process.env.NEXT_PUBLIC_STAT_YEARS) ?? '10+',
  clients: env(process.env.NEXT_PUBLIC_STAT_CLIENTS) ?? '500+',
  projects: env(process.env.NEXT_PUBLIC_STAT_PROJECTS) ?? '1200+',
  weddings: env(process.env.NEXT_PUBLIC_STAT_WEDDINGS) ?? '1000+',
  rating: env(process.env.NEXT_PUBLIC_STAT_RATING) ?? '4.9',
} as const;

export const figures = {
  confirmed: env(process.env.NEXT_PUBLIC_FIGURES_CONFIRMED) === 'true',

  stats: [
    { icon: 'camera', value: counts.years, label: 'Years experience' },
    { icon: 'people', value: counts.clients, label: 'Happy clients' },
    { icon: 'frames', value: counts.projects, label: 'Projects completed' },
  ] as ReadonlyArray<{ icon: StatIcon; value: string; label: string }>,

  weddings: {
    value: counts.weddings,
    label: 'Weddings captured',
  },

  /**
   * An average review score. Sample content like the rest — and the one figure
   * that would be a claim about other people's opinions, so it carries the same
   * mark.
   */
  rating: {
    value: counts.rating,
    label: 'Client rating',
  },
} as const;

/**
 * The four figures on the loading screen, in the reference's order.
 *
 * Composed from the same reads as the hero's panel rather than restated, so the
 * studio sets each number once. `mark` is a glyph set in gold after the value —
 * the rating's star, which belongs to the typography rather than to the data.
 */
export const loadingStats: ReadonlyArray<{
  icon: StatIcon;
  value: string;
  label: string;
  mark?: string;
}> = [
  { icon: 'camera', value: counts.years, label: 'Years Experience' },
  { icon: 'people', value: counts.clients, label: 'Happy Couples' },
  { icon: 'frames', value: counts.weddings, label: 'Weddings Captured' },
  { icon: 'rating', value: counts.rating, label: 'Client Rating', mark: '★' },
];

/**
 * The cinematic preloader.
 *
 * Every word it prints lives here. The background photograph does not: it is
 * whatever image sits in /Loading Screen, built into responsive variants by
 * `npm run loading-image` and resolved through lib/loader-image.ts — so swapping
 * it is replacing a file, not editing code.
 *
 * `minVisible` keeps the screen from flashing past on a warm cache; `maxVisible`
 * is the hard release. Nothing in the loader is timed for its own sake — the
 * percentage tracks real asset readiness, and these two only bound it.
 */
export const loadingScreen = {
  brand: siteConfig.brandName,
  subtitle: 'Photography',
  tagline: 'Capturing moments that last forever',
  loadingText: 'Loading Beautiful Moments...',
  quote: {
    first: '“ Not just pictures,',
    /** Set in the calligraphic script, in gold. */
    highlight: 'Memories',
    last: 'for a lifetime ”',
  },
  /** How the background frame is described to a screen reader. */
  backgroundAlt:
    'A couple at their wedding, foreheads touching, lit by candles and strings of warm light',
  timing: {
    /**
     * Shortest time the screen is shown, so it reads as a title card rather than
     * a flash. Long enough for the staged composition to finish arriving.
     */
    minVisible: 1400,
    /** The same, with motion reduced: nothing is animating, so nothing is waited for. */
    minVisibleReduced: 650,
    /** Longest, whatever the network is doing. The visitor is never held. */
    maxVisible: 6000,
    /** The fade and lift as the curtain leaves. */
    exit: 800,
  },
} as const;


/**
 * True when the studio has supplied at least one real way to be reached.
 * Components use this to avoid rendering dead links.
 */
export const hasContactChannel =
  siteConfig.contact.email !== null ||
  siteConfig.contact.phone !== null ||
  siteConfig.contact.whatsappNumber !== null;

/**
 * True when an enquiry can actually be delivered — either a form endpoint or an
 * address for the mailto: fallback. With neither, the form says so plainly
 * instead of pretending to send.
 */
export const canSendEnquiry =
  siteConfig.enquiryEndpoint !== null || siteConfig.contact.email !== null;
