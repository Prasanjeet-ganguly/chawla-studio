import { Button } from '@/components/ui/Button';
import { Photo } from '@/components/ui/Photo';
import { describe } from '@/lib/data/captions';
import { leadProject } from '@/lib/data/projects';

const FRAME = '0f5a6494';

/**
 * The 404.
 *
 * Kept in the same voice as the rest of the site, with real routes out of it —
 * the work, the enquiry form, and whichever series is currently featured.
 */
export default function NotFound() {
  return (
    <section className="rebate-grid py-32 md:py-44">
      <p className="rebate-mark self-start pt-2">404</p>

      <div className="shell grid gap-14 md:grid-cols-[1.1fr_1fr] md:items-center md:gap-20">
        <div>
          <p className="eyebrow">404</p>
          <h1 className="mt-6 font-display uppercase text-display-l">
            This frame
            <br />
            is missing.
          </h1>
          <p className="mt-8 max-w-md text-paper-dim">
            The page you asked for is not here. The work is, though.
          </p>

          <div className="mt-11 flex flex-wrap items-center gap-4">
            <Button href="/#work" variant="solid" withArrow>
              See the work
            </Button>
            {leadProject ? (
              <Button href={`/work/${leadProject.slug}`} variant="outline">
                {leadProject.title}
              </Button>
            ) : null}
          </div>
        </div>

        <Photo
          id={FRAME}
          alt={describe(FRAME)}
          sizes="(min-width: 768px) 45vw, 92vw"
          aspect={4 / 5}
        />
      </div>
    </section>
  );
}
