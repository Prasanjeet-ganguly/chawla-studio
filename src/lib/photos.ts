import { PHOTOS, PHOTO_IDS, TOTAL_PHOTOS, type Photo } from './photos.generated';

export type { Photo };
export { PHOTOS, PHOTO_IDS, TOTAL_PHOTOS };

/**
 * Resolves a photograph by id, throwing on a miss.
 *
 * Curation in projects.ts references photographs by filename slug. If a file is
 * renamed or removed from /Photos, this fails loudly during the build instead
 * of shipping an empty frame.
 */
export function getPhoto(id: string): Photo {
  const photo = PHOTOS[id];
  if (!photo) {
    throw new Error(
      `Unknown photograph "${id}". Available ids come from /Photos — run \`npm run photos\` after adding files.`
    );
  }
  return photo;
}

export const getPhotos = (ids: readonly string[]): Photo[] => ids.map(getPhoto);

/** Photographs wider than they are tall, for full-bleed and hero slots. */
export const isLandscape = (photo: Photo): boolean => photo.aspectRatio > 1.05;

/**
 * The smallest responsive candidate. Used for WebGL textures, where a 480px
 * frame is indistinguishable at scene scale and a 2400px one would stall the
 * first paint.
 */
export function thumbUrl(photo: Photo): string {
  const smallest = photo.srcSet.split(',')[0]?.trim().split(' ')[0];
  return smallest ?? photo.src;
}

/**
 * Deterministic shuffle so ambient compositions (the 3D depth field, the
 * philosophy strip) vary between slots without changing between renders.
 */
export function pickSpread(ids: readonly string[], count: number, offset = 0): string[] {
  if (ids.length === 0) return [];
  const step = Math.max(1, Math.floor(ids.length / count));
  const out: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const id = ids[(offset + i * step) % ids.length];
    if (id) out.push(id);
  }
  return out;
}
