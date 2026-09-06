const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'out');

if (!fs.existsSync(OUT)) {
  console.error('[audit] out/ does not exist — run `npm run export` first.');
  process.exit(1);
}

// Read the generated TypeScript manifests as text and extract the data we need
const photosGeneratedPath = path.join(ROOT, 'src', 'lib', 'photos.generated.ts');
const loaderGeneratedPath = path.join(ROOT, 'src', 'lib', 'loader-image.generated.ts');

const photosContent = fs.readFileSync(photosGeneratedPath, 'utf-8');
const loaderContent = fs.readFileSync(loaderGeneratedPath, 'utf-8');

// Extract photo IDs and their src/srcSet values using regex
const srcRegex = /^\s*\bsrc:\s*"([^"]+)"/m;
const srcSetRegex = /^\s*\bsrcSet:\s*"([^"]+)"/m;
const avifRegex = /^\s*\bavifSrcSet:\s*"([^"]+)"/m;

const PHOTOS = {};
let match;

// Find each photo entry by looking for the pattern: "0f5a...": {
const entryRegex = /^\s+"([0-9a-f]+)":\s*\{/gm;

while ((match = entryRegex.exec(photosContent)) !== null) {
  const id = match[1];
  // The match[0] contains '"0f5a...": {' - we need to find where the { actually starts
  const matchStr = match[0];
  const braceIndex = match.index + matchStr.indexOf('{');

  // Find the closing brace for this entry - count braces
  let braceCount = 0;
  let entryEnd = braceIndex;
  for (let i = braceIndex; i < photosContent.length; i++) {
    if (photosContent[i] === '{') braceCount++;
    if (photosContent[i] === '}') braceCount--;
    if (braceCount === 0) {
      entryEnd = i;
      break;
    }
  }

  const entryContent = photosContent.slice(braceIndex, entryEnd + 1);

  const srcMatch = srcRegex.exec(entryContent);
  const srcSetMatch = srcSetRegex.exec(entryContent);
  const avifMatch = avifRegex.exec(entryContent);

  PHOTOS[id] = {
    src: srcMatch ? srcMatch[1] : null,
    srcSet: srcSetMatch ? srcSetMatch[1] : null,
    avifSrcSet: avifMatch ? avifMatch[1] : null,
  };
}

const PHOTO_IDS = Object.keys(PHOTOS);

// Extract loader background
const loaderMatch = loaderContent.match(/export const LOADER_BACKGROUND:.*?=\s*(\{[^;]+|null)/s);
let LOADER_BACKGROUND = null;

if (loaderMatch && loaderMatch[1].trim() !== 'null') {
  const content = loaderMatch[1];
  const srcMatch = srcRegex.exec(content);
  const srcSetMatch = srcSetRegex.exec(content);
  const avifMatch = avifRegex.exec(content);

  LOADER_BACKGROUND = {
    src: srcMatch ? srcMatch[1] : null,
    srcSet: srcSetMatch ? srcSetMatch[1] : null,
    avifSrcSet: avifMatch ? avifMatch[1] : null,
  };
}

const collectUrls = (entry) => {
  const urls = new Set();
  if (entry.src) urls.add(entry.src);
  if (entry.srcSet) {
    for (const part of entry.srcSet.split(',')) {
      const u = part.trim().split(' ')[0];
      if (u) urls.add(u);
    }
  }
  if (entry.avifSrcSet) {
    for (const part of entry.avifSrcSet.split(',')) {
      const u = part.trim().split(' ')[0];
      if (u) urls.add(u);
    }
  }
  return urls;
};

const toDiskPath = (url) => {
  const stripped = url.replace(/^\/+/, '');
  return path.join(OUT, stripped);
};

const checkEntry = (label, entry) => {
  const urls = [...collectUrls(entry)];
  const missing = urls.filter((u) => !fs.existsSync(toDiskPath(u)));
  const sample = urls[0] ?? '(none)';
  const status = missing.length === 0 ? 'OK' : 'MISSING';
  console.log(`  [${status}] ${label}: ${urls.length - missing.length}/${urls.length} files present (e.g. ${sample})`);
  if (missing.length > 0) {
    for (const u of missing) console.log(`          ✗ ${u}`);
  }
  return missing.length;
};

console.log(`[audit] static export at ${OUT}`);
console.log(`[audit] checking ${PHOTO_IDS.length} photographs and the loading background`);

let totalMissing = 0;
for (const id of PHOTO_IDS) {
  const entry = PHOTOS[id];
  totalMissing += checkEntry(`photo ${id}`, entry);
}

if (LOADER_BACKGROUND) {
  totalMissing += checkEntry('loader background', LOADER_BACKGROUND);
} else {
  console.log(`  [OK] loader background: null (no source image, gradient fallback)`);
}

const ogPath = path.join(OUT, 'opengraph-image');
if (fs.existsSync(ogPath) && fs.statSync(ogPath).size > 0) {
  console.log(`  [OK] opengraph card: out/opengraph-image (${(fs.statSync(ogPath).size / 1024).toFixed(1)} KB)`);
} else {
  console.log(`  [MISSING] opengraph card: out/opengraph-image`);
  totalMissing += 1;
}

const photosDir = path.join(OUT, 'photos');
const filesInDir = fs.existsSync(photosDir) ? new Set(fs.readdirSync(photosDir)) : new Set();
const referencedFiles = new Set();
for (const id of PHOTO_IDS) {
  for (const u of collectUrls(PHOTOS[id])) {
    const stripped = u.replace(/^\/+/, '');
    if (stripped.startsWith('photos/')) referencedFiles.add(stripped.slice('photos/'.length));
  }
}
const orphans = [...filesInDir].filter((f) => !referencedFiles.has(f));
console.log(`  [info] out/photos/ has ${filesInDir.size} files, ${orphans.length} orphan${orphans.length === 1 ? '' : 's'}`);

const loadingDir = path.join(OUT, 'images', 'loading');
if (fs.existsSync(loadingDir)) {
  const loadingFiles = new Set(fs.readdirSync(loadingDir));
  let loadingReferenced = 0;
  if (LOADER_BACKGROUND) {
    for (const u of collectUrls(LOADER_BACKGROUND)) {
      const stripped = u.replace(/^\/+/, '');
      if (stripped.startsWith('images/loading/')) {
        const file = stripped.slice('images/loading/'.length);
        if (loadingFiles.has(file)) loadingReferenced += 1;
      }
    }
  }
  console.log(`  [info] out/images/loading/ has ${loadingFiles.size} files, ${loadingReferenced} referenced`);
}

console.log('');
if (totalMissing === 0) {
  console.log('[audit] PASS — every referenced file is present in out/');
  process.exit(0);
} else {
  console.log(`[audit] FAIL — ${totalMissing} missing file${totalMissing === 1 ? '' : 's'}`);
  process.exit(1);
}
