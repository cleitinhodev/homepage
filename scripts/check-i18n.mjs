#!/usr/bin/env node
// Confere se todos os arquivos assets/i18n/<código>.json têm exatamente as
// mesmas chaves e os mesmos {placeholders} do pt-BR.json (o idioma base).
// Uso: node scripts/check-i18n.mjs   (sai com código 1 se algo estiver faltando)
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'i18n');
const BASE = 'pt-BR';
const load = (c) => JSON.parse(readFileSync(join(dir, c + '.json'), 'utf8'));
const vars = (s) => [...String(s).matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',');

const base = load(BASE);
const keys = Object.keys(base);
let bad = 0;
const codes = readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5)).sort();
for (const code of codes) {
  const d = load(code);
  const missing = keys.filter((k) => !(k in d));
  const extra = Object.keys(d).filter((k) => !(k in base));
  const empty = Object.keys(d).filter((k) => typeof d[k] !== 'string' || !d[k].trim());
  const ph = keys.filter((k) => k in d && vars(d[k]) !== vars(base[k]));
  const ok = !missing.length && !extra.length && !empty.length && !ph.length;
  if (!ok) bad++;
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${code.padEnd(6)} ${Object.keys(d).length}/${keys.length} chaves` +
    (missing.length ? ` | faltando: ${missing.join(', ')}` : '') +
    (extra.length ? ` | sobrando: ${extra.join(', ')}` : '') +
    (empty.length ? ` | vazias: ${empty.join(', ')}` : '') +
    (ph.length ? ` | placeholders diferentes: ${ph.join(', ')}` : ''));
}
console.log(`\n${codes.length} idiomas, ${keys.length} chaves cada, ${bad} com problema.`);
process.exit(bad ? 1 : 0);
