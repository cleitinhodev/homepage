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
 *  - Se existir <dir>/<pasta>/project.json, usa: title, description, date (AAAA-MM-DD), tags, cover,
 *    i18n ({ "<código>": { title, description } }, traduções repassadas ao site)
 *    e langs (códigos que a página aceita em ?lang=, repassados ao site).
 *  - O que faltar vem do index.html (<title> e <meta name="description">)
 *    e a data vem do último commit git da pasta (ou da data de modificação do arquivo).
 *  - "added" = segundos Unix do primeiro commit da pasta (omitido se ainda não commitada).
 *  - Ordem: "date" mais nova primeiro; empate → "added" mais recente primeiro
 *    (sem "added" = a mais nova); depois, ordem alfabética.
 *
 * Links externos (pasta externos/, veja externos/README.md):
 *  - Cada arquivo externos/<nome>.json vira um item que aponta para um site de fora.
 *    Campos: url (https, obrigatório), category (obrigatório: projects | tools | games | educacao
 *    ou apelidos como "projeto", "tool", "game", "educação"), title (obrigatório), description,
 *    date (AAAA-MM-DD), tags, image (arquivo dentro de externos/ ou URL https), i18n, langs.
 *  - O item entra no manifesto da categoria escolhida com "external": true e a URL absoluta,
 *    seguindo a mesma ordem (date → added → título). "added" = 1º commit do arquivo .json.
 *  - Arquivos que começam com "_" ou "." (ex.: externos/_modelo.json) são ignorados.
 *  - Itens inválidos (sem url, url sem https, categoria errada, sem title, JSON quebrado)
 *    são pulados com um aviso — no GitHub Actions o aviso aparece como "warning" amarelo.
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

// Códigos de idioma: "en", "pt-BR", "pt_BR", "zh-CN"...
const LANG_RE = /^[a-z]{2,3}(?:[-_][A-Za-z0-9]{2,8})*$/;

// "i18n": { "en": { "title": "...", "description": "..." } } → só title/description em texto.
function cleanI18n(raw, where) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return undefined;
  const out = {};
  for (const [code, v] of Object.entries(raw)) {
    if (!LANG_RE.test(code) || !v || typeof v !== 'object') { console.warn(`⚠  ${where}: i18n "${code}" ignorado`); continue; }
    const t = {};
    if (typeof v.title === 'string' && v.title.trim()) t.title = v.title.trim();
    if (typeof v.description === 'string' && v.description.trim()) t.description = v.description.trim();
    if (Object.keys(t).length) out[code] = t;
  }
  return Object.keys(out).length ? out : undefined;
}

/* ================= Links externos (externos/*.json) ================= */
const EXT_DIR = 'externos';
const IN_ACTIONS = !!process.env.GITHUB_ACTIONS;
let extWarnings = 0;

// Aviso legível no terminal + anotação "::warning" no log do GitHub Actions.
function extWarn(file, msg) {
  extWarnings++;
  console.warn(`⚠  ${file}: ${msg} — item ignorado.`);
  if (IN_ACTIONS) console.log(`::warning file=${file},title=Link externo ignorado::${msg.replace(/[\r\n]+/g, ' ')}`);
}

// "Educação" → "educacao", " Tools " → "tools"
const normKey = (s) => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase().replace(/[\s_-]+/g, '');

// apelidos aceitos em "category" (além de dir, id, nome da aba e selo de cada categoria)
const CAT_ALIASES = {
  projects: ['projeto', 'projetos', 'project', 'projects', 'proj', 'tutorial', 'tutoriais'],
  tools: ['tool', 'tools', 'ferramenta', 'ferramentas'],
  games: ['game', 'games', 'jogo', 'jogos'],
  educacao: ['edu', 'educacao', 'educação', 'education', 'estudo', 'estudos', 'aula', 'aulas', 'curso', 'cursos'],
};

function categoryLookup(cats) {
  const map = new Map();
  for (const c of cats) {
    for (const k of [c.dir, c.id, c.tab, c.badge, ...(CAT_ALIASES[c.dir] || [])]) {
      if (k && !map.has(normKey(k))) map.set(normKey(k), c.dir);
    }
  }
  return map;
}

