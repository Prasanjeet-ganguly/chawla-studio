import type { MetadataRoute } from 'next';
import { projects } from '@/lib/data/projects';
import { siteConfig } from '@/lib/site.config';

/**
 * Built once, at build time — the curation is compiled in, so there is nothing to
 * recompute per request. Declaring it also lets `npm run export` write a real
 * sitemap.xml for hosts that only serve files.
 */
export const dynamic = 'force-static';

/**
 * The home page and one entry per series. Built from the same curation the
 * pages are, so a new series is listed the moment it is published.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: siteConfig.url,
      lastModified,
      changeFrequency: 'monthly',
      priority: 1,
    },
    ...projects.map((project) => ({
      url: `${siteConfig.url}/work/${project.slug}`,
      lastModified,
      changeFrequency: 'yearly' as const,
      priority: 0.8,
    })),
  ];
}
