#!/usr/bin/env node
/**
 * Gera projects/projects.json a partir das subpastas de projects/.
 *
 * Uso:  node scripts/build-projects.mjs          (grava o arquivo)
 *       node scripts/build-projects.mjs --check  (só confere; sai com código 1 se estiver desatualizado)
 *
 * Regras:
 *  - Cada subpasta de projects/ com um index.html vira um projeto.
 *  - Pastas que começam com "_" ou "." são ignoradas (ex.: projects/_modelo).
 *  - Se existir projects/<pasta>/project.json, usa: title, description, date (AAAA-MM-DD), tags, cover.
 *  - O que faltar vem do index.html (<title> e <meta name="description">)
 *    e a data vem do último commit git da pasta (ou da data de modificação do arquivo).
 *  - Resultado ordenado do mais novo para o mais antigo.
 *
 * Sem dependências: só Node 18+.
 */
import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname, resolve, posix } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PROJECTS = join(ROOT, 'projects');
const OUT = join(PROJECTS, 'projects.json');
const CHECK = process.argv.includes('--check');

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function decodeEntities(s) {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
}

function fromHtml(html) {
  const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
  let description = '';
  for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
    if (/name\s*=\s*["']description["']/i.test(tag)) {
      const c = /content\s*=\s*(["'])([\s\S]*?)\1/i.exec(tag);
      if (c) { description = c[2]; break; }
    }
  }
  const clean = (s) => decodeEntities(s.replace(/\s+/g, ' ').trim());
  return { title: title ? clean(title[1]) : '', description: clean(description) };
}

function gitDate(dir) {
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cs', '--', dir], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    return DATE_RE.test(out) ? out : '';
  } catch { return ''; }
}

function mtimeDate(dir) {
  let newest = 0;
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    if (f.isFile()) newest = Math.max(newest, statSync(join(dir, f.name)).mtimeMs);
  }
  const d = new Date(newest || Date.now());
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function readMeta(dir, slug) {
  const file = join(dir, 'project.json');
  if (!existsSync(file)) return {};
  try {
    const data = JSON.parse(readFileSync(file, 'utf8'));
    return data && typeof data === 'object' && !Array.isArray(data) ? data : {};
  } catch (e) {
    console.warn(`⚠  ${slug}/project.json inválido (${e.message}); usando o index.html.`);
    return {};
  }
}

function coverPath(slug, cover) {
  if (typeof cover !== 'string' || !cover.trim()) return undefined;
  cover = cover.trim();
  if (/^https:\/\//i.test(cover)) return cover;
  if (/^[a-z]+:/i.test(cover) || cover.startsWith('/')) return undefined; // só relativo ou https
  const p = posix.normalize(posix.join('projects', slug, cover));
  return p.startsWith(`projects/${slug}/`) ? p : undefined;
}

const projects = [];
const entries = existsSync(PROJECTS) ? readdirSync(PROJECTS, { withFileTypes: true }) : [];
for (const e of entries) {
  if (!e.isDirectory() || e.name.startsWith('_') || e.name.startsWith('.')) continue;
  if (!/^[A-Za-z0-9][\w.-]*$/.test(e.name)) { console.warn(`⚠  ignorando "${e.name}": use só letras, números, - _ .`); continue; }
  const dir = join(PROJECTS, e.name);
  const index = join(dir, 'index.html');
  if (!existsSync(index)) { console.warn(`⚠  ignorando "${e.name}": falta index.html`); continue; }

  const meta = readMeta(dir, e.name);
  const html = fromHtml(readFileSync(index, 'utf8'));
  const date = DATE_RE.test(String(meta.date || '')) ? meta.date : (gitDate(dir) || mtimeDate(dir));
  const tags = Array.isArray(meta.tags) ? meta.tags.map((t) => String(t).trim()).filter(Boolean) : [];

  const item = {
    slug: e.name,
    title: String(meta.title || html.title || e.name).trim(),
    description: String(meta.description || html.description || '').trim(),
    date,
    tags,
    url: `projects/${e.name}/`,
  };
  const cover = coverPath(e.name, meta.cover);
  if (cover) item.cover = cover;
  projects.push(item);
}

projects.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.title.localeCompare(b.title, 'pt-BR')));

const json = JSON.stringify(projects, null, 2) + '\n';
const current = existsSync(OUT) ? readFileSync(OUT, 'utf8') : '';

if (CHECK) {
  if (current !== json) { console.error('✗ projects/projects.json está desatualizado. Rode: node scripts/build-projects.mjs'); process.exit(1); }
  console.log(`✓ projects/projects.json em dia (${projects.length} projeto(s)).`);
} else if (current === json) {
  console.log(`= Nada mudou (${projects.length} projeto(s)).`);
} else {
  writeFileSync(OUT, json);
  console.log(`✓ projects/projects.json gerado com ${projects.length} projeto(s).`);
}
