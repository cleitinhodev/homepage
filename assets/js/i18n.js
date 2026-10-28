/* CLEITINHO.DEV — idiomas do site principal (i18n)
   ------------------------------------------------------------------
   • Textos ficam em assets/i18n/<código>.json (chave → texto). O pt-BR.json é a base:
     chave que faltar em outro idioma cai no pt-BR e, se nem lá existir, no texto do HTML.
   • Ordem de escolha do idioma: ?lang=xx na URL → escolha salva (localStorage)
     → idioma do navegador (navigator.languages) → en (se o navegador pedir um idioma
     que o site não tem) → pt-BR.
   • No HTML: data-i18n="chave" (texto), data-i18n-html="chave" (HTML com {variáveis}),
     data-i18n-attr="aria-label:chave; placeholder:chave2".
   • API: window.I18N.t(chave, {vars}, fallback), .lang, .dir, .langs, .ready (Promise),
     .setLang(código), .onChange(fn), .pick(mapa) — e o evento 'i18n:change' no document.
   Para adicionar um idioma: crie assets/i18n/<código>.json com TODAS as chaves do
   pt-BR.json (confira com `node scripts/check-i18n.mjs`) e acrescente uma linha em LANGS. */
(function () {
  'use strict';

  var BASE = 'pt-BR';
  var STORE = 'cleitinhodev.lang';
  var DIR = 'assets/i18n/';
  /* code: arquivo/atributo lang · name: nome nativo · short: etiqueta do botão · font: fonte extra do Google Fonts */
  var LANGS = [
    { code: 'pt-BR', short: 'PT', name: 'Português (Brasil)' },
    { code: 'en',    short: 'EN', name: 'English' },
    { code: 'es',    short: 'ES', name: 'Español' },
    { code: 'zh-CN', short: '中文', name: '简体中文', font: 'Noto+Sans+SC:wght@400;700' },
    { code: 'hi',    short: 'HI', name: 'हिन्दी', font: 'Noto+Sans+Devanagari:wght@400;700' },
    { code: 'ar',    short: 'AR', name: 'العربية', dir: 'rtl', font: 'Noto+Kufi+Arabic:wght@400;700' },
    { code: 'fr',    short: 'FR', name: 'Français' },
    { code: 'ru',    short: 'RU', name: 'Русский' },
    { code: 'bn',    short: 'BN', name: 'বাংলা', font: 'Noto+Sans+Bengali:wght@400;700' },
    { code: 'ja',    short: 'JA', name: '日本語', font: 'DotGothic16' },
    { code: 'de',    short: 'DE', name: 'Deutsch' },
    { code: 'id',    short: 'ID', name: 'Bahasa Indonesia' },
    { code: 'ko',    short: 'KO', name: '한국어', font: 'Noto+Sans+KR:wght@400;700' },
    { code: 'tr',    short: 'TR', name: 'Türkçe' },
    { code: 'it',    short: 'IT', name: 'Italiano' }
  ];
  var byCode = {};
  LANGS.forEach(function (l) { byCode[l.code.toLowerCase()] = l; });

  /* "pt_br", "PT", "zh-Hans-CN", "en-US" → código suportado (ou null) */
  function match(raw) {
    if (!raw) return null;
    var c = String(raw).trim().replace(/_/g, '-').toLowerCase();
    if (byCode[c]) return byCode[c].code;
    var base = c.split('-')[0];
    if (base === 'pt') return 'pt-BR';
    if (base === 'zh') return 'zh-CN';
    return byCode[base] ? byCode[base].code : null;
  }
  function lsGet() { try { return localStorage.getItem(STORE); } catch (e) { return null; } }
  function lsSet(v) { try { localStorage.setItem(STORE, v); } catch (e) { /* modo privado */ } }
  function urlLang() { try { return new URLSearchParams(location.search).get('lang'); } catch (e) { return null; } }

  function detect() {
    var fromUrl = match(urlLang());
    if (fromUrl) return fromUrl;
    var saved = match(lsGet());
    if (saved) return saved;
    var nav = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language];
    for (var i = 0; i < nav.length; i++) { var m = match(nav[i]); if (m) return m; }
    return nav[0] ? 'en' : BASE; // navegador pediu um idioma que não temos → inglês
  }

  var lang = detect();
  var dicts = {};            // código → objeto já carregado
  var listeners = [];
  var root = document.documentElement;

  function meta(code) { return byCode[code.toLowerCase()] || byCode[BASE.toLowerCase()]; }
  function setRootAttrs() {
    var m = meta(lang);
    root.lang = m.code;
    root.dir = m.dir || 'ltr';
    if (m.font && !document.getElementById('font-' + m.code)) {
      var link = document.createElement('link');
      link.rel = 'stylesheet'; link.id = 'font-' + m.code;
      link.href = 'https://fonts.googleapis.com/css2?family=' + m.font + '&display=swap';
      document.head.appendChild(link);
    }
  }
  setRootAttrs(); // já define lang/dir antes do primeiro desenho

  function fetchDict(code) {
    if (dicts[code]) return Promise.resolve(dicts[code]);
    if (location.protocol === 'file:') return Promise.resolve(dicts[code] = {});
    return fetch(DIR + code + '.json', { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function (d) { return (dicts[code] = d && typeof d === 'object' ? d : {}); }, function (err) {
      if (window.console) console.warn('[i18n] não consegui ler', code, err);
      return (dicts[code] = {});
    });
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function raw(key) {
    var d = dicts[lang], b = dicts[BASE];
    if (d && typeof d[key] === 'string') return d[key];
    if (b && typeof b[key] === 'string') return b[key];
    return null;
  }
  function has(key) { return raw(key) != null; }
  /* t(chave, {n: 3}, 'texto padrão') → texto puro com {variáveis} trocadas */
  function t(key, vars, fallback) {
    var s = raw(key);
    if (s == null) s = fallback != null ? String(fallback) : key;
    return !vars ? s : s.replace(/\{(\w+)\}/g, function (m, k) { return k in vars ? String(vars[k]) : m; });
  }
  /* html(chave, {dirs: '<code>..</code>'}) → texto ESCAPADO + variáveis já em HTML */
  function html(key, vars, fallback) {
    var s = raw(key);
    if (s == null) s = fallback != null ? String(fallback) : key;
    var out = '', re = /\{(\w+)\}/g, last = 0, m;
    while ((m = re.exec(s))) {
      out += esc(s.slice(last, m.index)) + (vars && m[1] in vars ? String(vars[m[1]]) : esc(m[0]));
      last = re.lastIndex;
    }
    return out + esc(s.slice(last));
  }
  /* pick({en: {...}, es: {...}}) → entrada que casa com o idioma atual (exato → sem diferenciar
     maiúsculas/_ → idioma base, ex.: "pt" ou "es-MX" → "es") */
  function pick(map) {
    if (!map || typeof map !== 'object') return null;
    var want = lang.toLowerCase(), base = want.split('-')[0], keys = Object.keys(map), i, k;
    for (i = 0; i < keys.length; i++) { k = keys[i].replace(/_/g, '-').toLowerCase(); if (k === want) return map[keys[i]]; }
    for (i = 0; i < keys.length; i++) { k = keys[i].replace(/_/g, '-').toLowerCase(); if (k.split('-')[0] === base) return map[keys[i]]; }
    return null;
  }

  /* Aplica data-i18n* em um pedaço do DOM. Guarda o texto original (pt-BR do HTML) como reserva. */
  function apply(scope) {
    scope = scope || document;
    Array.prototype.forEach.call(scope.querySelectorAll('[data-i18n]'), function (el) {
      if (!('i18nDefault' in el.dataset)) el.dataset.i18nDefault = el.textContent;
      el.textContent = t(el.dataset.i18n, null, el.dataset.i18nDefault);
    });
    Array.prototype.forEach.call(scope.querySelectorAll('[data-i18n-html]'), function (el) {
      if (!el._i18nVars) { // filhos com data-i18n-var="nome" viram variáveis {nome}
        el._i18nVars = {};
        Array.prototype.forEach.call(el.querySelectorAll('[data-i18n-var]'), function (v) { el._i18nVars[v.dataset.i18nVar] = v; });
        el._i18nDefault = el.innerHTML;
      }
      var vars = {};
      Object.keys(el._i18nVars).forEach(function (k) {
        var node = el._i18nVars[k];
        apply(node);
        vars[k] = node.outerHTML;
      });
      el.innerHTML = has(el.dataset.i18nHtml) ? html(el.dataset.i18nHtml, vars) : el._i18nDefault;
      Object.keys(el._i18nVars).forEach(function (k) { // reaproveita os nós (mantém listeners)
        var fresh = el.querySelector('[data-i18n-var="' + k + '"]');
        if (fresh) fresh.replaceWith(el._i18nVars[k]);
      });
    });
    Array.prototype.forEach.call(scope.querySelectorAll('[data-i18n-attr]'), function (el) {
      el.dataset.i18nAttr.split(';').forEach(function (pair) {
        var p = pair.split(':'), attr = (p[0] || '').trim(), key = (p[1] || '').trim();
        if (!attr || !key) return;
        var store = 'i18nDef' + attr.replace(/[^a-z]/gi, '');
        if (!(store in el.dataset)) el.dataset[store] = el.getAttribute(attr) || '';
        el.setAttribute(attr, t(key, null, el.dataset[store]));
      });
    });
  }

  function emit() {
    listeners.forEach(function (fn) { try { fn(lang); } catch (e) { if (window.console) console.error(e); } });
    document.dispatchEvent(new CustomEvent('i18n:change', { detail: { lang: lang } }));
  }
  function applyAll() {
    setRootAttrs();
    apply(document);
    var desc = document.querySelector('meta[name="description"]');
    if (desc && has('meta.description')) desc.setAttribute('content', t('meta.description'));
    updatePicker();
  }

  var ready = Promise.all([fetchDict(BASE), lang === BASE ? null : fetchDict(lang)]).then(function () {
    applyAll();
    emit();
    return lang;
  });

  function setLang(code, opts) {
    var next = match(code);
    if (!next) return Promise.resolve(lang);
    if (!opts || opts.persist !== false) lsSet(next);
    try { // se a URL tinha ?lang=, troca para o novo (senão o reload voltaria ao antigo)
      var u = new URL(location.href);
      if (u.searchParams.has('lang')) { u.searchParams.set('lang', next); history.replaceState(history.state, '', u.toString()); }
    } catch (e) { /* URL antiga */ }
    return fetchDict(next).then(function () {
      lang = next;
      api.lang = lang; api.dir = meta(lang).dir || 'ltr';
      applyAll();
      emit();
      return lang;
    });
  }

  /* ================= Seletor de idioma (botão + lista) ================= */
  var picker, btn, listEl;
  function buildPicker() {
    picker = document.querySelector('.lang-picker');
    if (!picker) return;
    btn = picker.querySelector('.lang-btn');
    listEl = picker.querySelector('.lang-list');
    listEl.innerHTML = LANGS.map(function (l, i) {
      return '<li role="option" id="lang-opt-' + i + '" class="lang-opt" data-code="' + l.code + '" lang="' + l.code + '" dir="' + (l.dir || 'ltr') + '" aria-selected="false">' +
        '<span class="lang-code" lang="' + l.code + '">' + esc(l.short) + '</span><span class="lang-name">' + esc(l.name) + '</span></li>';
    }).join('');
    btn.addEventListener('click', function () { isOpen() ? close(true) : open(); });
    btn.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); open(); }
    });
    listEl.addEventListener('click', function (e) {
      var li = e.target.closest('.lang-opt');
      if (li) choose(li.dataset.code);
    });
    listEl.addEventListener('mousemove', function (e) {
      var li = e.target.closest('.lang-opt');
      if (li) focusOpt(opts().indexOf(li));
    });
    var typed = '', typedAt = 0;
    listEl.addEventListener('keydown', function (e) {
      var o = opts(), i = o.indexOf(listEl.querySelector('.is-focus'));
      if (e.key === 'ArrowDown') i = Math.min(o.length - 1, i + 1);
      else if (e.key === 'ArrowUp') i = Math.max(0, i - 1);
      else if (e.key === 'Home') i = 0;
      else if (e.key === 'End') i = o.length - 1;
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); if (o[i]) choose(o[i].dataset.code); return; }
      else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(true); return; }
      else if (e.key === 'Tab') { close(false); return; }
      else if (e.key.length === 1 && /\S/.test(e.key)) { // digitar pula para o idioma (código ou nome); letras seguidas em até 700ms somam
        var now = Date.now();
        typed = (now - typedAt < 700 ? typed : '') + e.key.toLowerCase(); typedAt = now;
        var starts = function (li, q) { return li.dataset.code.toLowerCase().indexOf(q) === 0 || (li.querySelector('.lang-name').textContent || '').toLowerCase().indexOf(q) === 0; };
        var from = typed.length > 1 ? i : i + 1, hit = -1;
        for (var k = 0; k < o.length && hit < 0; k++) { var j = (from + k + o.length) % o.length; if (starts(o[j], typed)) hit = j; }
        if (hit < 0 && typed.length > 1) { typed = e.key.toLowerCase(); for (k = 1; k <= o.length && hit < 0; k++) { j = (i + k) % o.length; if (starts(o[j], typed)) hit = j; } }
        if (hit >= 0) i = hit;
      } else return;
      e.preventDefault(); e.stopPropagation();
      focusOpt(i);
    });
    document.addEventListener('pointerdown', function (e) { if (isOpen() && !picker.contains(e.target)) close(false); });
    updatePicker();
  }
  function opts() { return Array.prototype.slice.call(listEl.querySelectorAll('.lang-opt')); }
  function isOpen() { return btn && btn.getAttribute('aria-expanded') === 'true'; }
  function focusOpt(i) {
    var o = opts();
    if (!o[i]) return;
    o.forEach(function (li, k) { li.classList.toggle('is-focus', k === i); });
    listEl.setAttribute('aria-activedescendant', o[i].id);
    if (o[i].scrollIntoView) o[i].scrollIntoView({ block: 'nearest' });
  }
  function open() {
    if (!btn) return;
    btn.setAttribute('aria-expanded', 'true');
    listEl.hidden = false;
    picker.classList.add('is-open');
    var cur = opts().map(function (li) { return li.dataset.code; }).indexOf(lang);
    focusOpt(cur < 0 ? 0 : cur);
    listEl.focus({ preventScroll: true });
    document.dispatchEvent(new CustomEvent('langpicker:open'));
  }
  function close(refocus) {
    if (!btn) return;
    btn.setAttribute('aria-expanded', 'false');
    listEl.hidden = true;
    picker.classList.remove('is-open');
    if (refocus) btn.focus({ preventScroll: true });
  }
  function choose(code) { close(true); setLang(code); }
  function updatePicker() {
    if (!btn) return;
    var m = meta(lang);
    btn.querySelector('.lang-code').textContent = m.short;
    btn.querySelector('.lang-code').setAttribute('lang', m.code);
    btn.querySelector('.lang-name').textContent = m.name;
    btn.querySelector('.lang-name').setAttribute('lang', m.code);
    btn.setAttribute('aria-label', t('lang.button', { name: m.name }, 'Idioma: ' + m.name));
    btn.title = t('lang.label', null, 'Idioma');
    listEl.setAttribute('aria-label', t('lang.label', null, 'Idioma'));
    opts().forEach(function (li) { li.setAttribute('aria-selected', String(li.dataset.code === lang)); });
  }

  var api = {
    lang: lang, dir: meta(lang).dir || 'ltr', base: BASE,
    langs: LANGS.map(function (l) { return { code: l.code, name: l.name, short: l.short, dir: l.dir || 'ltr' }; }),
    t: t, html: html, has: has, pick: pick, match: match, apply: apply,
    ready: ready, setLang: setLang,
    onChange: function (fn) { if (typeof fn === 'function') listeners.push(fn); }
  };
  window.I18N = api;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', buildPicker); else buildPicker();
})();
