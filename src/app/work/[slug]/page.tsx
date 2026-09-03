import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProjectSequence } from '@/components/gallery/ProjectSequence';
import { WhatsAppButton } from '@/components/contact/WhatsAppButton';
import { Button } from '@/components/ui/Button';
import { Photo } from '@/components/ui/Photo';
import { Reveal } from '@/components/ui/Reveal';
import { describe } from '@/lib/data/captions';
import { getProject, projectNeighbours, projectSlugs } from '@/lib/data/projects';
import { getPhoto } from '@/lib/photos';
import { siteConfig } from '@/lib/site.config';
import { cx, toEmbedUrl } from '@/lib/utils';

type Params = { params: Promise<{ slug: string }> };

/** Every series is known at build time, so all pages are static. */
export function generateStaticParams() {
  return projectSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return { title: 'Series not found' };

  const cover = getPhoto(project.coverId);
  const url = `${siteConfig.url}/work/${project.slug}`;
  const image = { url: new URL(cover.src, siteConfig.url).toString(), alt: describe(project.coverId) };

  return {
    title: project.title,
    description: project.description,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: {
      type: 'article',
      title: `${project.title} — ${project.categoryName}`,
      description: project.description,
      url,
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${project.title} — ${siteConfig.brandName}`,
      description: project.description,
      images: [image.url],
    },
  };
}

/**
 * One series or film, presented as an editorial feature.
 *
 * For photography, the sequence follows in the order the studio curated.
 * For video, the film player takes center stage with honest placeholders
 * and accompanying still frames when available.
 */
export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const isVideo = project.type === 'video';
  const neighbours = projectNeighbours(project.slug);
  const sequence = (project.photoIds ?? []).filter((id) => id !== project.coverId);
  const dateline = project.month ?? (project.year === null ? null : String(project.year));

  const embedUrl = isVideo ? toEmbedUrl(project.videoUrl) : null;
  const isVertical = isVideo && project.aspectRatio === 9 / 16;

  return (
    <>
      <article>
        <div className="relative">
          <Photo
            id={project.coverId}
            alt={describe(project.coverId)}
            sizes="100vw"
            priority
            className="w-full"
          />
          {/* Keeps the fixed header legible over a bright opening frame. */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink/80 to-transparent"
          />
        </div>

        <header className="shell mt-12 md:mt-16">
          {/* Minimum 44px hit target for back link */}
          <Link
            href="/#work"
            className="eyebrow link-underline -my-4 inline-flex min-h-11 items-center"
          >
            &#8592; All work
          </Link>

          <Reveal className="mt-8">
            <p className="eyebrow">
              {project.categoryName}
              {dateline ? ` · ${dateline}` : ''}
              {isVideo && project.duration ? ` · ${project.duration}` : ''}
            </p>
            <h1 className="mt-6 max-w-4xl font-display uppercase text-display-l">
              {project.title}
            </h1>
          </Reveal>

          <Reveal delay={0.08} className="mt-10 flex flex-col gap-6 md:flex-row md:justify-between">
            <p className="max-w-xl text-paper-dim">{project.description}</p>
            <p className="eyebrow shrink-0 md:pt-2">
              {isVideo ? `${project.categoryName} film` : `${project.frameCount} frames`}
            </p>
          </Reveal>
        </header>

        {/* Video Player Section if video type */}
        {isVideo ? (
          <div className="shell mt-16 md:mt-24">
            <div
              className={cx(
                'mx-auto w-full',
                isVertical ? 'max-w-md' : 'max-w-5xl'
              )}
            >
              {embedUrl ? (
                <div
                  className="relative w-full overflow-hidden rounded-md border border-gold-line/40 bg-ink shadow-[0_8px_32px_rgba(0,0,0,0.8)]"
                  style={{
                    aspectRatio: isVertical ? '9 / 16' : '16 / 9',
                  }}
                >
                  <iframe
                    src={embedUrl}
                    title={project.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                    className="absolute inset-0 h-full w-full border-0"
                  />
                </div>
              ) : (
                <div
                  className="relative flex w-full flex-col items-center justify-center gap-6 rounded-md border border-gold-line/40 bg-[rgba(8,8,10,0.85)] p-8 text-center shadow-[0_8px_32px_rgba(0,0,0,0.8)] backdrop-blur-md sm:p-16"
                  style={{
                    aspectRatio: isVertical ? '9 / 16' : '16 / 9',
                  }}
                >
                  <span className="flex h-16 w-16 items-center justify-center rounded-full border border-gold-line/60 bg-gold/10 text-gold-bright shadow-[0_0_20px_rgba(201,163,106,0.2)]">
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 28 28"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M11 9.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"
                        fill="currentColor"
                      />
                      <path
                        d="M4 7h2l2.5-2.5h11l2.5 2.5H24a2 2 0 012 2v13a2 2 0 01-2 2H4a2 2 0 01-2-2V9a2 2 0 012-2z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                      />
                      <path d="M18 17l6-4-6-4v8z" fill="currentColor" />
                    </svg>
                  </span>

                  <div>
                    <p className="eyebrow text-gold">Film in production</p>
                    <h3 className="mt-3 font-display text-display-s text-ivory">
                      {project.title}
                    </h3>
                    <p className="mt-2 max-w-sm text-sm text-paper-dim">
                      {project.description}
                    </p>
                  </div>

                  <p className="font-mono text-[0.56rem] tracking-widest text-paper-dim/60 uppercase">
                    {project.categoryName}
                    {project.duration ? ` · ${project.duration}` : ''}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* Gallery Sequence */}
        {sequence.length > 0 ? (
          <div className="shell mt-16 md:mt-24">
            {isVideo ? (
              <div className="mb-12 border-t border-hairline pt-12">
                <p className="eyebrow">Still captures</p>
                <h2 className="mt-3 font-display uppercase text-display-s">
                  Frames from the story
                </h2>
              </div>
            ) : null}
            <ProjectSequence ids={sequence} title={project.title} />
          </div>
        ) : null}

        <div className="shell mt-24 flex flex-col items-start gap-8 md:mt-32 md:flex-row md:items-center md:justify-between">
          <p className="max-w-lg font-display text-display-s">
            Every day is photographed once. We&rsquo;d like to be there for yours.
          </p>
          <Button href="/#contact" variant="solid" withArrow>
            Get in touch
          </Button>
        </div>
      </article>

      {neighbours ? (
        <nav aria-label="More series" className="shell mt-24 border-t border-hairline pt-10 pb-24 md:mt-32 md:pb-36">
          <ul className="grid list-none grid-cols-1 gap-10 p-0 md:grid-cols-2">
            {[
              { label: 'Previous', project: neighbours.prev },
              { label: 'Next', project: neighbours.next },
            ].map(({ label, project: sibling }) => {
              const isNext = label === 'Next';
              return (
                <li key={label} className={isNext ? 'md:text-right' : undefined}>
                  <Link
                    href={`/work/${sibling.slug}`}
                    className={cx('group flex items-center gap-5', isNext && 'md:flex-row-reverse')}
                  >
                    <Photo
                      id={sibling.coverId}
                      alt={describe(sibling.coverId)}
                      sizes="8rem"
                      aspect={3 / 2}
                      className="w-32 shrink-0"
                      zoom
                    />
                    <span>
                      <span className="eyebrow block">{label}</span>
                      <span className="link-underline mt-2 inline-block font-display text-display-s">
                        {sibling.title}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}

      <WhatsAppButton />
    </>
  );
}
