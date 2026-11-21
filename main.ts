// Vice Nights Cover Lab — entry program (gta6-cover-art-01, round 2).
//
// Hands the app in: copies app/ and screenshots/ from this repository to the
// output directory and writes output/dossier.json with buildDossier from
// vendor/makefun-app.ts. Node 22 standard library only, no build step, no
// network. Deterministic: two runs over the same repository write the same
// bytes (files are copied in sorted order; the dossier is canonical JSON).
//
// Usage:
//   node main.ts                          # writes to /output
//   MAKEFUN_OUTPUT_DIR=out node main.ts   # writes to out (outside the grader)

import { buildDossier } from './vendor/makefun-app.ts';
import { existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)));
const OUTPUT_DIR = resolve(process.env.MAKEFUN_OUTPUT_DIR || '/output');

const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
};

function copyTree(srcDir: string, dstDir: string): void {
  mkdirSync(dstDir, { recursive: true });
  const entries = readdirSync(srcDir).sort();
  for (const name of entries) {
    const src = join(srcDir, name);
    const dst = join(dstDir, name);
    const stat = lstatSync(src);
    if (stat.isDirectory()) {
      copyTree(src, dst);
    } else if (stat.isFile()) {
      writeFileSync(dst, readFileSync(src));
    }
  }
}

function countTree(dir: string): { files: number; bytes: number } {
  let files = 0;
  let bytes = 0;
  for (const name of readdirSync(dir).sort()) {
    const p = join(dir, name);
    const stat = lstatSync(p);
    if (stat.isDirectory()) {
      const sub = countTree(p);
      files += sub.files;
      bytes += sub.bytes;
    } else if (stat.isFile()) {
      files += 1;
      bytes += stat.size;
    }
  }
  return { files, bytes };
}

function main(): void {
  const appDir = join(REPO_ROOT, 'app');
  const shotsDir = join(REPO_ROOT, 'screenshots');
  if (!existsSync(appDir)) throw new Error('missing app/ in ' + REPO_ROOT);
  if (!existsSync(shotsDir)) throw new Error('missing screenshots/ in ' + REPO_ROOT);

  rmSync(OUTPUT_DIR, { recursive: true, force: true });
  mkdirSync(OUTPUT_DIR, { recursive: true });

  copyTree(appDir, join(OUTPUT_DIR, 'app'));
  copyTree(shotsDir, join(OUTPUT_DIR, 'screenshots'));

  const dossier = buildDossier(OUTPUT_DIR, DOSSIER_CAPS);
  writeFileSync(join(OUTPUT_DIR, 'dossier.json'), dossier);
  const appCount = countTree(join(OUTPUT_DIR, 'app'));
  const shotCount = countTree(join(OUTPUT_DIR, 'screenshots'));
  console.log('wrote ' + join(OUTPUT_DIR, 'dossier.json') + ' (' + dossier.length + ' bytes)');
  console.log('app/: ' + appCount.files + ' files, ' + appCount.bytes + ' bytes; ' +
    'screenshots/: ' + shotCount.files + ' files, ' + shotCount.bytes + ' bytes');
}

main();
