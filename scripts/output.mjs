import { readFile, mkdir, writeFile, rm } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCatalog } from './catalog.mjs';
import { renderSite, validateLinks } from '../site/render.mjs';

export const root = fileURLToPath(new URL('../', import.meta.url));
export async function createOutput(base = '') {
  const catalog = await loadCatalog(root);
  const files = renderSite(catalog, base);
  for (const [source, target] of [['style.css', 'assets/style.css'], ['app.js', 'assets/app.js'], ['favicon.svg', 'favicon.svg']]) {
    files.set(target, await readFile(resolve(root, 'site/assets', source), 'utf8'));
  }
  files.set('.nojekyll', '');
  validateLinks(files, base);
  return { catalog, files };
}
export async function writeOutput(files) {
  const destination = resolve(root, 'dist');
  await rm(destination, { recursive: true, force: true });
  for (const [path, content] of files) {
    const target = resolve(destination, path);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, content);
  }
}
