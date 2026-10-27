#!/usr/bin/env node
/**
 * Gera o manifesto de CADA categoria do site (projects/, tools/, games/ ...).
 * As categorias vêm de assets/js/categories.js (a mesma lista usada pelo site).
 *
 * Uso:  node scripts/build-manifests.mjs          (grava os arquivos que mudaram)
 *       node scripts/build-manifests.mjs --check  (só confere; sai com código 1 se algum estiver desatualizado)
 *       node scripts/build-manifests.mjs --list   (só imprime os caminhos dos manifestos)
 *
 * Regras (iguais para todas as categorias; <dir> = pasta da categoria):
 *  - Cada subpasta de <dir>/ com um index.html vira um item; o manifesto é <dir>/<dir>.json.
 *  - Pastas que começam com "_" ou "." são ignoradas (ex.: <dir>/_modelo).
 *  - Se existir <dir>/<pasta>/project.json, usa: title, description, date (AAAA-MM-DD), tags, cover.
 *  - O que faltar vem do index.html (<title> e <meta name="description">)
 *    e a data vem do último commit git da pasta (ou da data de modificação do arquivo).
 *  - "added" = segundos Unix do primeiro commit da pasta (omitido se ainda não commitada).
 *  - Ordem: "date" mais nova primeiro; empate → "added" mais recente primeiro
 *    (sem "added" = a mais nova); depois, ordem alfabética.
 *
 * Sem dependências: só Node 18+.
 */
import { readdirSync, readFileSync, writeFileSync, existsSync, statSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve, posix } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import vm from 'node:vm';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check');
const LIST = process.argv.includes('--list');

function loadCategories() {
  const ctx = {};
  vm.runInNewContext(readFileSync(join(ROOT, 'assets/js/categories.js'), 'utf8'), { window: ctx });
  const cats = ctx.SITE_CATEGORIES;
  if (!Array.isArray(cats) || !cats.length) throw new Error('assets/js/categories.js não definiu SITE_CATEGORIES');
  for (const c of cats) {
    if (!c || !/^[a-z0-9][\w-]*$/i.test(c.dir || '')) throw new Error(`categoria com "dir" inválido: ${JSON.stringify(c && c.dir)}`);
  }
  return cats;
}

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

// Momento (segundos Unix) em que a pasta entrou no repositório: primeiro commit que a tocou.
// Pasta ainda não commitada → undefined (conta como "agora", a mais nova).
function gitAdded(dir) {
  try {
    const out = execFileSync('git', ['log', '--format=%ct', '--', dir], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    const lines = out.split('\n').filter(Boolean);
    return lines.length ? Number(lines[lines.length - 1]) : undefined;
  } catch { return undefined; }
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

function coverPath(dirName, slug, cover) {
  if (typeof cover !== 'string' || !cover.trim()) return undefined;
  cover = cover.trim();
  if (/^https:\/\//i.test(cover)) return cover;
  if (/^[a-z]+:/i.test(cover) || cover.startsWith('/')) return undefined; // só relativo ou https
  const p = posix.normalize(posix.join(dirName, slug, cover));
  return p.startsWith(`${dirName}/${slug}/`) ? p : undefined;
}

function buildCategory(dirName) {
  const base = join(ROOT, dirName);
  const items = [];
  const entries = existsSync(base) ? readdirSync(base, { withFileTypes: true }) : [];
  for (const e of entries) {
    if (!e.isDirectory() || e.name.startsWith('_') || e.name.startsWith('.')) continue;
    if (!/^[A-Za-z0-9][\w.-]*$/.test(e.name)) { console.warn(`⚠  ${dirName}: ignorando "${e.name}": use só letras, números, - _ .`); continue; }
    const dir = join(base, e.name);
    const index = join(dir, 'index.html');
    if (!existsSync(index)) { console.warn(`⚠  ${dirName}: ignorando "${e.name}": falta index.html`); continue; }

    const meta = readMeta(dir, `${dirName}/${e.name}`);
    const html = fromHtml(readFileSync(index, 'utf8'));
    const date = DATE_RE.test(String(meta.date || '')) ? meta.date : (gitDate(dir) || mtimeDate(dir));
    const tags = Array.isArray(meta.tags) ? meta.tags.map((t) => String(t).trim()).filter(Boolean) : [];

    const item = {
      slug: e.name,
      title: String(meta.title || html.title || e.name).trim(),
      description: String(meta.description || html.description || '').trim(),
      date,
      tags,
      url: `${dirName}/${e.name}/`,
    };
    const cover = coverPath(dirName, e.name, meta.cover);
    if (cover) item.cover = cover;
    const added = gitAdded(dir);
    if (added) item.added = added;
    items.push(item);
  }
  const addedOf = (p) => (p.added === undefined ? Infinity : p.added);
  items.sort((a, b) =>
    a.date < b.date ? 1 : a.date > b.date ? -1 :
    (addedOf(b) - addedOf(a)) || a.title.localeCompare(b.title, 'pt-BR'));
  return items;
}

let stale = 0;
for (const cat of loadCategories()) {
  const rel = `${cat.dir}/${cat.dir}.json`;
  if (LIST) { console.log(rel); continue; }
  const out = join(ROOT, rel);
  const items = buildCategory(cat.dir);
  const json = JSON.stringify(items, null, 2) + '\n';
  const current = existsSync(out) ? readFileSync(out, 'utf8') : null;
  if (CHECK) {
    if (current !== json) { console.error(`✗ ${rel} está desatualizado. Rode: node scripts/build-manifests.mjs`); stale++; }
    else console.log(`✓ ${rel} em dia (${items.length} item(ns)).`);
  } else if (current === json) {
    console.log(`= ${rel}: nada mudou (${items.length} item(ns)).`);
  } else {
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, json);
    console.log(`✓ ${rel} gerado com ${items.length} item(ns).`);
  }
}
if (stale) process.exit(1);
