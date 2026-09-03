/**
 * Shared raster helpers for the build-time image pipelines.
 *
 * Two pipelines emit responsive variants — the photography library
 * (scripts/optimize-photos.mjs) and the loading screen's background
 * (scripts/optimize-loading-image.mjs). The resizing, the encoder settings and
 * the LQIP blur are identical work, so they live here once; each pipeline keeps
 * only what is genuinely its own (EXIF capture data, rotation corrections, the
 * shape of its manifest).
 */
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

/** Encoder settings, shared so the two pipelines cannot drift apart. */
export const QUALITY = {
  webp: 82,
  avif: 55,
  jpeg: 78,
  /** The inline blur-up placeholder: 20px wide, softened, thrown away cheap. */
  lqipWidth: 20,
};

/** Filename → url-safe id, e.g. "ChatGPT Image Aug 30.png" → "chatgpt-image-aug-30". */
export const slugify = (name) =>
  path
    .basename(name, path.extname(name))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/** Reads a JSON sidecar, falling back rather than throwing on absent/corrupt. */
export async function readJson(file, fallback) {
  if (!existsSync(file)) return fallback;
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch {
    return fallback;
  }
}

/** EXIF orientations 5–8 store the frame on its side. */
const exifSwapsAxes = (orientation) => orientation >= 5 && orientation <= 8;

/** Dimensions after EXIF auto-orientation and any manual quarter-turn. */
export function orientedSize(meta, rotation = 0) {
  let w = meta.width ?? 0;
  let h = meta.height ?? 0;
  if (exifSwapsAxes(meta.orientation ?? 1)) [w, h] = [h, w];
  if (Math.abs(rotation % 180) === 90) [w, h] = [h, w];
  return { width: w, height: h };
}

/** `/photos/x-800.webp 800w, …` — the srcSet a <source> element wants. */
export const toSrcSet = (variants) =>
  variants.map((v) => `${v.url} ${v.width}w`).join(', ');

/** Runs `worker` over `items` with a bounded number of in-flight tasks. */
export async function mapLimit(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index], index);
    }
  });
  await Promise.all(runners);
  return results;
}

/**
 * Renders every web variant of one original.
 *
 * Never upscales: candidate widths wider than the source are dropped, and a
 * source narrower than all of them still gets one variant at its own width. The
 * baseline JPEG exists so a bare `<img src>` resolves even where WebP does not.
 *
 * Returns the source metadata alongside the variants, so a caller that also
 * wants EXIF does not have to open the file twice.
 */
export async function buildVariants({
  file,
  id,
  outDir,
  urlBase,
  widths,
  rotation = 0,
  avif = false,
  jpegWidth = 1200,
}) {
  const meta = await sharp(file, { failOn: 'none' }).metadata();
  const { width, height } = orientedSize(meta, rotation);
  if (!width || !height) throw new Error(`unreadable dimensions: ${file}`);

  // EXIF auto-orientation first, then the manual quarter-turn for frames that
  // lost their orientation flag on export.
  const source = () => {
    const pipe = sharp(file, { failOn: 'none' }).rotate();
    return rotation ? pipe.rotate(rotation) : pipe;
  };

  const candidates = widths.filter((w) => w <= width);
  if (candidates.length === 0) candidates.push(width);

  const webpVariants = [];
  const avifVariants = [];
  for (const w of candidates) {
    const webpName = `${id}-${w}.webp`;
    await source()
      .resize({ width: w })
      .webp({ quality: QUALITY.webp, effort: 4 })
      .toFile(path.join(outDir, webpName));
    webpVariants.push({ width: w, url: `${urlBase}/${webpName}` });

    if (avif) {
      const avifName = `${id}-${w}.avif`;
      await source()
        .resize({ width: w })
        .avif({ quality: QUALITY.avif, effort: 3 })
        .toFile(path.join(outDir, avifName));
      avifVariants.push({ width: w, url: `${urlBase}/${avifName}` });
    }
  }

  const fallbackWidth = Math.min(jpegWidth, width);
  const fallbackName = `${id}-${fallbackWidth}.jpg`;
  await source()
    .resize({ width: fallbackWidth })
    .jpeg({ quality: QUALITY.jpeg, mozjpeg: true, progressive: true })
    .toFile(path.join(outDir, fallbackName));

  const lqip = await source()
    .resize({ width: QUALITY.lqipWidth })
    .blur(1.1)
    .webp({ quality: 32 })
    .toBuffer();

  return {
    meta,
    width,
    height,
    aspectRatio: Number((width / height).toFixed(6)),
    src: `${urlBase}/${fallbackName}`,
    webp: webpVariants,
    avif: avifVariants,
    blurDataURL: `data:image/webp;base64,${lqip.toString('base64')}`,
  };
}
