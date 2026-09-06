/**
 * Guard that runs before `dev`, `build`, and `export`.
 *
 * Both image pipelines write generated TypeScript and optimized responsive
 * variants into /public (which is gitignored). On a fresh clone or CI build
 * (such as Cloudflare Pages, Vercel, or Docker), neither the manifests nor the
 * variant directories exist yet.
 *
 * This guard ensures both the TypeScript manifests and the responsive image
 * variants are physically generated before Next.js builds or serves the app.
 */
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = path.resolve(import.meta.dirname, '..');

/**
 * Returns true if directory exists and has at least one entry.
 */
const hasContent = (dir) => {
  if (!existsSync(dir)) return false;
  try {
    return readdirSync(dir).length > 0;
  } catch {
    return false;
  }
};

const ASSETS = [
  {
    label: 'photos',
    manifest: path.join(ROOT, 'src', 'lib', 'photos.generated.ts'),
    outputDir: path.join(ROOT, 'public', 'photos'),
    script: path.join(ROOT, 'scripts', 'optimize-photos.mjs'),
    reason: 'photos or manifest missing/empty — running photography optimization pipeline',
  },
  {
    label: 'loading',
    manifest: path.join(ROOT, 'src', 'lib', 'loader-image.generated.ts'),
    outputDir: path.join(ROOT, 'public', 'images', 'loading'),
    script: path.join(ROOT, 'scripts', 'optimize-loading-image.mjs'),
    reason: 'loading background or manifest missing/empty — building loader image variants',
  },
];

for (const asset of ASSETS) {
  const isManifestPresent = existsSync(asset.manifest);
  const isOutputPresent = hasContent(asset.outputDir);

  if (isManifestPresent && isOutputPresent) continue;

  console.log(`[${asset.label}] ${asset.reason}`);
  const result = spawnSync(process.execPath, [asset.script], { stdio: 'inherit', cwd: ROOT });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
