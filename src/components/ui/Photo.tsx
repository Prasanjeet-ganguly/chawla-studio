'use client';

import { useEffect, useRef, useState } from 'react';
import { getPhoto } from '@/lib/photos';
import { cx } from '@/lib/utils';

type PhotoProps = {
  /** Filename slug from /Photos, e.g. "0f5a6631". */
  id: string;
  /** Describes the photograph for screen readers. Required, never decorative. */
  alt: string;
  /** Layout hint for the browser's srcSet pick. */
  sizes: string;
  /**
   * Crop ratio for the frame. `'native'` keeps the photograph's own ratio, so
   * nothing is ever cropped or stretched. `'fill'` drops the ratio altogether
   * and lays the frame over its nearest positioned ancestor, for a full-bleed
   * layer whose shape belongs to the viewport rather than to the photograph.
   */
  aspect?: number | 'native' | 'fill';
  /** Which part of the frame survives a crop. */
  objectPosition?: string;
  /**
   * Slow zoom while an ancestor marked `group` is hovered or focused. Owned here
   * rather than passed in: Tailwind's `transition-*` utilities are mutually
   * exclusive, so a caller adding its own would silently cancel the load fade.
   */
  zoom?: boolean;
  priority?: boolean;
  className?: string;
  imgClassName?: string;
};

/**
 * Renders a studio photograph from the pre-built responsive variants.
 *
 * A 20px inline blur stands in until the real frame decodes, then cross-fades.
 * Sources are AVIF (when the pipeline was run with --avif), then WebP, then a
 * baseline JPEG, so there is always something to show.
 */
export function Photo({
  id,
  alt,
  sizes,
  aspect = 'native',
  objectPosition = 'center',
  zoom = false,
  priority = false,
  className,
  imgClassName,
}: PhotoProps) {
  const photo = getPhoto(id);
  const imgRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);

  // Images already in the HTTP cache can finish before hydration attaches
  // onLoad, which would leave the blur up forever.
  useEffect(() => {
    if (imgRef.current?.complete) setLoaded(true);
  }, []);

  const fill = aspect === 'fill';
  const ratio = fill ? undefined : aspect === 'native' ? photo.aspectRatio : aspect;

  return (
    <div
      // The positioning is owned here rather than passed in: `absolute` and
      // `relative` are the same CSS property, so a caller adding one through
      // `className` would be resolved by stylesheet order, not by intent.
      className={cx(
        fill ? 'absolute inset-0' : 'relative',
        'overflow-hidden bg-ink-raise',
        className
      )}
      style={{
        aspectRatio: ratio,
        backgroundImage: `url("${photo.blurDataURL}")`,
        backgroundSize: 'cover',
        backgroundPosition: objectPosition,
      }}
    >
      <picture>
        {photo.avifSrcSet ? (
          <source type="image/avif" srcSet={photo.avifSrcSet} sizes={sizes} />
        ) : null}
        <source type="image/webp" srcSet={photo.srcSet} sizes={sizes} />
        <img
          ref={imgRef}
          src={photo.src}
          alt={alt}
          width={photo.width}
          height={photo.height}
          sizes={sizes}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          onLoad={() => setLoaded(true)}
          className={cx(
            'h-full w-full object-cover transition-[opacity,transform] ease-[var(--ease-out-expo)]',
            loaded ? 'opacity-100' : 'opacity-0',
            zoom
              ? 'duration-[1200ms] group-hover:scale-[1.035] group-focus-visible:scale-[1.035]'
              : 'duration-700',
            imgClassName
          )}
          style={{ objectPosition }}
        />
      </picture>
    </div>
  );
}
