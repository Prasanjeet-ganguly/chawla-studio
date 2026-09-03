import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site.config';

/**
 * Written once at build time. Nothing here varies per request, and saying so
 * explicitly is what lets `npm run export` emit a real robots.txt file for hosts
 * that serve files rather than run Node.
 */
export const dynamic = 'force-static';

/**
 * Everything on this site is meant to be found. The only rule worth writing is
 * where the sitemap lives.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
