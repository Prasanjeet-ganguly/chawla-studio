'use client';

import { Photo } from '@/components/ui/Photo';
import { describe } from '@/lib/data/captions';

/**
 * What the hero looks like without WebGL — and while WebGL is still being
 * probed, and whenever motion has been waved off.
 *
 * Not a placeholder: it is a real frame from the library, printed dark and
 * vignetted so the wordmark over it stays legible. A visitor with WebGL blocked
 * gets a photograph rather than an apology.
 */
export function HeroStill({ id = '0f5a6491' }: { id?: string }) {
  return (
    <div className="absolute inset-0">
      <Photo
        id={id}
        alt={describe(id)}
        sizes="100vw"
        aspect="native"
        priority
        // Both axes are pinned, so the frame's own ratio yields to the viewport.
        className="h-full w-full"
      />
      {/* Printed down with a scrim rather than by dimming the image itself:
          Photo owns the img's opacity for its load fade, and two rules fighting
          over one property is how a wordmark quietly loses its contrast. The
          hero adds its own gradient over this, weighted to the type side. */}
      <div aria-hidden="true" className="absolute inset-0 bg-ink/45" />
    </div>
  );
}
