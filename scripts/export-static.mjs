/**
 * Builds the site as a folder of plain files, for hosting that cannot run Node.
 *
 * InfinityFree and most other free or cPanel-style hosts serve Apache and PHP
 * and nothing else, so `next start` is not an option there. Nothing in this site
 * needs a server — no middleware, no route handlers, no server actions — so the
 * whole thing exports.
 *
 * Three jobs, in order:
 *   1. build with STATIC_EXPORT=1, which switches next.config.ts to
 *      `output: 'export'` (see the flag there for why it is not the default),
 *   2. copy deploy/htaccess.conf to out/.htaccess, carrying the caching policy
 *      that an export cannot send as headers,
 *   3. measure the result against the limits that actually bite on free hosting:
 *      the file count, the total size, and the per-file cap on scripts and pages.
 *
 * Run it with `npm run export`. Upload the *contents* of out/ into htdocs/.
 */
import { copyFileSync, existsSync, readdirSync, rmSync, statSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'out');
const HTACCESS_SOURCE = path.join(ROOT, 'deploy', 'htaccess.conf');

/**
 * InfinityFree's published limits, which are stricter than disk space suggests.
 * The inode ceiling counts files, not bytes — 515 photograph variants is fine,
 * a node_modules upload would not be. The 1 MB cap applies to HTML, JS and PHP
 * only; images are bounded by the separate 10 MB per-file limit.
 *
 * Other hosts differ. These are reported, never enforced: the script warns and
 * still leaves a complete export behind, because the numbers are worth knowing
 * before an FTP session rather than after one.
 */
const LIMITS = {
  files: 30_000,
  totalBytes: 5 * 1024 ** 3,
  /** Per HTML/JS file. */
  scriptBytes: 1024 ** 2,
  /** Per file of any other kind. */
  assetBytes: 10 * 1024 ** 2,
};

const mb = (bytes) => `${(bytes / 1024 ** 2).toFixed(1)} MB`;

/** Every file under `dir`, as paths relative to it. */
const walk = (dir, base = dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full, base) : [path.relative(base, full)];
  });

// A stale out/ would otherwise be uploaded alongside the new one — pages that
// no longer exist keep answering, and they count against the inode ceiling.
if (existsSync(OUT)) {
  console.log('[export] clearing the previous out/');
  try {
    rmSync(OUT, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 });
  } catch (error) {
    // On Windows a single open handle is enough to make this fail, and the raw
    // EPERM says nothing about why.
    console.error(`[export] could not remove out/ (${error.code ?? 'unknown error'}).`);
    console.error('[export] close anything holding it open — a local preview server, an FTP');
    console.error('[export] client, an Explorer window — and run the command again.');
    process.exit(1);
  }
}

console.log('[export] building a static export');
// Next's CLI is invoked through node directly rather than through npx/`next`, so
// the command does not depend on a shell being present or on PATH resolution —
// the same reason ensure-assets.mjs uses process.execPath.
const build = spawnSync(process.execPath, [path.join(ROOT, 'node_modules', 'next', 'dist', 'bin', 'next'), 'build'], {
  stdio: 'inherit',
  cwd: ROOT,
  env: { ...process.env, STATIC_EXPORT: '1' },
});

if (build.status !== 0) process.exit(build.status ?? 1);

if (!existsSync(HTACCESS_SOURCE)) {
  console.error('[export] deploy/htaccess.conf is missing — the export would ship uncached');
  process.exit(1);
}

copyFileSync(HTACCESS_SOURCE, path.join(OUT, '.htaccess'));
console.log('[export] wrote out/.htaccess');

// ---------------------------------------------------------------------------
// Work around vercel/next.js#85374.
// ---------------------------------------------------------------------------
// Next 16 writes each route's per-segment navigation payload into a nested
// directory — blog/__next.blog/__PAGE__.txt — but the router asks for it with
// dots instead of slashes: /blog/__next.blog.__PAGE__.txt. A Node server maps
// one onto the other; a plain file host answers 404, which shows up as failed
// prefetches in the console and, on a host with a daily request allowance, as
// requests spent on nothing.
//
// The payloads are a few kilobytes each and there are only a handful, so both
// spellings are written rather than one moved: whichever name the router asks
// for resolves, and a Next release that fixes the paths does not break this.
// Delete this block once the upstream issue is closed.
const aliasSegmentPayloads = (dir) => {
  let written = 0;

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;

    const full = path.join(dir, entry.name);

    if (entry.name.startsWith('__next.')) {
      // Every file below this point becomes a sibling of the directory, named
      // by joining the path it sits at with dots.
      for (const relative of walk(full)) {
        const flat = [entry.name, ...relative.split(path.sep)].join('.');
        copyFileSync(path.join(full, relative), path.join(dir, flat));
        written += 1;
      }
      continue;
    }

    written += aliasSegmentPayloads(full);
  }

  return written;
};

const aliased = aliasSegmentPayloads(OUT);
if (aliased > 0) {
  console.log(`[export] wrote ${aliased} flattened navigation payload${aliased === 1 ? '' : 's'} (next#85374)`);
}

// ---------------------------------------------------------------------------
// What the upload will look like from the host's side.
// ---------------------------------------------------------------------------
const files = walk(OUT).map((relative) => ({
  relative,
  bytes: statSync(path.join(OUT, relative)).size,
}));

const totalBytes = files.reduce((sum, file) => sum + file.bytes, 0);
const isScript = (relative) => /\.(html|js|mjs)$/i.test(relative);

const oversizeScripts = files
  .filter((file) => isScript(file.relative) && file.bytes > LIMITS.scriptBytes)
  .sort((a, b) => b.bytes - a.bytes);

const oversizeAssets = files
  .filter((file) => !isScript(file.relative) && file.bytes > LIMITS.assetBytes)
  .sort((a, b) => b.bytes - a.bytes);

const largestScript = files
  .filter((file) => isScript(file.relative))
  .sort((a, b) => b.bytes - a.bytes)[0];

console.log('');
console.log('[export] out/ is ready to upload');
console.log(`  files        ${files.length.toLocaleString()} of ${LIMITS.files.toLocaleString()} inodes`);
console.log(`  total size   ${mb(totalBytes)} of ${mb(LIMITS.totalBytes)}`);
if (largestScript) {
  console.log(`  largest page/script  ${largestScript.relative} — ${mb(largestScript.bytes)} (cap 1.0 MB)`);
}

for (const file of oversizeScripts) {
  console.warn(`  ! over the 1 MB HTML/JS cap: ${file.relative} — ${mb(file.bytes)}`);
}
for (const file of oversizeAssets) {
  console.warn(`  ! over the 10 MB file cap: ${file.relative} — ${mb(file.bytes)}`);
}

if (files.length > LIMITS.files) {
  console.warn(`  ! more files than the 30,000-inode ceiling allows`);
}
if (totalBytes > LIMITS.totalBytes) {
  console.warn(`  ! larger than the 5 GB disk allowance`);
}

console.log('');
console.log('  Upload the contents of out/ into htdocs/ (including .htaccess).');
console.log('  Set NEXT_PUBLIC_SITE_URL to the live address before building, or');
console.log('  the sitemap and share cards will point at localhost.');
