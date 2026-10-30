/* CLEITINHO.DEV — navegação, tela CRT com as últimas adições e uma aba por categoria.
   Textos vêm do window.I18N (assets/js/i18n.js + assets/i18n/<idioma>.json); os textos
   em português escritos aqui e em categories.js são só a reserva caso falte uma chave. */
(function () {
  'use strict';

  var SCREEN_MAX = 8;                       // quantos itens aparecem na tela inicial (todas as categorias juntas)
  var NEW_DAYS = 14;                        // até quantos dias um item ganha o selo "NOVO"

  /* Categorias (Projetos, Tools, Games...) vêm de assets/js/categories.js.
     Cada uma vira uma aba (antes de "Links") e lê <dir>/<dir>.json — caminhos relativos. */
  var ACCENTS = ['red', 'violet', 'pink'];
  var CATS = (window.SITE_CATEGORIES || []).filter(function (c) {
    return c && /^[a-z0-9][\w-]*$/i.test(c.id || '') && /^[a-z0-9][\w-]*$/i.test(c.dir || '');
  }).map(function (c, i) {
    var empty = c.empty || {};
    return {
      id: c.id, dir: c.dir, order: i,
      manifest: c.dir + '/' + c.dir + '.json',
      tab: String(c.tab || c.id), badge: String(c.badge || c.id).toUpperCase(),
      icon: String(c.icon || '🕹️'), accent: ACCENTS.indexOf(c.accent) >= 0 ? c.accent : ACCENTS[i % 3],
      noun: String(c.noun || 'item(ns)'), lead: String(c.lead || ''),
      empty: { title: String(empty.title || 'NADA AQUI AINDA...'), coin: String(empty.coin || 'INSERT COIN'), text: String(empty.text || '') },
      open: String(c.open || '▶ Abrir'),
      items: [], failed: false, els: null
    };
  });

  /* ================= Idioma ================= */
  var I18N = window.I18N || {
    lang: 'pt-BR', ready: Promise.resolve('pt-BR'), onChange: function () {}, apply: function () {}, pick: function () { return null; },
    t: function (k, v, f) { var s = f != null ? String(f) : k; return v ? s.replace(/\{(\w+)\}/g, function (m, x) { return x in v ? v[x] : m; }) : s; },
    html: null
  };
  function t(key, vars, fallback) { return I18N.t(key, vars, fallback); }
  /* texto com {variáveis} em HTML: escapa o texto e insere as variáveis como estão */
  function th(key, vars, fallback) {
    if (I18N.html) return I18N.html(key, vars, fallback);
    var s = esc(t(key, null, fallback));
    return s.replace(/\{(\w+)\}/g, function (m, k) { return vars && k in vars ? vars[k] : m; });
  }
  /* textos de uma categoria: chave cat.<id>.<campo> nos JSON, senão o que está em categories.js */
  function ct(cat, field) {
    var def = { tab: cat.tab, badge: cat.badge, noun: cat.noun, lead: cat.lead, open: cat.open,
      emptyTitle: cat.empty.title, emptyCoin: cat.empty.coin, emptyText: cat.empty.text }[field];
    return t('cat.' + cat.id + '.' + field, null, def);
  }
  var dateFmt = null, dateFmtLang = null;
  function formatDate(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
    if (!m) return '??/??/????';
    try {
      if (dateFmtLang !== I18N.lang) {
        dateFmt = new Intl.DateTimeFormat(I18N.lang, { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' });
        dateFmtLang = I18N.lang;
      }
      return dateFmt.format(new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])));
    } catch (e) { return m[3] + '/' + m[2] + '/' + m[1]; }
  }
  /* título/descrição no idioma atual (project.json → "i18n": {"en": {"title", "description"}}) */
  function loc(p) {
    var o = I18N.pick(p.i18n) || {};
    return { title: o.title || p.title, description: o.description || p.description };
  }
  /* link da página: acrescenta ?lang=<código da página> se ela declarar suporte ao idioma atual ("langs") */
  function normCode(c) { return String(c).replace(/_/g, '-').toLowerCase(); }
  function pageLang(p) {
    if (!p.langs.length) return null;
    var want = normCode(I18N.lang), i;
    for (i = 0; i < p.langs.length; i++) if (normCode(p.langs[i]) === want) return p.langs[i];
    for (i = 0; i < p.langs.length; i++) if (normCode(p.langs[i]).split('-')[0] === want) return p.langs[i]; // "en" ↔ "en-US"
    return null;
  }
  function itemUrl(p) {
    var code = pageLang(p);
    if (!code) return p.url;
    if (p.external) { // link externo: só ganha ?lang se o arquivo declarar "langs"
      try { var u = new URL(p.url); u.searchParams.set('lang', code); return u.href; } catch (e) { return p.url; }
    }
    return p.url + '?lang=' + encodeURIComponent(code);
  }
  /* links externos (externos/*.json): abrem em nova aba, sem repassar a página de origem */
  var EXT_ICON = '🔗';
  function linkAttrs(p) { return p.external ? ' target="_blank" rel="noopener noreferrer"' : ''; }
  /* a fonte pixel não tem a seta ↗: ela vai num <span> com fonte de símbolos */
  function arrow(s) { return esc(s).replace(/↗/g, '<span class="ext-arrow" aria-hidden="true">↗</span>'); }
  function extBadge(p) {
    return p.external ? '<span class="ext-badge">' + arrow(t('badge.external', null, '↗ LINK EXTERNO')) + '</span>' : '';
  }
  function openLabel(p) {
    return p.external
      ? arrow(t('ext.open', null, '↗ Visitar site')) + '<span class="sr-only"> ' + esc(t('ext.newTab', null, '(abre em uma nova aba)')) + '</span>'
      : esc(ct(p.cat, 'open'));
  }
  function itemIcon(p) { return p.external ? EXT_ICON : p.cat.icon; }

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var nav = document.querySelector('.main-nav');
  var list = nav.querySelector('.nav-list');
  var indicator = nav.querySelector('.nav-indicator');
  var toggle = document.querySelector('.menu-toggle');
  var main = document.getElementById('conteudo');
  buildCategoryTabs(); // cria as abas antes de listar os painéis
  var panels = Array.prototype.slice.call(document.querySelectorAll('.panel'));
  var screen = document.getElementById('screen');
  var screenInner = screen.querySelector('.screen-inner');
  var controls = document.querySelector('.controls');
  var DEFAULT = 'principal';

  var projects = [];   // últimas adições de TODAS as categorias (mais novo primeiro)
  var selected = 0;    // índice selecionado na tela
  var state = 'boot';  // boot | empty | list | error

  /* ================= Utilitários ================= */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function isNew(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
    if (!m) return false;
    var d = new Date(+m[1], +m[2] - 1, +m[3]);
    return (Date.now() - d.getTime()) / 864e5 <= NEW_DAYS;
  }
  function safeCover(c, cat, external) {
    if (typeof c !== 'string' || !c) return '';
    if (/^https:\/\/[^\s"']+$/.test(c)) return c;
    var dir = external ? 'externos/' : cat.dir + '/';
    return c.indexOf(dir) === 0 && !/:|\.\.\//.test(c) ? c : '';
  }
  var EXT_URL = /^https:\/\/[^\s"'<>]+$/;
  /* mais novo primeiro; mesma data → entrou no repo por último ("added"; sem "added" = agora);
     depois a ordem das categorias e a ordem do manifesto */
  function byNewest(a, b) {
    if (a.date !== b.date) return b.date < a.date ? -1 : 1;
    var x = a.added == null ? Infinity : a.added, y = b.added == null ? Infinity : b.added;
    if (x !== y) return x > y ? -1 : 1;
    return (a.cat.order - b.cat.order) || (a._i - b._i);
  }
  function normalize(raw, cat) {
    if (!Array.isArray(raw)) return [];
    return raw.filter(function (p) {
      return p && typeof p.slug === 'string' && /^[A-Za-z0-9][\w.-]*$/.test(p.slug) &&
        (p.external !== true || (typeof p.url === 'string' && EXT_URL.test(p.url)));
    }).map(function (p, i) {
      var ext = p.external === true;
      return {
        slug: p.slug,
        title: String(p.title || p.slug),
        description: String(p.description || ''),
        date: String(p.date || ''),
        added: typeof p.added === 'number' && isFinite(p.added) ? p.added : null,
        tags: Array.isArray(p.tags) ? p.tags.map(String).slice(0, 8) : [],
        cover: safeCover(p.cover, cat, ext),
        external: ext,
        i18n: cleanI18n(p.i18n),
        langs: Array.isArray(p.langs) ? p.langs.filter(function (c) { return typeof c === 'string' && /^[a-z]{2,3}([-_][a-z0-9]{2,8})*$/i.test(c); }) : [],
        url: ext ? p.url : cat.dir + '/' + encodeURIComponent(p.slug) + '/',  // interno: sempre a pasta da categoria certa
        cat: cat, _i: i
      };
    }).sort(byNewest);
  }
  function cleanI18n(raw) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
    var out = {}, n = 0;
    Object.keys(raw).forEach(function (code) {
      var v = raw[code];
      if (!v || typeof v !== 'object') return;
      var e = {};
      if (typeof v.title === 'string' && v.title.trim()) e.title = v.title;
      if (typeof v.description === 'string' && v.description.trim()) e.description = v.description;
      if (e.title || e.description) { out[code] = e; n++; }
    });
    return n ? out : null;
  }
  function badgeHtml(cat) {
    return '<span class="cat-badge accent-' + cat.accent + '">' + esc(ct(cat, 'badge')) + '</span>';
  }

  /* ================= Abas de categoria (geradas a partir de CATS) ================= */
  function buildCategoryTabs() {
    var navList = document.querySelector('.nav-list');
    var linksLi = navList.querySelector('a[href="#links"]');
    linksLi = linksLi ? linksLi.parentNode : null;
    var anchor = document.getElementById('principal');
    CATS.forEach(function (cat) {
      if (document.getElementById(cat.id)) return; // id já usado: não duplica
      var li = document.createElement('li');
      li.innerHTML = '<a class="btn nav-link accent-' + cat.accent + '" href="#' + cat.id + '"><span class="btn-label">' + esc(cat.tab) + '</span></a>';
      var tabLabel = li.querySelector('.btn-label');
      navList.insertBefore(li, linksLi);

      var sec = document.createElement('section');
      sec.className = 'panel cat-panel accent-' + cat.accent;
      sec.id = cat.id;
      sec.hidden = true;
      sec.dataset.title = cat.tab;
      sec.setAttribute('aria-labelledby', 't-' + cat.id);
      sec.innerHTML =
        '<h2 id="t-' + cat.id + '" class="section-title"><span class="title-ico" aria-hidden="true">' + esc(cat.icon) + '</span> <span class="title-txt">' + esc(cat.tab) + '</span></h2>' +
        '<p class="lead">' + esc(cat.lead) + '</p>' +
        '<div class="filter-row">' +
          '<label for="filtro-' + cat.id + '" class="sr-only">Filtrar ' + esc(cat.tab) + '</label>' +
          '<input id="filtro-' + cat.id + '" class="pixel-input" type="search" placeholder="&gt; buscar por nome ou tag_" autocomplete="off">' +
          '<p class="count" id="contador-' + cat.id + '" aria-live="polite"></p>' +
        '</div>' +
        '<div class="cards" id="lista-' + cat.id + '"></div>';
      anchor.parentNode.insertBefore(sec, anchor.nextSibling);
      anchor = sec;
      cat.els = { input: sec.querySelector('input'), count: sec.querySelector('.count'), box: sec.querySelector('.cards'),
        tab: tabLabel, sec: sec, title: sec.querySelector('.title-txt'), lead: sec.querySelector('.lead'), label: sec.querySelector('label') };
      cat.els.input.addEventListener('input', function () { renderCards(cat); });
    });
  }
  /* (re)escreve os textos fixos das abas de categoria no idioma atual */
  function applyCatTexts() {
    CATS.forEach(function (cat) {
      var e = cat.els;
      if (!e) return;
      var tab = ct(cat, 'tab');
      e.tab.textContent = tab;
      e.title.textContent = tab;
      e.sec.dataset.title = tab;
      e.lead.textContent = ct(cat, 'lead');
      e.label.textContent = t('list.filterLabel', { name: tab }, 'Filtrar ' + tab);
      e.input.placeholder = t('list.search', null, '> buscar por nome ou tag_');
    });
  }
  function tagsHtml(tags) {
    if (!tags.length) return '';
    return '<ul class="tags">' + tags.map(function (t) { return '<li class="tag">' + esc(t) + '</li>'; }).join('') + '</ul>';
  }
  function swapScreen(html) {
    screenInner.innerHTML = html;
    screenInner.classList.remove('fade-in');
    void screenInner.offsetWidth; // reinicia a animação
    screenInner.classList.add('fade-in');
    screen.setAttribute('aria-busy', 'false');
  }
  function setControls(enabled) {
    controls.querySelectorAll('.arcade-btn').forEach(function (b) { b.disabled = !enabled; });
  }

  /* ================= Roteamento por hash ================= */
  function links() { return Array.prototype.slice.call(list.querySelectorAll('.nav-link')); }
  function enabledLinks() { return links().filter(function (l) { return l.getAttribute('aria-disabled') !== 'true'; }); }
  function currentId() {
    var id = decodeURIComponent(location.hash.replace('#', ''));
    if (id === 'sobre') { id = 'links'; history.replaceState(null, '', '#links'); } // aba antiga
    var link = enabledLinks().filter(function (l) { return l.getAttribute('href') === '#' + id; })[0];
    return link ? id : DEFAULT;
  }
  function show(id, moveFocus) {
    panels.forEach(function (p) { p.hidden = p.id !== id; });
    links().forEach(function (l) {
      var active = l.getAttribute('href') === '#' + id;
      l.classList.toggle('is-active', active);
      if (active) l.setAttribute('aria-current', 'page'); else l.removeAttribute('aria-current');
    });
    var panel = document.getElementById(id);
    document.title = (panel.dataset.title || t('page.home', null, 'Início')) + ' — CLEITINHO.DEV';
    placeIndicator();
    closeMenu();
    if (moveFocus) { main.focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' }); }
  }
  function route(moveFocus) { show(currentId(), moveFocus); }
  window.addEventListener('hashchange', function () { route(true); });

  list.addEventListener('click', function (e) {
    var a = e.target.closest('.nav-link');
    if (a && a.getAttribute('aria-disabled') === 'true') e.preventDefault();
  });

  /* ================= Indicador do menu ================= */
  function placeIndicator() {
    var active = list.querySelector('.nav-link.is-active');
    if (!active || getComputedStyle(indicator).display === 'none') return;
    var navBox = nav.getBoundingClientRect();
    var box = active.getBoundingClientRect();
    indicator.style.width = box.width + 'px';
    indicator.style.transform = 'translateX(' + (box.left - navBox.left) + 'px)';
  }
  window.addEventListener('resize', placeIndicator);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeIndicator);
  window.addEventListener('load', placeIndicator);

  /* ================= Ripple em qualquer .btn ================= */
  document.addEventListener('pointerdown', function (e) {
    var btn = e.target.closest('.btn');
    if (!btn || btn.getAttribute('aria-disabled') === 'true' || reduceMotion.matches) return;
    makeRipple(btn, e.clientX, e.clientY);
  });
  document.addEventListener('keydown', function (e) {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('btn')) {
      var r = e.target.getBoundingClientRect();
      if (e.target.getAttribute('aria-disabled') !== 'true' && !reduceMotion.matches) makeRipple(e.target, r.left + r.width / 2, r.top + r.height / 2);
    }
  });
  function makeRipple(btn, x, y) {
    var rect = btn.getBoundingClientRect();
    var size = Math.max(rect.width, rect.height) * 2.4;
    var s = document.createElement('span');
    s.className = 'ripple';
    s.style.width = s.style.height = size + 'px';
    s.style.left = (x - rect.left - size / 2) + 'px';
    s.style.top = (y - rect.top - size / 2) + 'px';
    btn.appendChild(s);
    s.addEventListener('animationend', function () { s.remove(); });
    setTimeout(function () { if (s.parentNode) s.remove(); }, 900);
  }

  /* ================= Menu mobile ================= */
  function menuLabel() { toggle.querySelector('.sr-only').textContent = nav.classList.contains('is-open') ? t('menu.close', null, 'Fechar menu') : t('menu.open', null, 'Abrir menu'); }
  function openMenu() { nav.classList.add('is-open'); toggle.setAttribute('aria-expanded', 'true'); menuLabel(); }
  function closeMenu() { nav.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); menuLabel(); }
  toggle.addEventListener('click', function () { nav.classList.contains('is-open') ? closeMenu() : openMenu(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('is-open')) { closeMenu(); toggle.focus(); } });

  list.addEventListener('keydown', function (e) {
    if (['ArrowRight', 'ArrowLeft', 'Home', 'End'].indexOf(e.key) < 0) return;
    var items = enabledLinks();
    var i = items.indexOf(document.activeElement);
    if (i < 0) return;
    e.preventDefault();
    if (e.key === 'ArrowRight') i = (i + 1) % items.length;
    else if (e.key === 'ArrowLeft') i = (i - 1 + items.length) % items.length;
    else if (e.key === 'Home') i = 0; else i = items.length - 1;
    items[i].focus();
  });

  /* ================= Tela CRT ================= */
  function renderEmpty() {
    state = 'empty';
    setControls(false);
    swapScreen(
      '<div class="empty">' +
        '<div class="coin" aria-hidden="true">¢</div>' +
        '<h3>' + esc(t('screen.emptyTitle', null, 'NENHUM CARTUCHO AINDA...')) + '</h3>' +
        '<p class="insert-coin">INSERT COIN</p>' +
        '<p>' + th('screen.emptyText', { dirs: CATS.map(function (c) { return '<code dir="ltr">' + esc(c.dir) + '/</code>'; }).join(', ') },
          'O fliperama está vazio. Assim que algo for adicionado em {dirs}, aparece aqui.') + '</p>' +
      '</div>'
    );
  }
  var lastIsFile = false;
  function renderError(isFile) {
    lastIsFile = isFile;
    state = 'error';
    setControls(false);
    swapScreen(
      '<div class="empty error">' +
        '<h3>' + esc(t('screen.errorTitle', null, 'ERRO 404: CARTUCHO NÃO LIDO')) + '</h3>' +
        '<p class="insert-coin">GAME OVER</p>' +
        '<p>' + (isFile
          ? th('screen.errorFile', { cmd: '<code dir="ltr">python3 -m http.server</code>', url: '<code dir="ltr">http://localhost:8000</code>' },
              'Abrindo via file:// o navegador bloqueia o fetch. Rode {cmd} na pasta do site e acesse {url}.')
          : th('screen.errorFetch', { files: CATS.map(function (c) { return '<code dir="ltr">' + esc(c.manifest) + '</code>'; }).join(', ') },
              'Não consegui carregar os manifestos ({files}). Recarregue a página para tentar de novo.')) + '</p>' +
      '</div>'
    );
  }
  function renderList() {
    state = 'list';
    setControls(true);
    var items = projects.slice(0, SCREEN_MAX);
    selected = Math.min(selected, items.length - 1);
    var html =
      '<div class="screen-grid">' +
        '<div class="screen-head"><span>' + esc(t('screen.head', null, '► ÚLTIMAS ADIÇÕES')) + '</span><span>' + esc(t('screen.count', { n: String(projects.length).padStart(2, '0') }, '{n} CARTUCHO(S)')) + '</span></div>' +
        '<ul class="screen-list" id="screen-list" role="listbox" tabindex="0" aria-label="' + esc(t('screen.listAria', null, 'Últimas adições — use as setas para escolher')) + '">' +
        items.map(function (p, i) {
          return '<li class="screen-item" role="option" id="opt-' + i + '" data-index="' + i + '" aria-selected="' + (i === selected) + '">' +
            badgeHtml(p.cat) + '<span class="item-title">' + esc(loc(p).title) + '</span>' +
            (p.external ? '<span class="ext-mark" title="' + esc(t('badge.external', null, '↗ LINK EXTERNO')) + '"><span class="ext-arrow" aria-hidden="true">↗</span><span class="sr-only">' + esc(t('badge.external', null, '↗ LINK EXTERNO')) + '</span></span>' : '') +
            (isNew(p.date) ? '<span class="new">' + esc(t('badge.new', null, 'NOVO')) + '</span>' : '') + '</li>';
        }).join('') +
        '</ul>' +
        '<div class="preview" id="preview"></div>' +
      '</div>';
    swapScreen(html);
    var ul = document.getElementById('screen-list');
    ul.addEventListener('click', function (e) {
      var li = e.target.closest('.screen-item');
      if (!li) return;
      var i = +li.dataset.index;
      if (i === selected) openSelected(); else select(i);
    });
    ul.addEventListener('keydown', screenKeys);
    updateSelection(false);
  }
  function updateSelection(animate) {
    var ul = document.getElementById('screen-list');
    if (!ul) return;
    Array.prototype.forEach.call(ul.children, function (li, i) { li.setAttribute('aria-selected', String(i === selected)); });
    ul.setAttribute('aria-activedescendant', 'opt-' + selected);
    var cur = ul.children[selected];
    if (cur && cur.scrollIntoView) cur.scrollIntoView({ block: 'nearest' });
    var p = projects[selected], L = loc(p);
    var pv = document.getElementById('preview');
    pv.innerHTML =
      '<div class="preview-cover' + (p.external ? ' is-external' : '') + '">' + (p.cover ? '<img src="' + esc(p.cover) + '" alt="" loading="lazy">' : '<span aria-hidden="true">' + esc(itemIcon(p)) + '</span>') + '</div>' +
      '<h3>' + esc(L.title) + '</h3>' +
      '<p class="meta">' + badgeHtml(p.cat) + extBadge(p) + ' <span aria-hidden="true">📅</span> <span class="sr-only">' + esc(t('date.label', null, 'Data')) + ': </span><time datetime="' + esc(p.date) + '">' + esc(formatDate(p.date)) + '</time></p>' +
      (L.description ? '<p class="desc">' + esc(L.description) + '</p>' : '') +
      tagsHtml(p.tags) +
      '<a class="btn btn-primary btn-small" href="' + esc(itemUrl(p)) + '"' + linkAttrs(p) + '><span class="btn-label">' + openLabel(p) + '</span></a>';
    if (animate) { pv.classList.remove('swap'); void pv.offsetWidth; pv.classList.add('swap'); }
  }
  function select(i) {
    var n = Math.min(projects.length, SCREEN_MAX);
    if (!n) return;
    selected = (i + n) % n;
    updateSelection(true);
  }
  function openSelected() {
    var p = projects[selected];
    if (state !== 'list' || !p) return;
    if (p.external) window.open(itemUrl(p), '_blank', 'noopener,noreferrer');
    else location.href = itemUrl(p);
  }
  function screenKeys(e) {
    if (state !== 'list') return;
    var handled = true;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') select(selected + 1);
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') select(selected - 1);
    else if (e.key === 'Home') select(0);
    else if (e.key === 'End') select(Math.min(projects.length, SCREEN_MAX) - 1);
    else if (e.key === 'Enter' || e.key === ' ') { pressFx('open'); openSelected(); }
    else handled = false;
    if (handled) e.preventDefault();
  }
  function pressFx(action) {
    var b = controls.querySelector('[data-action="' + action + '"]');
    if (!b) return;
    b.classList.add('is-pressed');
    setTimeout(function () { b.classList.remove('is-pressed'); }, 140);
  }
  controls.addEventListener('click', function (e) {
    var b = e.target.closest('[data-action]');
    if (!b || b.disabled) return;
    var a = b.dataset.action;
    if (a === 'prev') select(selected - 1);
    else if (a === 'next') select(selected + 1);
    else if (a === 'open') openSelected();
  });
  /* Setas também funcionam na Principal quando nada específico está focado */
  document.addEventListener('keydown', function (e) {
    if (currentId() !== 'principal' || state !== 'list') return;
    var t = document.activeElement;
    if (t && t !== document.body && t !== main) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); pressFx(e.key === 'ArrowDown' ? 'next' : 'prev'); select(selected + (e.key === 'ArrowDown' ? 1 : -1)); }
  });

  /* ================= Abas de categoria: cards + busca ================= */
  function renderCards(cat) {
    var all = cat.items, els = cat.els;
    if (!els) return;
    var q = (els.input.value || '').trim().toLowerCase();
    var items = all.filter(function (p) {
      if (!q) return true;
      var L = loc(p);
      return (L.title + ' ' + L.description + ' ' + p.title + ' ' + p.description + ' ' + p.tags.join(' ')).toLowerCase().indexOf(q) >= 0;
    });
    els.count.textContent = t('list.count', { n: items.length, total: all.length, noun: ct(cat, 'noun') }, '{n} de {total} {noun}');
    if (!items.length) {
      els.box.innerHTML = cat.failed
        ? '<div class="cards-empty"><strong>GAME OVER</strong>' + th('list.failed', { file: '<code dir="ltr">' + esc(cat.manifest) + '</code>' }, 'Não consegui carregar {file}. Recarregue a página.') + '</div>'
        : all.length
          ? '<div class="cards-empty"><strong>' + esc(ct(cat, 'emptyCoin')) + '</strong>' + esc(t('list.noMatch', null, 'Nada combina com a busca.')) + '</div>'
          : '<div class="cards-empty cat-empty">' +
              '<span class="cat-empty-ico" aria-hidden="true">' + esc(cat.icon) + '</span>' +
              '<span class="cat-empty-title">' + esc(ct(cat, 'emptyTitle')) + '</span>' +
              '<strong>' + esc(ct(cat, 'emptyCoin')) + '</strong>' + esc(ct(cat, 'emptyText')) + '</div>';
      return;
    }
    var arts = ['art-1', 'art-2', 'art-3'];
    els.box.innerHTML = items.map(function (p, i) {
      var L = loc(p);
      return '<article class="card' + (p.external ? ' is-external' : '') + '">' +
        '<div class="card-art ' + arts[i % 3] + '" aria-hidden="true">' + (p.cover ? '<img src="' + esc(p.cover) + '" alt="" loading="lazy">' : esc(itemIcon(p))) + '</div>' +
        (p.external ? '<p class="card-ext">' + extBadge(p) + '</p>' : '') +
        '<h3>' + esc(L.title) + '</h3>' +
        '<p class="meta"><span aria-hidden="true">📅</span> <span class="sr-only">' + esc(t('date.label', null, 'Data')) + ': </span><time datetime="' + esc(p.date) + '">' + esc(formatDate(p.date)) + '</time></p>' +
        '<p>' + esc(L.description) + '</p>' +
        tagsHtml(p.tags) +
        '<a class="btn btn-small" href="' + esc(itemUrl(p)) + '"' + linkAttrs(p) + '><span class="btn-label">' + openLabel(p) + '</span></a>' +
      '</article>';
    }).join('');
  }

  /* Capa que não carregou → volta para o ícone */
  document.addEventListener('error', function (e) {
    var img = e.target;
    if (img && img.tagName === 'IMG' && img.closest('.preview-cover, .card-art')) {
      var span = document.createElement('span');
      span.setAttribute('aria-hidden', 'true');
      span.textContent = img.closest('.is-external') ? EXT_ICON : '🕹️'; // link externo → ícone 🔗
      img.replaceWith(span);
    }
  }, true);

  /* ================= Carregamento ================= */
  function fetchJson(url) {
    return fetch(url, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
  }
  function load() {
    var bootTime = reduceMotion.matches ? 0 : 2700; // deixa a animação de boot terminar
    var started = Date.now();
    var isFile = location.protocol === 'file:';
    Promise.all(CATS.map(function (cat) {
      if (isFile) { cat.failed = true; return Promise.resolve(); }
      return fetchJson(cat.manifest).then(function (data) {
        cat.items = normalize(data, cat);
      }, function (err) {
        cat.failed = true; // uma categoria com erro não derruba as outras
        if (window.console) console.warn('[CLEITINHO.DEV] falha ao ler', cat.manifest, err);
      });
    })).then(function () {
      projects = [].concat.apply([], CATS.map(function (c) { return c.items; })).sort(byNewest);
      var allFailed = !CATS.length || CATS.every(function (c) { return c.failed; });
      setTimeout(function () {
        if (allFailed) renderError(isFile);
        else if (!projects.length) renderEmpty();
        else renderList();
        CATS.forEach(renderCards);
      }, Math.max(0, bootTime - (Date.now() - started)));
    });
  }

  /* troca de idioma: reescreve tudo o que o app desenhou */
  function relabel() {
    applyCatTexts();
    menuLabel();
    if (state === 'list') renderList();
    else if (state === 'empty') renderEmpty();
    else if (state === 'error') renderError(lastIsFile);
    CATS.forEach(renderCards);
    route(false);
    requestAnimationFrame(placeIndicator);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeIndicator);
  }
  I18N.onChange(relabel);

  /* menu compacto: se as abas não cabem numa linha (idiomas com palavras longas), usa o menu ☰ */
  var header = document.querySelector('.site-header');
  function fitNav() {
    header.classList.remove('is-compact');
    var items = list.querySelectorAll('.nav-link');
    var wraps = items.length && items[items.length - 1].getBoundingClientRect().top - items[0].getBoundingClientRect().top > 4;
    var brand = header.querySelector('.brand').getBoundingClientRect();
    var navBox = nav.getBoundingClientRect();
    var overlap = getComputedStyle(nav).position !== 'absolute' && (document.documentElement.dir === 'rtl' ? navBox.right > brand.left : navBox.left < brand.right);
    if (wraps || overlap) { header.classList.add('is-compact'); }
    else if (nav.classList.contains('is-open')) closeMenu();
    placeIndicator();
  }
  var fitTimer;
  window.addEventListener('resize', function () { clearTimeout(fitTimer); fitTimer = setTimeout(fitNav, 60); });
  I18N.onChange(function () { fitNav(); if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitNav); });

  applyCatTexts();
  setControls(false);
  route(false);
  fitNav();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitNav);
  load();
})();
