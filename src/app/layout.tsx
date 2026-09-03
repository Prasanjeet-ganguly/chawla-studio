import type { Metadata, Viewport } from 'next';
import { Allura, Archivo, IBM_Plex_Mono, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Footer } from '@/components/footer/Footer';
import { Header } from '@/components/navigation/Header';
import { CinematicLoader } from '@/components/loader/CinematicLoader';
import { Grain } from '@/components/ui/Grain';
import { SkipLink } from '@/components/ui/SkipLink';
import { SmoothScroll } from '@/components/motion/SmoothScroll';
import { siteConfig } from '@/lib/site.config';

/*
  Four faces, loaded as variables and nothing more: an editorial serif for
  display, a grotesque for reading, a technical mono for capture data, and one
  calligraphic script reserved for the hero's accent line and the closing brand
  statement. Only the weights and styles the site actually sets are requested —
  an unused italic is still a preloaded font file the visitor pays for.
*/
const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
  weight: ['400'],
});

const allura = Allura({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-allura',
  weight: ['400'],
});

const archivo = Archivo({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-archivo',
  weight: ['400'],
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plex-mono',
  weight: ['400'],
});

const title = `${siteConfig.brandName} — ${siteConfig.tagline}`;

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: title,
    template: `%s — ${siteConfig.brandName}`,
  },
  description: siteConfig.shortDescription,
  applicationName: siteConfig.brandName,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: siteConfig.brandName,
    title,
    description: siteConfig.shortDescription,
    url: siteConfig.url,
    // The card itself comes from app/opengraph-image.tsx, which Next wires in
    // with the right dimensions and alt text — repeating it here would only give
    // it a chance to drift.
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description: siteConfig.shortDescription,
  },
  robots: { index: true, follow: true },
  category: 'photography',
};

export const viewport: Viewport = {
  themeColor: '#08080a',
  colorScheme: 'dark',
};

/**
 * Structured data for the studio.
 *
 * Only fields the studio has actually supplied are emitted — no invented
 * address, rating, founding date or price range. An unconfigured deployment
 * publishes just a name, a URL and a description, which is true.
 */
function organisationJsonLd() {
  const { contact, social } = siteConfig;
  const sameAs = [social.instagram, social.youtube].filter((url): url is string => url !== null);

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.brandName,
    url: siteConfig.url,
    description: siteConfig.shortDescription,
    ...(contact.email ? { email: contact.email } : {}),
    ...(contact.phone ? { telephone: contact.phone } : {}),
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${allura.variable} ${archivo.variable} ${plexMono.variable}`}
    >
      <body>
        <SkipLink />
        <SmoothScroll />
        <Grain />
        {/* Above everything, and first in the body: its background photograph is
            marked critical, so having it early in the document is what lets the
            browser start that request before the page's own. */}
        <CinematicLoader />
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <script
          type="application/ld+json"
          // Serialised from the config above; no user input reaches this.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organisationJsonLd()) }}
        />
      </body>
    </html>
  );
}
