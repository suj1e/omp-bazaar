import { createOutput, writeOutput } from './output.mjs';
const { files, catalog } = await createOutput(process.env.BASE_PATH || '');
await writeOutput(files);
console.log(`Built ${files.size} files and ${catalog.plugins.length} plugin pages in dist/`);
