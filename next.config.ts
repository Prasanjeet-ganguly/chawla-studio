import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Hide the development indicator badge ("N" icon) on screen
  devIndicators: false,

  // Static export for Cloudflare Pages, shared hosting, and CDNs
  output: 'export',
  trailingSlash: true,

  // Photographs are pre-optimised at build time by scripts/optimize-photos.mjs
  // into responsive AVIF/WebP variants under /public/photos, so the runtime
  // image optimiser is not needed. See src/components/ui/Photo.tsx.
  images: {
    unoptimized: true,
  },

  // three.js ships untranspiled ESM examples; Next handles this for us but the
  // explicit list keeps tree-shaking predictable across the r3f/drei stack.
  transpilePackages: ['three'],
};

export default nextConfig;
