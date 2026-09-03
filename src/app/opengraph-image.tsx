import { readFileSync } from 'node:fs';
import path from 'node:path';
import { ImageResponse } from 'next/og';
import { leadProject } from '@/lib/data/projects';
import { getPhoto } from '@/lib/photos';
import { siteConfig } from '@/lib/site.config';

export const alt = `${siteConfig.brandName} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * The card is composed from a photograph on disk, so it is the same image on
 * every request. Saying so lets `npm run export` render it to a PNG at build
 * time — a static host has no runtime to generate it on demand.
 */
export const dynamic = 'force-static';

/**
 * The share card, composed at build time from a real photograph.
 *
 * The frame is read off disk and inlined, so the card needs no network and stays
 * correct if the site has not been deployed yet. If the photo pipeline has not
 * run, the card degrades to type on ink rather than failing the build.
 */
function coverDataUrl(): string | null {
  try {
    const photo = getPhoto(leadProject?.coverId ?? '');
    const file = path.join(process.cwd(), 'public', photo.src);
    return `data:image/jpeg;base64,${readFileSync(file).toString('base64')}`;
  } catch {
    return null;
  }
}

export default function OpengraphImage() {
  const cover = coverDataUrl();

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          backgroundColor: '#08080a',
          color: '#ede9e4',
          position: 'relative',
        }}
      >
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt=""
            width={1200}
            height={630}
            style={{ position: 'absolute', inset: 0, objectFit: 'cover', opacity: 0.55 }}
          />
        ) : null}

        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to top, rgba(8,8,10,0.96) 12%, rgba(8,8,10,0.45) 62%, rgba(8,8,10,0.7) 100%)',
          }}
        />

        <div style={{ position: 'relative', padding: '0 72px 68px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 22, letterSpacing: 8, textTransform: 'uppercase', color: '#a87e92' }}>
            {siteConfig.heroKicker}
          </div>
          <div
            style={{
              marginTop: 20,
              fontSize: 96,
              lineHeight: 1,
              letterSpacing: -1,
              textTransform: 'uppercase',
            }}
          >
            {siteConfig.brandName}
          </div>
          <div style={{ marginTop: 22, fontSize: 30, color: '#b4afab' }}>{siteConfig.tagline}</div>
        </div>
      </div>
    ),
    size
  );
}
