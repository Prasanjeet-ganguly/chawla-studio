'use client';

import { Photo } from '@/components/ui/Photo';
import { describe } from '@/lib/data/captions';

type HeroBackdropProps = {
  /** Photograph id from the studio's library. Configured in site.config.ts. */
  photoId: string;
  /** The layer the parallax loop moves. Carries the zoom, so it can be shifted. */
  layer: React.RefObject<HTMLDivElement | null>;
};

/**
 * The photograph the hero is built on.
 *
 * Full bleed from `lg` up, and a deliberate band across the top below it, where
 * a picture behind six lines of type is a picture nobody can see. A portrait
 * tablet takes the band too: fitting the type beside the couple needs a frame
 * that is wider than it is tall, and 768×1024 is not that. The frame is zoomed a
 * little past `cover` and anchored off-centre, which does two things at once: it
 * weights the couple to the right of the composition, and it leaves the parallax
 * layer room to move without ever exposing an edge.
 *
 * Everything over it is a scrim. The diagonal takes the left side almost to
 * black so the headline has somewhere to live, the bottom gradient joins the
 * hero to the ink below it without a seam, and the vignette closes the corners.
 * All three are `aria-hidden`; the photograph itself keeps its description.
 */
export function HeroBackdrop({ photoId, layer }: HeroBackdropProps) {
  return (
    <div className="absolute inset-x-0 top-0 -z-10 h-[56svh] overflow-hidden md:h-[46svh] lg:h-full">
      <div
        ref={layer}
        // The zoom and the crop's anchor are breakpoint business, so they live
        // in custom properties: the animation frame only writes the offset, and
        // reads the zoom back out of the cascade.
        //
        // Three regimes, because `cover` crops along whichever axis is short:
        // the phone and tablet bands are wider than the source, so they crop
        // vertically and the focus' X term is inert there; the full-height
        // laptop frame can go either way, so X is set for the narrowest laptop
        // box (a 4:3 landscape tablet) and simply has no effect on wide ones.
        className="absolute inset-0 origin-[30%_30%] [--hero-focus:50%_30%] [--hero-zoom:1.12] will-change-transform md:origin-[40%_30%] md:[--hero-focus:50%_26%] md:[--hero-zoom:1.06] lg:origin-[9%_12%] lg:[--hero-focus:20%_26%] lg:[--hero-zoom:1.36]"
        style={{ transform: 'translate3d(0, 0, 0) scale(var(--hero-zoom))' }}
      >
        <Photo
          id={photoId}
          alt={describe(photoId)}
          aspect="fill"
          objectPosition="var(--hero-focus)"
          sizes="(min-width: 1024px) 136vw, (min-width: 768px) 106vw, 112vw"
          priority
        />
      </div>

      {/* Phone and portrait tablet: the photograph reads top-down and dissolves
          into ink, so the type below it sits on ink rather than on a picture.
          The top stop is light because the scrim further down adds the rest of
          the masthead's cover — together they must not veil the couple. The ramp
          reaches full ink at 88% rather than at the band's edge: a bokeh
          highlight under 90% ink is still brighter than ink, so a gradient that
          only arrives at the last pixel leaves a visible horizontal cut. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,8,10,0.34)_0%,rgba(8,8,10,0.16)_24%,rgba(8,8,10,0.44)_50%,rgba(8,8,10,0.78)_72%,var(--color-ink)_88%)] lg:hidden"
      />

      {/* Laptop and up: the cinematic left-dark wash of the reference. The stops
          are placed against the photograph rather than spread evenly — the field
          the type is set on stays near-black, and the wash has finished fading by
          the time it reaches the couple, so neither face is veiled.

          Two of them, because the type block does not scale with the viewport
          the way the photograph does: the pill, the play circle and the
          twelve-pixel label are fixed sizes, so the row of actions reaches about
          half way across a 1024 frame and only a third of the way across a wide
          one. The narrow laptops therefore get a dark field that holds on some
          fifty pixels longer. They are separate elements rather than two
          `background-image` utilities on one, because utilities that set the same
          property resolve by stylesheet order, not by the order written here. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 hidden bg-[linear-gradient(96deg,rgba(8,8,10,0.96)_0%,rgba(8,8,10,0.92)_18%,rgba(8,8,10,0.74)_34%,rgba(8,8,10,0.36)_50%,rgba(8,8,10,0.1)_64%,rgba(8,8,10,0)_78%)] lg:block xl:hidden"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 hidden bg-[linear-gradient(96deg,rgba(8,8,10,0.96)_0%,rgba(8,8,10,0.9)_17%,rgba(8,8,10,0.64)_31%,rgba(8,8,10,0.26)_45%,rgba(8,8,10,0.05)_60%,rgba(8,8,10,0)_74%)] xl:block"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 hidden bg-[linear-gradient(to_top,var(--color-ink)_0%,rgba(8,8,10,0.62)_16%,rgba(8,8,10,0)_44%)] lg:block"
      />
      {/* The frame's own ceiling is lit — chandeliers and a bright hall — which
          would sit directly behind the masthead at every width. A short scrim off
          the top edge holds the wordmark and nav legible and keeps the brightest
          thing in the picture from being the room rather than the couple. Its
          stops are absolute, not percentages: the masthead is the same height on
          a phone as on a laptop, but the band underneath it is not. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(8,8,10,0.72)_0,rgba(8,8,10,0.4)_3rem,rgba(8,8,10,0.16)_7rem,rgba(8,8,10,0)_12rem)]"
      />
      {/* The corners, closed down. The reference's frame is dark everywhere the
          marginalia sits; this photograph is not — the groom's cream sherwani and
          the lit hall run straight through the lower right, which is exactly
          where the crest and the closing line are set. The vignette is therefore
          weighted to reach about a third of a stop of ink there while leaving the
          faces, which sit inside its clear centre, untouched. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 hidden bg-[radial-gradient(120%_95%_at_58%_34%,rgba(8,8,10,0)_16%,rgba(8,8,10,0.45)_62%,rgba(8,8,10,0.88)_100%)] lg:block"
      />
    </div>
  );
}
