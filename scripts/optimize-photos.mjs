/**
 * Photography build pipeline for Chawla Studio.
 *
 * Reads the studio's full-resolution originals from /Photos and emits
 * web-ready, responsive variants into /public/photos plus a typed manifest at
 * src/lib/photos.generated.ts — dimensions, srcSet, an inline LQIP blur, and
 * the frame's real capture data lifted from EXIF.
 *
 * Nothing in the app reads /Photos directly: components consume the manifest,
 * so originals never ship to the browser. Quarter-turn corrections for frames
 * shot vertically without an orientation flag live in photos.rotation.json.
 *
 *   node scripts/optimize-photos.mjs            incremental (mtime+size cache)
 *   node scripts/optimize-photos.mjs --force    rebuild everything
 *   node scripts/optimize-photos.mjs --avif     also emit AVIF (slower build)
 */
import { existsSync } from 'node:fs';
import { mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import exifReader from 'exif-reader';
import sharp from 'sharp';
import {
  buildVariants,
  mapLimit,
  readJson,
  slugify,
  toSrcSet,
} from './lib/raster.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const SOURCE_DIR = path.join(ROOT, 'Photos');
const OUT_DIR = path.join(ROOT, 'public', 'photos');
const MANIFEST = path.join(ROOT, 'src', 'lib', 'photos.generated.ts');
const CACHE_FILE = path.join(ROOT, '.photo-cache.json');
const ROTATION_FILE = path.join(ROOT, 'photos.rotation.json');

const WIDTHS = [480, 800, 1200, 1800, 2400];
const JPEG_FALLBACK_WIDTH = 1200;
const CONCURRENCY = 4;

const FORCE = process.argv.includes('--force');
const WITH_AVIF = process.argv.includes('--avif');

/** `1/200` under a second, `2s` over it — how a photographer says it. */
function formatShutter(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return null;
  if (seconds >= 1) return `${Number(seconds.toFixed(1))}s`;
  return `1/${Math.round(1 / seconds)}`;
}

/**
 * A capture date we are willing to print, or null.
 *
 * 16 of the studio's originals carry `2000:01:01` — the default an unset camera
 * clock writes, not a date anyone shot on. Since the site prints capture data as
 * fact, an implausible timestamp has to become "unknown" rather than a wrong
 * year on the page. Anything before 2005 or in the future is treated as a clock
 * that was never set.
 */
function plausibleDate(value) {
  if (!(value instanceof Date) || Number.isNaN(value.valueOf())) return null;
  const year = value.getUTCFullYear();
  if (year < 2005 || year > new Date().getUTCFullYear() + 1) return null;
  return value;
}

/**
 * Real capture data, or nulls. Every field is read off the frame — none of it
 * is inferred, so the marginalia the site prints is always true.
 */
function readCapture(exifBuffer) {
  const empty = { year: null, date: null, camera: null, lens: null, focal: null, aperture: null, shutter: null, iso: null };
  if (!exifBuffer) return empty;

  let tags;
  try {
    tags = exifReader(exifBuffer);
  } catch {
    return empty;
  }

  const photo = tags?.Photo ?? {};
  const image = tags?.Image ?? {};
  const iso = photo.ISOSpeedRatings ?? photo.PhotographicSensitivity ?? null;
  const taken = plausibleDate(
    photo.DateTimeOriginal ?? photo.DateTimeDigitized ?? image.DateTime ?? null
  );

  return {
    year: taken ? taken.getUTCFullYear() : null,
    date: taken ? taken.toISOString().slice(0, 10) : null,
    camera: typeof image.Model === 'string' ? image.Model.trim() : null,
    lens: typeof photo.LensModel === 'string' ? photo.LensModel.trim() : null,
    focal: Number.isFinite(photo.FocalLength) ? `${Math.round(photo.FocalLength)}mm` : null,
    aperture: Number.isFinite(photo.FNumber) ? `f/${Number(photo.FNumber.toFixed(1))}` : null,
    shutter: formatShutter(photo.ExposureTime),
    iso: Number.isFinite(iso) ? Math.round(iso) : null,
  };
}


/** Renders every variant for one original and returns its manifest entry. */
async function processPhoto(file, rotation) {
  const id = slugify(file);
  const built = await buildVariants({
    file: path.join(SOURCE_DIR, file),
    id,
    outDir: OUT_DIR,
    urlBase: '/photos',
    widths: WIDTHS,
    rotation,
    avif: WITH_AVIF,
    jpegWidth: JPEG_FALLBACK_WIDTH,
  });

  return {
    id,
    width: built.width,
    height: built.height,
    aspectRatio: built.aspectRatio,
    src: built.src,
    webp: built.webp,
    avif: built.avif,
    blurDataURL: built.blurDataURL,
    capture: readCapture(built.meta.exif),
    source: `Photos/${file}`,
    rotation,
  };
}

const literal = (value) => (value === null || value === undefined ? 'null' : JSON.stringify(value));

function renderManifest(entries) {
  const records = entries
    .map((p) => {
      const c = p.capture;
      const lines = [
        `    id: ${JSON.stringify(p.id)},`,
        `    width: ${p.width},`,
        `    height: ${p.height},`,
        `    aspectRatio: ${p.aspectRatio},`,
        `    src: ${JSON.stringify(p.src)},`,
        `    srcSet: ${JSON.stringify(toSrcSet(p.webp))},`,
        p.avif.length ? `    avifSrcSet: ${JSON.stringify(toSrcSet(p.avif))},` : null,
        `    blurDataURL: ${JSON.stringify(p.blurDataURL)},`,
        `    capture: {`,
        `      year: ${literal(c.year)},`,
        `      date: ${literal(c.date)},`,
        `      camera: ${literal(c.camera)},`,
        `      lens: ${literal(c.lens)},`,
        `      focal: ${literal(c.focal)},`,
        `      aperture: ${literal(c.aperture)},`,
        `      shutter: ${literal(c.shutter)},`,
        `      iso: ${literal(c.iso)},`,
        `    },`,
        `    source: ${JSON.stringify(p.source)},`,
      ].filter(Boolean);
      return `  ${JSON.stringify(p.id)}: {\n${lines.join('\n')}\n  },`;
    })
    .join('\n');

  return `${MANIFEST_HEADER}
export const PHOTOS: Record<string, Photo> = {
${records}
};

export const PHOTO_IDS: readonly string[] = Object.keys(PHOTOS);

export const TOTAL_PHOTOS = ${entries.length};
`;
}

const MANIFEST_HEADER = `// AUTO-GENERATED by scripts/optimize-photos.mjs — do not edit by hand.
// Re-run \`npm run photos\` after adding or replacing files in /Photos.

/** Capture data read straight off the frame. Null where the camera wrote none. */
export type Capture = {
  year: number | null;
  /** ISO date, e.g. "2024-03-11". */
  date: string | null;
  camera: string | null;
  lens: string | null;
  /** Pre-formatted, e.g. "85mm". */
  focal: string | null;
  /** Pre-formatted, e.g. "f/2.8". */
  aperture: string | null;
  /** Pre-formatted, e.g. "1/200". */
  shutter: string | null;
  iso: number | null;
};

export type Photo = {
  /** Slug derived from the original filename. */
  id: string;
  /** Width after orientation correction. */
  width: number;
  height: number;
  aspectRatio: number;
  /** Baseline JPEG, used as the <img src> fallback. */
  src: string;
  /** WebP responsive candidates. */
  srcSet: string;
  /** AVIF responsive candidates, present only when built with --avif. */
  avifSrcSet?: string;
  /** Inline 20px blur placeholder. */
  blurDataURL: string;
  capture: Capture;
  /** Path to the untouched original, for provenance. */
  source: string;
};
`;

async function getPhotoFiles(dir, baseDir = dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await getPhotoFiles(fullPath, baseDir)));
    } else if (entry.isFile() && /\.(jpe?g|png|tiff?|webp)$/i.test(entry.name)) {
      const relPath = path.relative(baseDir, fullPath).split(path.sep).join('/');
      files.push(relPath);
    }
  }
  return files.sort();
}

