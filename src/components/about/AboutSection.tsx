import { Photo } from '@/components/ui/Photo';
import { Placeholder } from '@/components/ui/Placeholder';
import { Reveal } from '@/components/ui/Reveal';
import { describe } from '@/lib/data/captions';

const PORTRAIT = '0f5a6366';
const OVERLAP = '0f5a9856';

/**
 * Who the studio is — as far as the studio has told us.
 *
 * The approach below is safe to state: it describes how the pictures on this page
 * were made. Everything that would require a biography, a founding year, a city
 * or a client list is a labelled placeholder, because inventing any of it would
 * put a lie on the page.
 */
export function AboutSection() {
  return (
    <section id="about" aria-labelledby="about-title" className="rebate-grid py-24 md:py-36">
      <p className="rebate-mark self-start pt-2">About the studio</p>

      <div className="shell grid gap-14 md:grid-cols-[1.15fr_1fr] md:gap-16">
        <div>
          <Reveal>
            <p className="eyebrow">About</p>
            <h2 id="about-title" className="mt-5 max-w-xl font-display uppercase text-display-m">
              We capture what you&rsquo;ll want to remember.
            </h2>
          </Reveal>

          <Reveal delay={0.08} className="mt-10 flex max-w-xl flex-col gap-6">
            <p className="text-paper-dim">
              We work quietly and in the light that is already in the room. A
              celebration does not need to be directed to be photographed well; it
              needs someone watching closely enough to see the half-second that
              matters, and composing carefully enough that the picture still holds
              up years after the day has gone soft in everyone&rsquo;s memory.
            </p>
            <p className="text-paper-dim">
              Every frame on this site comes from real work — a ring ceremony, a
              mandap, a first birthday, a bride waiting to be called in. Nothing
              here is stock.
            </p>
          </Reveal>

          <Reveal delay={0.14} className="mt-10 flex flex-col gap-5">
            <Placeholder source="src/components/about/AboutSection.tsx">
              [Studio story goes here] — how Chawla Studio started, who is behind
              the camera, and what the studio cares about.
            </Placeholder>
            <Placeholder source="src/components/about/AboutSection.tsx">
              [Studio approach goes here] — how you work with a couple or a family
              from the first conversation to the delivered album.
            </Placeholder>
          </Reveal>
        </div>

        {/* Two frames, overlapped the way prints get laid out on a table. */}
        <Reveal variant="clip" delay={0.1} className="relative self-start">
          <Photo
            id={PORTRAIT}
            alt={describe(PORTRAIT)}
            sizes="(min-width: 768px) 40vw, 92vw"
            aspect={4 / 5}
          />
          {/* The second print breaks the column edge on purpose, but only ever
              into the page gutter — a fixed overhang is wider than the gutter at
              exactly 768px and puts a stray pixel of scroll on the document. */}
          <div className="relative -mt-16 ml-auto w-2/3 border border-hairline sm:-mt-24 md:-mr-[calc(var(--spacing-gutter)*0.5)]">
            <Photo
              id={OVERLAP}
              alt={describe(OVERLAP)}
              sizes="(min-width: 768px) 27vw, 61vw"
              aspect={3 / 2}
            />
          </div>
          <p className="mt-6 eyebrow">Selects from real work</p>
        </Reveal>
      </div>
    </section>
  );
}
