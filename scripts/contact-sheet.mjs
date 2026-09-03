/**
 * Development helper: tiles every original in /Photos into numbered contact
 * sheets under /.contact-sheets so the whole library can be reviewed at a
 * glance when curating projects. Not part of the app build.
 *
 *   node scripts/contact-sheet.mjs
 */
import { mkdir, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const SOURCE_DIR = path.join(ROOT, 'Photos');
const OUT_DIR = path.join(ROOT, '.contact-sheets');

const COLS = 4;
const ROWS = 3;
const CELL_W = 400;
const CELL_H = 267;
const PER_SHEET = COLS * ROWS;

async function getPhotoFiles(dir, baseDir = dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await getPhotoFiles(fullPath, baseDir)));
    } else if (entry.isFile() && /\.(jpe?g|png|tiff?|webp)$/i.test(entry.name)) {
      const relPath = path.relative(baseDir, fullPath).split(path.sep).join('/');
      files.push(relPath);
    }
  }
  return files.sort();
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const files = await getPhotoFiles(SOURCE_DIR);
  const index = [];

  for (let sheet = 0; sheet * PER_SHEET < files.length; sheet += 1) {
    const slice = files.slice(sheet * PER_SHEET, (sheet + 1) * PER_SHEET);
    const composites = [];

    for (let i = 0; i < slice.length; i += 1) {
      const file = slice[i];
      const globalIndex = sheet * PER_SHEET + i;
      index.push(`${String(globalIndex).padStart(2, '0')}  ${file}`);
      const buffer = await sharp(path.join(SOURCE_DIR, file))
        .rotate()
        .resize(CELL_W, CELL_H, { fit: 'cover' })
        .jpeg({ quality: 70 })
        .toBuffer();
      composites.push({
        input: buffer,
        left: (i % COLS) * CELL_W,
        top: Math.floor(i / COLS) * CELL_H,
      });
    }

    const out = path.join(OUT_DIR, `sheet-${sheet + 1}.jpg`);
    await sharp({
      create: {
        width: COLS * CELL_W,
        height: ROWS * CELL_H,
        channels: 3,
        background: { r: 10, g: 10, b: 10 },
      },
    })
      .composite(composites)
      .jpeg({ quality: 74 })
      .toFile(out);
    console.log(`[sheet] ${out} (${slice.length} frames)`);
  }

  await writeFile(path.join(OUT_DIR, 'index.txt'), `${index.join('\n')}\n`, 'utf8');
  console.log(`[sheet] ${files.length} frames indexed`);
}

main().catch((error) => {
  console.error('[sheet] failed:', error);
  process.exit(1);
});