async function main() {
  if (!existsSync(SOURCE_DIR)) {
    console.error(`[photos] source directory not found: ${SOURCE_DIR}`);
    process.exit(1);
  }

  await mkdir(OUT_DIR, { recursive: true });
  await mkdir(path.dirname(MANIFEST), { recursive: true });

  const files = await getPhotoFiles(SOURCE_DIR);

  if (files.length === 0) {
    console.error('[photos] no source photographs found in /Photos');
    process.exit(1);
  }

  const rotations = (await readJson(ROTATION_FILE, {})).rotate ?? {};
  const basenames = new Set(files.map((f) => path.basename(f)));
  const unknown = Object.keys(rotations).filter((name) => !basenames.has(name) && !files.includes(name));
  if (unknown.length > 0) {
    console.warn(`[photos] photos.rotation.json names files that are not in /Photos: ${unknown.join(', ')}`);
  }

  const cache = await readJson(FORCE ? '' : CACHE_FILE, {});
  const nextCache = {};
  let built = 0;
  let reused = 0;

  const entries = await mapLimit(files, CONCURRENCY, async (file) => {
    const filename = path.basename(file);
    const rotation = Number(rotations[filename] ?? rotations[file] ?? 0) || 0;
    const info = await stat(path.join(SOURCE_DIR, file));
    const key = [
      info.size,
      Math.round(info.mtimeMs),
      WIDTHS.join('-'),
      WITH_AVIF ? 'avif' : 'webp',
      `rot${rotation}`,
      'v2',
    ].join(':');
    const cached = cache[file] ?? cache[filename];

    if (cached && cached.key === key) {
      const present = cached.entry.webp.every((v) =>
        existsSync(path.join(ROOT, 'public', v.url.replace(/^\/+/, '')))
      );
      if (present) {
        // The variants are settled, but EXIF is cheap to re-read and the rules
        // in readCapture() evolve — so capture data is always derived fresh
        // rather than trusted from cache.
        const { exif } = await sharp(path.join(SOURCE_DIR, file), { failOn: 'none' }).metadata();
        const entry = { ...cached.entry, capture: readCapture(exif) };
        nextCache[file] = { key, entry };
        reused += 1;
        return entry;
      }
    }

    const entry = await processPhoto(file, rotation);
    nextCache[file] = { key, entry };
    built += 1;
    process.stdout.write(
      `[photos] ${entry.id} ${entry.width}x${entry.height}${rotation ? ` rot${rotation}` : ''}\n`
    );
    return entry;
  });

  await writeFile(MANIFEST, renderManifest(entries), 'utf8');
  await writeFile(CACHE_FILE, JSON.stringify(nextCache, null, 2), 'utf8');

  const withExif = entries.filter((e) => e.capture.aperture !== null).length;
  console.log(
    `[photos] ${entries.length} photographs ready — ${built} built, ${reused} reused, ` +
      `${withExif} with capture data${WITH_AVIF ? ', avif on' : ''}`
  );
}

main().catch((error) => {
  console.error('[photos] failed:', error);
  process.exit(1);
});





