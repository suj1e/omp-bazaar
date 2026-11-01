import { readFile, readdir, realpath, stat } from 'node:fs/promises';
import { resolve, relative, isAbsolute, sep } from 'node:path';

const namePattern = /^[a-zA-Z0-9](?:[a-zA-Z0-9.-]{0,62}[a-zA-Z0-9])?$/;
const semver = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;
function requireThat(condition, message) { if (!condition) throw new Error(message); }
const inside = (root, path) => { const rel = relative(root, path); return rel !== '..' && !rel.startsWith(`..${sep}`) && !isAbsolute(rel); };
export async function containedPath(root, source) {
  const absoluteRoot = await realpath(root);
  const absolute = resolve(absoluteRoot, source);
  requireThat(inside(absoluteRoot, absolute), `Path escapes repository: ${source}`);
  const actual = await realpath(absolute);
  requireThat(inside(absoluteRoot, actual), `Symlink escapes repository: ${source}`);
  return actual;
}
function webURL(value, label) {
  requireThat(typeof value === 'string', `Missing ${label}`);
  const url = new URL(value);
  requireThat(url.protocol === 'https:' && !url.username && !url.password, `Invalid HTTPS ${label}`);
}
export async function loadCatalog(root) {
  const catalog = JSON.parse(await readFile(resolve(root, '.omp-plugin/marketplace.json'), 'utf8'));
  requireThat(catalog.name === 'omp-bazaar' && namePattern.test(catalog.name), 'Invalid marketplace name');
  requireThat(catalog.owner?.name === 'suj1e', 'Invalid marketplace owner');
  requireThat(Array.isArray(catalog.plugins) && catalog.plugins.length > 0, 'Missing plugin entries');
  requireThat(!catalog.metadata?.pluginRoot, 'Use direct ./plugins/ sources');
  const names = new Set();
  const sources = new Set();
  const skillNames = new Set();
  const plugins = [];
  for (const entry of catalog.plugins) {
    requireThat(typeof entry.name === 'string' && namePattern.test(entry.name), 'Invalid plugin name');
    requireThat(`${entry.name}@${catalog.name}`.length <= 128, 'Plugin ID too long');
    const key = entry.name.toLowerCase();
    requireThat(!names.has(key), `Duplicate plugin name: ${entry.name}`); names.add(key);
    requireThat(typeof entry.source === 'string' && /^\.\/plugins\/[a-zA-Z0-9.-]+$/.test(entry.source), `Invalid local source: ${entry.name}`);
    const source = await containedPath(root, entry.source);
    requireThat(!sources.has(source), `Duplicate plugin source: ${entry.name}`); sources.add(source);
    requireThat((await stat(source)).isDirectory(), `Source is not a directory: ${entry.name}`);
    requireThat(typeof entry.version === 'string' && semver.test(entry.version) && !entry.version.includes('..'), `Invalid version: ${entry.name}`);
    requireThat(typeof entry.description === 'string' && entry.description.trim().length > 15, `Missing description: ${entry.name}`);
    requireThat(typeof entry.category === 'string' && entry.category.trim(), `Missing category: ${entry.name}`);
    requireThat(Array.isArray(entry.tags) && entry.tags.every(tag => typeof tag === 'string' && tag.length), `Invalid tags: ${entry.name}`);
    requireThat(entry.author?.name === 'suj1e' && entry.license === 'MIT', `Missing authorship/license: ${entry.name}`);
    webURL(entry.homepage, 'homepage'); webURL(entry.repository, 'repository');
    requireThat(entry.homepage === `https://ompbazaar.beer/plugins/${entry.name}/`, `Wrong homepage: ${entry.name}`);
    requireThat(entry.repository === `https://github.com/suj1e/omp-bazaar/tree/main/${entry.source.slice(2)}`, `Wrong source link: ${entry.name}`);
    const readmePath = await containedPath(source, 'README.md');
    const readme = await readFile(readmePath, 'utf8');
    requireThat(readme.includes(`/marketplace install ${entry.name}@${catalog.name}`), `Missing real install command: ${entry.name}`);
    requireThat(readme.includes('/marketplace add suj1e/omp-bazaar') && readme.includes('/reload-plugins'), `Missing installation guidance: ${entry.name}`);
    const skillsDir = await containedPath(source, 'skills');
    const entries = await readdir(skillsDir, { withFileTypes: true });
    const skills = [];
    for (const directory of entries) {
      requireThat(directory.isDirectory() && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(directory.name), `Invalid skill directory: ${directory.name}`);
      requireThat(!skillNames.has(directory.name), `Duplicate skill name: ${directory.name}`);
      skillNames.add(directory.name);
      const skillPath = await containedPath(source, `skills/${directory.name}/SKILL.md`);
      const content = await readFile(skillPath, 'utf8');
      const frontmatter = content.match(/^---\r?\n([\s\S]+?)\r?\n---\r?\n/);
      requireThat(frontmatter, `Missing skill frontmatter: ${directory.name}`);
      requireThat(frontmatter[1].split(/\r?\n/).includes(`name: ${directory.name}`), `Invalid skill name: ${directory.name}`);
      requireThat(/^description: .{30,}$/m.test(frontmatter[1]), `Missing skill description: ${directory.name}`);
      skills.push({ name: directory.name, path: `${entry.source.slice(2)}/skills/${directory.name}/SKILL.md` });
    }
    requireThat(skills.length > 0, `Missing skill entry: ${entry.name}`);
    plugins.push({ ...entry, readme, skills });
  }
  return { ...catalog, plugins };
}
