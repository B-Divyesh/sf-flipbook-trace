import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';

const indexPath = new URL('../dist/index.html', import.meta.url);
const workerPath = new URL('../dist/sw.js', import.meta.url);
const index = await readFile(indexPath, 'utf8');
const worker = await readFile(workerPath, 'utf8');
const appJs = index.match(/(?:src="|href=")(\/assets\/[^"']+\.js)/)?.[1];
const appCss = index.match(/(?:src="|href=")(\/assets\/[^"']+\.css)/)?.[1];

if (!appJs || !appCss) throw new Error('Could not find the hashed app assets in dist/index.html.');

const assetDirectory = new URL('../dist/assets/', import.meta.url);
const appModules = (await readdir(assetDirectory))
  .filter((file) => file.endsWith('.js') && `/assets/${file}` !== appJs)
  .map((file) => `/assets/${file}`);
const buildHash = createHash('sha256').update(`${appJs}:${appCss}`).digest('hex').slice(0, 12);
const finalized = worker
  .replace('__APP_JS__', appJs)
  .replace('__APP_CSS__', appCss)
  .replace('__APP_MODULES__', appModules.map((module) => `'${module}'`).join(', '))
  .replace('__BUILD_HASH__', buildHash);

if (finalized.includes('__APP_') || finalized.includes('__BUILD_HASH__')) {
  throw new Error('Service worker build placeholders remain.');
}

await writeFile(workerPath, finalized);
