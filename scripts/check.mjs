import { createOutput } from './output.mjs';
for (const base of ['', '/omp-bazaar/']) {
  const { catalog, files } = await createOutput(base);
  console.log(`Validated ${catalog.plugins.length} installable skill plugins, ${files.size} output resources, base ${base || '/'}`);
}
