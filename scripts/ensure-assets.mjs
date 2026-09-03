/**
 * Guard that runs before `dev` and `build`.
 *
 * Both image pipelines write generated TypeScript that is gitignored, because it
 * is derived data — so a fresh clone has no src/lib/*.generated.ts and would
 * fail with a module-not-found error before Next even starts. Rather than that,
 * generate whatever is missing on demand.
 *
 * Nothing here rebuilds an existing manifest: adding or replacing source images
 * is an explicit `npm run photos` / `npm run loading-image`.
 */
import { existsSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = path.resolve(import.meta.dirname, '..');

const ASSETS = [
  {
    label: 'photos',
    manifest: path.join(ROOT, 'src', 'lib', 'photos.generated.ts'),
    script: path.join(ROOT, 'scripts', 'optimize-photos.mjs'),
    reason: 'photo manifest missing — running the photography pipeline first',
  },
  {
    label: 'loading',
    manifest: path.join(ROOT, 'src', 'lib', 'loader-image.generated.ts'),
    script: path.join(ROOT, 'scripts', 'optimize-loading-image.mjs'),
    reason: 'loading-screen manifest missing — building the loader background first',
  },
];

for (const asset of ASSETS) {
  if (existsSync(asset.manifest)) continue;

  console.log(`[${asset.label}] ${asset.reason}`);
  const result = spawnSync(process.execPath, [asset.script], { stdio: 'inherit', cwd: ROOT });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
