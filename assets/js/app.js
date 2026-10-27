/* CLEITINHO.DEV — navegação, tela CRT com as últimas adições e uma aba por categoria */
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
  function formatDate(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
    return m ? m[3] + '/' + m[2] + '/' + m[1] : '??/??/????';
  }
  function isNew(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
    if (!m) return false;
    var d = new Date(+m[1], +m[2] - 1, +m[3]);
    return (Date.now() - d.getTime()) / 864e5 <= NEW_DAYS;
  }
  function safeCover(c, cat) {
    if (typeof c !== 'string' || !c) return '';
    if (/^https:\/\/[^\s"']+$/.test(c)) return c;
    return c.indexOf(cat.dir + '/') === 0 && !/:|\.\.\//.test(c) ? c : '';
  }
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
      return p && typeof p.slug === 'string' && /^[A-Za-z0-9][\w.-]*$/.test(p.slug);
    }).map(function (p, i) {
      return {
        slug: p.slug,
        title: String(p.title || p.slug),
        description: String(p.description || ''),
        date: String(p.date || ''),
        added: typeof p.added === 'number' && isFinite(p.added) ? p.added : null,
        tags: Array.isArray(p.tags) ? p.tags.map(String).slice(0, 8) : [],
        cover: safeCover(p.cover, cat),
        url: cat.dir + '/' + encodeURIComponent(p.slug) + '/',  // sempre a pasta da categoria certa
        cat: cat, _i: i
      };
    }).sort(byNewest);
  }
  function badgeHtml(cat) {
    return '<span class="cat-badge accent-' + cat.accent + '">' + esc(cat.badge) + '</span>';
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
      navList.insertBefore(li, linksLi);

      var sec = document.createElement('section');
      sec.className = 'panel cat-panel accent-' + cat.accent;
      sec.id = cat.id;
      sec.hidden = true;
      sec.dataset.title = cat.tab;
      sec.setAttribute('aria-labelledby', 't-' + cat.id);
      sec.innerHTML =
        '<h2 id="t-' + cat.id + '" class="section-title"><span class="title-ico" aria-hidden="true">' + esc(cat.icon) + '</span> ' + esc(cat.tab) + '</h2>' +
        '<p class="lead">' + esc(cat.lead) + '</p>' +
        '<div class="filter-row">' +
          '<label for="filtro-' + cat.id + '" class="sr-only">Filtrar ' + esc(cat.tab) + '</label>' +
          '<input id="filtro-' + cat.id + '" class="pixel-input" type="search" placeholder="&gt; buscar por nome ou tag_" autocomplete="off">' +
          '<p class="count" id="contador-' + cat.id + '" aria-live="polite"></p>' +
        '</div>' +
        '<div class="cards" id="lista-' + cat.id + '"></div>';
      anchor.parentNode.insertBefore(sec, anchor.nextSibling);
      anchor = sec;
      cat.els = { input: sec.querySelector('input'), count: sec.querySelector('.count'), box: sec.querySelector('.cards') };
      cat.els.input.addEventListener('input', function () { renderCards(cat); });
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
    document.title = (panel.dataset.title || 'Início') + ' — CLEITINHO.DEV';
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
  function openMenu() { nav.classList.add('is-open'); toggle.setAttribute('aria-expanded', 'true'); toggle.querySelector('.sr-only').textContent = 'Fechar menu'; }
  function closeMenu() { nav.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); toggle.querySelector('.sr-only').textContent = 'Abrir menu'; }
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
        '<h3>NENHUM CARTUCHO AINDA...</h3>' +
        '<p class="insert-coin">INSERT COIN</p>' +
        '<p>O fliperama está vazio. Assim que algo for adicionado em ' +
          CATS.map(function (c) { return '<code>' + esc(c.dir) + '/</code>'; }).join(', ') + ', aparece aqui.</p>' +
      '</div>'
    );
  }
  function renderError(isFile) {
    state = 'error';
    setControls(false);
    swapScreen(
      '<div class="empty error">' +
        '<h3>ERRO 404: CARTUCHO NÃO LIDO</h3>' +
        '<p class="insert-coin">GAME OVER</p>' +
        '<p>' + (isFile
          ? 'Abrindo via file:// o navegador bloqueia o fetch. Rode <code>python3 -m http.server</code> na pasta do site e acesse <code>http://localhost:8000</code>.'
          : 'Não consegui carregar os manifestos (' + CATS.map(function (c) { return '<code>' + esc(c.manifest) + '</code>'; }).join(', ') + '). Recarregue a página para tentar de novo.') + '</p>' +
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
        '<div class="screen-head"><span>► ÚLTIMAS ADIÇÕES</span><span>' + String(projects.length).padStart(2, '0') + ' CARTUCHO(S)</span></div>' +
        '<ul class="screen-list" id="screen-list" role="listbox" tabindex="0" aria-label="Últimas adições — use as setas para escolher">' +
        items.map(function (p, i) {
          return '<li class="screen-item" role="option" id="opt-' + i + '" data-index="' + i + '" aria-selected="' + (i === selected) + '">' +
            badgeHtml(p.cat) + esc(p.title) + (isNew(p.date) ? '<span class="new">NOVO</span>' : '') + '</li>';
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
    var p = projects[selected];
    var pv = document.getElementById('preview');
    pv.innerHTML =
      '<div class="preview-cover">' + (p.cover ? '<img src="' + esc(p.cover) + '" alt="" loading="lazy">' : '<span aria-hidden="true">' + esc(p.cat.icon) + '</span>') + '</div>' +
      '<h3>' + esc(p.title) + '</h3>' +
      '<p class="meta">' + badgeHtml(p.cat) + ' 📅 ' + formatDate(p.date) + '</p>' +
      (p.description ? '<p class="desc">' + esc(p.description) + '</p>' : '') +
      tagsHtml(p.tags) +
      '<a class="btn btn-primary btn-small" href="' + esc(p.url) + '"><span class="btn-label">' + esc(p.cat.open) + '</span></a>';
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
    if (state === 'list' && p) location.href = p.url;
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
      return (p.title + ' ' + p.description + ' ' + p.tags.join(' ')).toLowerCase().indexOf(q) >= 0;
    });
    els.count.textContent = items.length + ' de ' + all.length + ' ' + cat.noun;
    if (!items.length) {
      els.box.innerHTML = cat.failed
        ? '<div class="cards-empty"><strong>GAME OVER</strong>Não consegui carregar <code>' + esc(cat.manifest) + '</code>. Recarregue a página.</div>'
        : all.length
          ? '<div class="cards-empty"><strong>' + esc(cat.empty.coin) + '</strong>Nada combina com a busca.</div>'
          : '<div class="cards-empty cat-empty">' +
              '<span class="cat-empty-ico" aria-hidden="true">' + esc(cat.icon) + '</span>' +
              '<span class="cat-empty-title">' + esc(cat.empty.title) + '</span>' +
              '<strong>' + esc(cat.empty.coin) + '</strong>' + esc(cat.empty.text) + '</div>';
      return;
    }
    var arts = ['art-1', 'art-2', 'art-3'];
    els.box.innerHTML = items.map(function (p, i) {
      return '<article class="card">' +
        '<div class="card-art ' + arts[i % 3] + '" aria-hidden="true">' + (p.cover ? '<img src="' + esc(p.cover) + '" alt="" loading="lazy">' : esc(cat.icon)) + '</div>' +
        '<h3>' + esc(p.title) + '</h3>' +
        '<p class="meta">📅 ' + formatDate(p.date) + '</p>' +
        '<p>' + esc(p.description) + '</p>' +
        tagsHtml(p.tags) +
        '<a class="btn btn-small" href="' + esc(p.url) + '"><span class="btn-label">' + esc(cat.open) + '</span></a>' +
      '</article>';
    }).join('');
  }

  /* Capa que não carregou → volta para o ícone */
  document.addEventListener('error', function (e) {
    var img = e.target;
    if (img && img.tagName === 'IMG' && img.closest('.preview-cover, .card-art')) {
      var span = document.createElement('span');
      span.setAttribute('aria-hidden', 'true');
      span.textContent = '🕹️';
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

  setControls(false);
  route(false);
  load();
})();
