import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, cp, readFile, writeFile, rm, symlink, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCatalog } from '../scripts/catalog.mjs';
import { createOutput } from '../scripts/output.mjs';
import { markdown, validateLinks } from '../site/render.mjs';
import { normalizeBase, sitePath } from '../site/config.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
async function fixture(run) {
  const directory = await mkdtemp(resolve(tmpdir(), 'omp-bazaar-'));
  try {
    await cp(resolve(root, 'plugins'), resolve(directory, 'plugins'), { recursive: true });
    await cp(resolve(root, '.omp-plugin'), resolve(directory, '.omp-plugin'), { recursive: true });
    const path = resolve(directory, '.omp-plugin/marketplace.json');
    const catalog = JSON.parse(await readFile(path, 'utf8'));
    await run({ directory, catalog, save: () => writeFile(path, JSON.stringify(catalog)) });
  } finally { await rm(directory, { recursive: true, force: true }); }
}


test('case-equivalent plugin names are rejected', () => fixture(async ({ directory, catalog, save }) => {
  catalog.plugins.push({ ...catalog.plugins[0], name: catalog.plugins[0].name.toUpperCase() });
  await save(); await assert.rejects(loadCatalog(directory), /Duplicate plugin name/);
}));

test('skill names cannot collide across installed plugins', () => fixture(async ({ directory, catalog }) => {
  const first = catalog.plugins[0];
  const second = catalog.plugins[1];
  await cp(resolve(directory, first.source, `skills/${first.name}`), resolve(directory, second.source, `skills/${first.name}`), { recursive: true });
  await assert.rejects(loadCatalog(directory), /Duplicate skill name/);
}));

test('outside paths and unsafe versions are rejected', async () => {
  for (const source of ['../outside', './plugins/../../outside', 'https://example.com/plugin', './plugins/missing']) {
    await fixture(async ({ directory, catalog, save }) => {
      catalog.plugins[0].source = source; await save(); await assert.rejects(loadCatalog(directory));
    });
  }
  for (const version of ['', '../bad', 'v1', '1.0.0/evil']) {
    await fixture(async ({ directory, catalog, save }) => {
      catalog.plugins[0].version = version; await save(); await assert.rejects(loadCatalog(directory), /Invalid version/);
    });
  }
});

test('a symlink cannot move an install outside its repository', () => fixture(async ({ directory, catalog, save }) => {
  const external = await mkdtemp(resolve(tmpdir(), 'omp-external-'));
  try {
    await symlink(external, resolve(directory, 'plugins/outside'));
    catalog.plugins[0].source = './plugins/outside'; await save();
    await assert.rejects(loadCatalog(directory), /Symlink escapes/);
  } finally { await rm(external, { recursive: true, force: true }); }
}));

test('missing README and skill entries fail', async () => {
  await fixture(async ({ directory, catalog }) => {
    await rm(resolve(directory, catalog.plugins[0].source, 'README.md'));
    await assert.rejects(loadCatalog(directory));
  });
  await fixture(async ({ directory, catalog }) => {
    const skills = resolve(directory, catalog.plugins[0].source, 'skills');
    await rm(skills, { recursive: true }); await mkdir(skills);
    await assert.rejects(loadCatalog(directory), /Missing skill entry/);
  });
});

test('frontmatter, identity, documentation URLs, and actual source links are enforced', async () => {
  await fixture(async ({ directory, catalog }) => {
    const skill = resolve(directory, catalog.plugins[0].source, `skills/${catalog.plugins[0].name}/SKILL.md`);
    await writeFile(skill, '# No frontmatter\n');
    await assert.rejects(loadCatalog(directory), /Missing skill frontmatter/);
  });
  for (const mutate of [catalog => { catalog.owner.name = 'other'; }, catalog => { catalog.plugins[0].homepage = 'javascript:alert(1)'; }, catalog => { catalog.plugins[0].repository += '/wrong'; }]) {
    await fixture(async ({ directory, catalog, save }) => { mutate(catalog); await save(); await assert.rejects(loadCatalog(directory)); });
  }
});

test('link checks reject missing assets, pages, and anchors', async () => {
  for (const missing of ['favicon.svg', 'assets/app.js', 'guide/index.html']) {
    const { files } = await createOutput('');
    files.delete(missing);
    assert.throws(() => validateLinks(files), /Missing linked resource/);
  }
  const files = new Map([['index.html', '<a href="#not-there">Broken</a>']]);
  assert.throws(() => validateLinks(files), /Missing anchor/);
});

test('base paths normalize predictably and reject URL/path injection', () => {
  assert.equal(normalizeBase('/omp-bazaar/'), '/omp-bazaar');
  assert.equal(sitePath('plugins/example/', 'omp-bazaar'), '/omp-bazaar/plugins/example/');
  for (const value of ['https://example.com', '/../outside', '/a?x=1', '/a#b', '//other']) assert.throws(() => normalizeBase(value));
});

test('README rendering escapes HTML and disallows executable links and remote images', () => {
  const html = markdown('<script>alert(1)</script>\n\n[unsafe](javascript:alert)\n\n![Image](https://example.com/image.png)\n\n[safe](https://github.com/suj1e/omp-bazaar)');
  assert.equal(html.includes('<script>'), false);
  assert.equal(html.includes('href="javascript:'), false);
  assert.equal(html.includes('<img'), false);
  assert.ok(html.includes('href="https://github.com/suj1e/omp-bazaar"'));
});
