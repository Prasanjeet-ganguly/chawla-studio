/**
 * The loading screen's own drawn marks.
 *
 * The hero's line icons are 24px interface glyphs (see hero/HeroIcons.tsx); this
 * camera is a 96px ornament and needs detail they would not survive — a heart
 * held inside the aperture, six blades around it, the strap lugs, the shutter
 * pip. Same hairline weight and same `currentColor`, so it belongs to the same
 * hand.
 */

/** The camera at the head of the composition, heart inside the lens. */
export function LoaderCameraMark() {
  return (
    <svg
      viewBox="0 0 96 96"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.15}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className="h-full w-full"
    >
      {/* Body, with the pentaprism hump and the two strap lugs. */}
      <path d="M33.5 26.5l3.6-6.4h21.8l3.6 6.4" />
      <path d="M10.5 26.5h75v43a5 5 0 0 1-5 5h-65a5 5 0 0 1-5-5z" />
      <path d="M10.5 34.5h-3.6M85.5 34.5h3.6" />

      {/* Lens: the outer barrel, the aperture ring, and six blades stopped down
          around it. Drawn rather than approximated with a dashed circle so the
          blades meet the ring at the angles a real diaphragm does. */}
      <circle cx="48" cy="49" r="18.5" />
      <circle cx="48" cy="49" r="13" />
      <path d="M48 36v4.4M59.3 42.5l-3.8 2.2M59.3 55.5l-3.8-2.2M48 62v-4.4M36.7 55.5l3.8-2.2M36.7 42.5l3.8 2.2" />

      {/* The heart at the centre — the one filled shape, because a hairline heart
          at 18px reads as a smudge. */}
      <path
        d="M48 56.6l-5.4-5.2a3.9 3.9 0 0 1 0-5.6 3.7 3.7 0 0 1 5.4 0 3.7 3.7 0 0 1 5.4 0 3.9 3.9 0 0 1 0 5.6z"
        fill="currentColor"
        stroke="none"
      />

      {/* Shutter pip and the film-advance detail on the shoulder. */}
      <circle cx="74.5" cy="35.5" r="1.6" />
      <path d="M20.5 34.5h9" />
    </svg>
  );
}

/**
 * The corner brackets that frame the mark, as a viewfinder's focus box does.
 *
 * One element rather than four, so the box cannot fall out of square at a
 * breakpoint.
 */
export function LoaderFocusFrame() {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
      className="h-full w-full"
    >
      <path d="M1 22V4a3 3 0 0 1 3-3h18" />
      <path d="M78 1h18a3 3 0 0 1 3 3v18" />
      <path d="M99 78v18a3 3 0 0 1-3 3H78" />
      <path d="M22 99H4a3 3 0 0 1-3-3V78" />
    </svg>
  );
}

/**
 * A delicate, rotating hairline aperture guide ring behind the camera mark.
 *
 * Pure SVG/CSS animation: 0kb extra bundle weight, zero WebGL overhead,
 * compositor-accelerated for smooth 60fps rotation.
 */
export function LoaderApertureRing() {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth={0.75}
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
      className="h-full w-full"
    >
      <circle cx="50" cy="50" r="47" strokeDasharray="3 7" strokeOpacity={0.65} />
      <circle cx="50" cy="50" r="39" strokeOpacity={0.25} />
      <line x1="50" y1="2" x2="50" y2="8" strokeOpacity={0.9} />
      <line x1="50" y1="92" x2="50" y2="98" strokeOpacity={0.9} />
      <line x1="2" y1="50" x2="8" y2="50" strokeOpacity={0.9} />
      <line x1="92" y1="50" x2="98" y2="50" strokeOpacity={0.9} />
      <line x1="16" y1="16" x2="20.5" y2="20.5" strokeOpacity={0.8} />
      <line x1="79.5" y1="79.5" x2="84" y2="84" strokeOpacity={0.8} />
      <line x1="84" y1="16" x2="79.5" y2="20.5" strokeOpacity={0.8} />
      <line x1="20.5" y1="79.5" x2="16" y2="84" strokeOpacity={0.8} />
    </svg>
  );
}
