/** Joins class names, dropping falsy values. Small stand-in for clsx. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

export const lerp = (from: number, to: number, t: number): number =>
  from + (to - from) * t;

/** Maps `value` from one range to another, clamped to the output range. */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  if (inMax === inMin) return outMin;
  const t = clamp((value - inMin) / (inMax - inMin), 0, 1);
  return outMin + t * (outMax - outMin);
}

/** Two-digit frame number, as printed along the rebate of a film strip. */
export const frameNumber = (index: number): string =>
  String(index + 1).padStart(2, '0');

/**
 * Splits a string into words for staggered entrance animations, keeping the
 * trailing space so the reflowed line is identical to the original.
 */
export const toWords = (text: string): string[] => text.split(/(\s+)/);

/**
 * Converts standard YouTube and Vimeo URLs into responsive embed URLs.
 * Adds autoplay=1, rel=0, and playsinline=1 to keep playback directly on-site.
 */
export function toEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);

    // Handle YouTube URLs (youtube.com, youtu.be, youtube-nocookie.com)
    if (
      parsed.hostname.includes('youtube.com') ||
      parsed.hostname.includes('youtube-nocookie.com') ||
      parsed.hostname.includes('youtu.be')
    ) {
      let videoId = '';
      const si = parsed.searchParams.get('si');

      if (parsed.hostname.includes('youtu.be')) {
        videoId = parsed.pathname.slice(1).split('/')[0] || '';
      } else {
        const v = parsed.searchParams.get('v');
        if (v) {
          videoId = v;
        } else {
          const pathSegments = parsed.pathname.split('/').filter(Boolean);
          if ((pathSegments[0] === 'embed' || pathSegments[0] === 'shorts') && pathSegments[1]) {
            videoId = pathSegments[1];
          }
        }
      }

      if (videoId) {
        const params = new URLSearchParams();
        if (si) params.set('si', si);
        params.set('autoplay', '1');
        params.set('rel', '0');
        params.set('playsinline', '1');
        params.set('controls', '1');
        return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
      }
    }

    // Handle Vimeo URLs
    if (parsed.hostname.includes('vimeo.com')) {
      const id = parsed.pathname.split('/').filter(Boolean).pop();
      if (id && /^\d+$/.test(id)) {
        return `https://player.vimeo.com/video/${id}?autoplay=1&playsinline=1`;
      }
    }
  } catch {
    // Return verbatim if not standard URL
  }
  return trimmed;
}

