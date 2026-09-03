'use client';

import { useEffect, useRef, useState } from 'react';
import { LOADER_RISE, LOADER_STAGE, staged } from './stage';
import { loaderBackground, loaderBaseColor } from '@/lib/loader-image';
import { loadingScreen } from '@/lib/site.config';
import { cx } from '@/lib/utils';

/**
 * The supplied photograph, full bleed.
 *
 * The image is the design — it is not recreated with gradients and it is not
 * swapped for a stock frame. What is laid over it is only what small type needs
 * to stay legible: a warm ember base underneath while it decodes, then two
 * scrims, weighted to the middle band where the name and the bar sit, and a
 * vignette to close the corners. The candlelight and the reds come through.
 *
 * `fetchPriority="high"` is also how the progress bar finds this frame — see
 * tasks.ts — so the number the visitor watches is partly this image arriving.
 *
 * With /Loading Screen emptied there is no frame at all, and the composition
 * falls back to ink and its own gradients rather than a broken image.
 */
export function LoaderBackground({ shown, reduced }: { shown: boolean; reduced: boolean }) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);

  // A frame already in the HTTP cache can finish before hydration attaches
  // onLoad, which would leave the blur up for the whole of the loader's life.
  useEffect(() => {
    if (imageRef.current?.complete) setLoaded(true);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ backgroundColor: loaderBaseColor }}>
      {loaderBackground ? (
        <div
          className={cx('absolute inset-0', LOADER_RISE, shown ? 'opacity-100' : 'opacity-0')}
          style={{
            ...staged(LOADER_STAGE.backdrop, reduced),
            backgroundImage: `url("${loaderBackground.blurDataURL}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <picture>
            {loaderBackground.avifSrcSet ? (
              <source type="image/avif" srcSet={loaderBackground.avifSrcSet} sizes="100vw" />
            ) : null}
            <source type="image/webp" srcSet={loaderBackground.srcSet} sizes="100vw" />
            <img
              ref={imageRef}
              src={loaderBackground.src}
              alt={loadingScreen.backgroundAlt}
              width={loaderBackground.width}
              height={loaderBackground.height}
              sizes="100vw"
              fetchPriority="high"
              decoding="async"
              onLoad={() => setLoaded(true)}
              className={cx(
                'h-full w-full object-cover object-center transition-opacity duration-700 ease-[var(--ease-out-expo)]',
                loaded ? 'opacity-100' : 'opacity-0'
              )}
            />
          </picture>
        </div>
      ) : null}

      {/* Readability scrims: carefully weighted so the bride, groom, candles,
          flowers and warm golden bokeh remain vivid and clear while the central
          typography, progress bar, and 4-column stats stay crisp. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,8,10,0.50)_0%,rgba(8,8,10,0.32)_18%,rgba(8,8,10,0.46)_48%,rgba(8,8,10,0.62)_72%,rgba(8,8,10,0.82)_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(8,8,10,0.18)_0%,rgba(8,8,10,0.45)_65%,rgba(8,8,10,0.85)_100%)]"
      />
    </div>
  );
}
