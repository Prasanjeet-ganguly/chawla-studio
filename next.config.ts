import type { NextConfig } from 'next';

/**
 * Set by `npm run export` (scripts/export-static.mjs) to build a folder of
 * plain files instead of a Node server, for shared hosting that only speaks
 * Apache/PHP — InfinityFree, Hostinger's free tier, cPanel, GitHub Pages.
 *
 * It is a flag rather than the default because the two builds are not
 * equivalent: an export cannot serve HTTP headers, so the caching policy below
 * moves into deploy/htaccess.conf and is Apache's job instead. Everything the
 * site actually does — no middleware, no route handlers, no server actions — is
 * static either way.
 */
const staticExport = process.env.STATIC_EXPORT === '1';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Photographs are pre-optimised at build time by scripts/optimize-photos.mjs
  // into responsive AVIF/WebP variants under /public/photos, so the runtime
  // image optimiser is not needed. See src/components/ui/Photo.tsx.
  images: {
    unoptimized: true,
  },

  // three.js ships untranspiled ESM examples; Next handles this for us but the
  // explicit list keeps tree-shaking predictable across the r3f/drei stack.
  transpilePackages: ['three'],

  ...(staticExport
    ? ({
        output: 'export',
        // Emits `blog/index.html` rather than `blog.html`, so Apache resolves
        // /blog and /blog/ from the directory itself. Without it every clean
        // URL would need a rewrite rule to find its file.
        trailingSlash: true,
        // `headers` is deliberately absent here rather than empty: an export
        // sends none, and declaring the key at all makes Next warn that the
        // rules will be ignored. deploy/htaccess.conf states the same policy in
        // Apache's own terms.
      } as const)
    : {
        async headers() {
          return [
            {
              // Variant filenames are stable across rebuilds (id + width, no
              // content hash), so these cannot be `immutable`: replacing a
              // photograph in /Photos must reach visitors who already have the
              // old one. A week of hard caching with a month of background
              // revalidation keeps repeat visits instant without pinning a
              // stale frame for a year.
              source: '/photos/:path*',
              headers: [
                {
                  key: 'Cache-Control',
                  value: 'public, max-age=604800, stale-while-revalidate=2592000',
                },
              ],
            },
          ];
        },
      }),
};

export default nextConfig;