function extImage(image, file) {
  if (image == null || image === '') return undefined;
  if (typeof image !== 'string') { console.warn(`⚠  ${file}: "image" precisa ser texto; sem imagem.`); return undefined; }
  image = image.trim();
  if (/^https:\/\/[^\s"'<>]+$/i.test(image)) return image;
  if (/^[a-z]+:/i.test(image) || image.startsWith('/')) { console.warn(`⚠  ${file}: "image" deve ser um arquivo dentro de externos/ ou uma URL https; sem imagem.`); return undefined; }
  const p = posix.normalize(posix.join(EXT_DIR, image));
  if (!p.startsWith(`${EXT_DIR}/`)) { console.warn(`⚠  ${file}: "image" saiu da pasta externos/; sem imagem.`); return undefined; }
  if (!existsSync(join(ROOT, p))) { console.warn(`⚠  ${file}: imagem "${p}" não encontrada; sem imagem.`); return undefined; }
  return p;
}

// Lê externos/*.json → Map(dir da categoria → [itens])
function buildExternals(cats) {
  const byCat = new Map(cats.map((c) => [c.dir, []]));
  const base = join(ROOT, EXT_DIR);
  if (!existsSync(base)) return byCat;
  const lookup = categoryLookup(cats);
  const valid = cats.map((c) => c.dir).join(', ');
  let ok = 0;
  for (const e of readdirSync(base, { withFileTypes: true })) {
    if (!e.isFile() || !e.name.toLowerCase().endsWith('.json') || e.name.startsWith('_') || e.name.startsWith('.')) continue;
    const file = `${EXT_DIR}/${e.name}`;
    const slug = e.name.slice(0, -5);
    if (!/^[A-Za-z0-9][\w.-]*$/.test(slug)) { extWarn(file, 'nome de arquivo inválido: use só letras, números, - _ . (ex.: meu-link.json)'); continue; }
    let meta;
    try { meta = JSON.parse(readFileSync(join(base, e.name), 'utf8')); }
    catch (err) { extWarn(file, `JSON inválido (${err.message}). Confira vírgulas e aspas.`); continue; }
    if (!meta || typeof meta !== 'object' || Array.isArray(meta)) { extWarn(file, 'o arquivo precisa ser um objeto { ... }'); continue; }

    const rawUrl = typeof meta.url === 'string' ? meta.url.trim() : '';
    if (!rawUrl) { extWarn(file, 'falta o campo "url" (o link externo, começando com https://)'); continue; }
    let url;
    try { url = new URL(rawUrl); } catch { url = null; }
    if (!url || url.protocol !== 'https:' || /[\s"'<>]/.test(rawUrl)) { extWarn(file, `"url" inválida: "${rawUrl}". Use um endereço completo começando com https://`); continue; }

    if (meta.category == null || String(meta.category).trim() === '') { extWarn(file, `falta o campo "category" (use: ${valid})`); continue; }
    const dir = lookup.get(normKey(meta.category));
    if (!dir) { extWarn(file, `categoria "${meta.category}" não existe (use: ${valid})`); continue; }

    const title = typeof meta.title === 'string' ? meta.title.trim() : '';
    if (!title) { extWarn(file, 'falta o campo "title" (o nome que aparece no site)'); continue; }

    let date = String(meta.date || '').trim();
    if (!DATE_RE.test(date)) {
      if (date) console.warn(`⚠  ${file}: "date" deve ser AAAA-MM-DD (veio "${date}"); usando a data do commit.`);
      date = gitDate(join(base, e.name)) || mtimeDate(base);
    }
    const item = {
      slug,
      title,
      description: String(meta.description || '').trim(),
      date,
      tags: Array.isArray(meta.tags) ? meta.tags.map((t) => String(t).trim()).filter(Boolean) : [],
      url: url.href,
      external: true,
    };
    const cover = extImage(meta.image ?? meta.cover, file);
    if (cover) item.cover = cover;
    const i18n = cleanI18n(meta.i18n, file);
    if (i18n) item.i18n = i18n;
    const langs = Array.isArray(meta.langs) ? [...new Set(meta.langs.map(String).filter((c) => LANG_RE.test(c)))] : [];
    if (langs.length) item.langs = langs;
    const added = gitAdded(join(base, e.name));
    if (added) item.added = added;
    byCat.get(dir).push(item);
    ok++;
  }
  console.log(`↗ ${EXT_DIR}/: ${ok} link(s) externo(s) válido(s)${extWarnings ? `, ${extWarnings} ignorado(s) (veja os avisos acima)` : ''}.`);
  return byCat;
}

function buildCategory(dirName, extra = []) {
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
    const i18n = cleanI18n(meta.i18n, `${dirName}/${e.name}`);
    if (i18n) item.i18n = i18n;
    const langs = Array.isArray(meta.langs) ? [...new Set(meta.langs.map(String).filter((c) => LANG_RE.test(c)))] : [];
    if (langs.length) item.langs = langs;
    const added = gitAdded(dir);
    if (added) item.added = added;
    items.push(item);
  }
  items.push(...extra);
  const addedOf = (p) => (p.added === undefined ? Infinity : p.added);
  items.sort((a, b) =>
    a.date < b.date ? 1 : a.date > b.date ? -1 :
    (addedOf(b) - addedOf(a)) || a.title.localeCompare(b.title, 'pt-BR'));
  return items;
}

let stale = 0;
const CATS = loadCategories();
const EXTERNALS = LIST ? new Map() : buildExternals(CATS);
for (const cat of CATS) {
  const rel = `${cat.dir}/${cat.dir}.json`;
  if (LIST) { console.log(rel); continue; }
  const out = join(ROOT, rel);
  const items = buildCategory(cat.dir, EXTERNALS.get(cat.dir));
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
