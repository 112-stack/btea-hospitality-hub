import { access, cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const webBuild = path.join(projectRoot, 'dist');
const mobileBuild = path.join(projectRoot, 'dist-mobile');

await access(path.join(webBuild, 'portal.html'));
await rm(mobileBuild, { recursive: true, force: true });
await mkdir(mobileBuild, { recursive: true });
await cp(webBuild, mobileBuild, { recursive: true });

const stripPwaRegistration = (html) => html
  .replace(/<script[^>]+src=["']\/registerSW\.js["'][^>]*><\/script>/g, '')
  .replace(/<link[^>]+rel=["']manifest["'][^>]*>/g, '');

const publicHtml = stripPwaRegistration(await readFile(path.join(webBuild, 'index.html'), 'utf8'));
const workspaceHtml = stripPwaRegistration(await readFile(path.join(webBuild, 'portal.html'), 'utf8'))
  .replace(/<title>.*?<\/title>/, '<title>Hospitality Services Companion</title>')
  .replace(/<meta name="description"[^>]*>/, '<meta name="description" content="Independent Bahrain hospitality service preparation companion" />');

await writeFile(path.join(mobileBuild, 'public.html'), publicHtml, 'utf8');
await writeFile(path.join(mobileBuild, 'index.html'), workspaceHtml, 'utf8');

console.log('Prepared dist-mobile with the app workspace as the native entry point.');
