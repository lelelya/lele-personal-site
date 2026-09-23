import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'dist', 'client');
const target = path.join(root, 'dist', 'pages');
const base = '/lele-personal-site/';
const textExtensions = new Set(['.html', '.css', '.js', '.json', '.xml', '.txt']);

await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });
await cp(source, target, { recursive: true });

async function rewrite(folder) {
  for (const entry of await readdir(folder, { withFileTypes: true })) {
    const filename = path.join(folder, entry.name);
    if (entry.isDirectory()) {
      await rewrite(filename);
      continue;
    }
    if (!textExtensions.has(path.extname(entry.name).toLowerCase())) continue;
    const original = await readFile(filename, 'utf8');
    const transformed = original
      .replace(/(["'`])\/(assets|data|diary|notes|projects)(?=\/|["'`])/g, `$1${base}$2`)
      .replace(/(["'`])\/\1/g, `$1${base}$1`);
    if (transformed !== original) await writeFile(filename, transformed, 'utf8');
  }
}

await rewrite(target);
await writeFile(path.join(target, '.nojekyll'), '', 'utf8');
console.log(`Prepared GitHub Pages artifact at ${target}`);
