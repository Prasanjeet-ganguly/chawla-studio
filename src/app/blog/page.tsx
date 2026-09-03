import type { Metadata } from 'next';
import { Button } from '@/components/ui/Button';
import { Placeholder } from '@/components/ui/Placeholder';

export const metadata: Metadata = {
  title: 'Journal',
  description: 'Notes from behind the camera. The journal opens shortly.',
  alternates: { canonical: '/blog' },
  // Nothing to index until the studio has written something.
  robots: { index: false, follow: true },
};

/**
 * The journal.
 *
 * The masthead links here, so the route exists rather than pointing at nothing —
 * but the studio has not written a word yet, and inventing posts would be
 * inventing a history. So the page says plainly that it is coming, and sends the
 * reader to the work in the meantime.
 */
export default function BlogPage() {
  return (
    <section className="shell py-32 md:py-44">
      <p className="eyebrow text-gold">Journal</p>
      <h1 className="mt-6 max-w-2xl font-display uppercase text-display-l">
        Notes from
        <br />
        behind the camera.
      </h1>

      <div className="mt-12 max-w-xl">
        <Placeholder source="src/app/blog/page.tsx">
          <p>
            The journal has not opened yet. When the studio starts writing — a wedding
            told frame by frame, how a shoot is planned, what a light was doing at six in
            the evening — the posts will be listed here.
          </p>
        </Placeholder>
      </div>

      <div className="mt-11 flex flex-wrap items-center gap-4">
        <Button href="/#work" variant="solid" withArrow>
          See the work
        </Button>
        <Button href="/#contact" variant="outline">
          Start an enquiry
        </Button>
      </div>
    </section>
  );
}
