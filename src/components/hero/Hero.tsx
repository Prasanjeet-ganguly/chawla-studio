'use client';

import { useCallback, useEffect, useState } from 'react';
import { BrandStatement } from './BrandStatement';
import { HeroActions } from './HeroActions';
import { HeroBackdrop } from './HeroBackdrop';
import { HeroContent } from './HeroContent';
import { HeroStats } from './HeroStats';
import { ShowreelModal } from './ShowreelModal';
import { WeddingBadge } from './WeddingBadge';
import { useHeroParallax } from '@/lib/hooks/useHeroParallax';
import { isIntroFinished, onIntroFinish } from '@/lib/loading-state';
import { loadingScreen, siteConfig } from '@/lib/site.config';

/**
 * The opening frame: one photograph, a left-hand column of type, and three
 * pieces of marginalia along the bottom.
 *
 * Everything over the photograph is plain DOM — selectable, searchable,
 * translatable — and the only motion at rest is a few pixels of parallax on a
 * fine pointer. Below `lg` the composition is rearranged rather than scaled: the
 * photograph becomes a band across the top and the type stacks beneath it, which
 * is the one layout where a picture behind six lines of text is still a picture.
 */
export function Hero() {
  const [shown, setShown] = useState(false);
  const [showreel, setShowreel] = useState(false);
  const { section, backdrop, content } = useHeroParallax();

  const openShowreel = useCallback(() => setShowreel(true), []);
  const closeShowreel = useCallback(() => setShowreel(false), []);

  // The entrance belongs to the loading screen: the hero begins to rise as the
  // curtain starts to lift, so the two movements overlap instead of queueing.
  // Coming back from another route the intro is long over, and the hero animates
  // on mount as it did before there was a loader.
  useEffect(() => {
    if (isIntroFinished()) {
      const id = window.setTimeout(() => setShown(true), 60);
      return () => window.clearTimeout(id);
    }

    const stopListening = onIntroFinish(() => setShown(true));

    // If the curtain never reports back — a render it did not survive, a browser
    // that never fires the timer — the hero still arrives, just after the point
    // the loader's own hard release would have come and gone.
    const safety = window.setTimeout(
      () => setShown(true),
      loadingScreen.timing.maxVisible + 400
    );

    return () => {
      stopListening();
      window.clearTimeout(safety);
    };
  }, []);

  return (
    <section
      ref={section}
      id="hero"
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden"
    >
      <HeroBackdrop photoId={siteConfig.hero.photoId} layer={backdrop} />

      {/* The type sits below the photograph's band on a phone and on a portrait
          tablet, and beside the couple from `lg` up. The top padding clears the
          band — a little less than its height, so the first line begins where
          the picture has already dissolved into ink. Above `lg` it clears the
          masthead instead. */}
      <div
        ref={content}
        className="shell relative flex flex-1 flex-col justify-end pt-[46svh] will-change-transform md:pt-[38svh] lg:justify-center lg:pt-24"
      >
        <HeroContent shown={shown} />
        <HeroActions shown={shown} onShowreel={openShowreel} />
      </div>

      {/*
        The marginalia band, as one grid rather than nested flex rows, because it
        has three arrangements and they are placements rather than orders: the
        figures, the crest and the closing line stack on a phone; on a portrait
        tablet the crest moves up beside the figures and the closing line takes
        the full measure under them (it needs 377px of its own, and the tablet
        cannot spare that beside a 421px panel); from `lg` the crest and the line
        share the right-hand column with the figures held against them.
      */}
      <div className="shell relative mt-12 grid grid-cols-1 items-end gap-x-10 gap-y-8 pb-10 md:mt-10 md:grid-cols-[1fr_auto] md:pb-9">
        <div className="lg:row-span-2 lg:self-end">
          <HeroStats shown={shown} />
        </div>
        <div className="justify-self-end">
          <WeddingBadge shown={shown} />
        </div>
        <div className="justify-self-end md:col-span-2 lg:col-span-1 lg:col-start-2 lg:row-start-2">
          <BrandStatement shown={shown} />
        </div>
      </div>

      {showreel ? <ShowreelModal onClose={closeShowreel} /> : null}
    </section>
  );
}
