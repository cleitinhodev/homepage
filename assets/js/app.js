/* CLEITINHO.DEV — navegação, tela CRT com os últimos projetos e lista completa */
(function () {
  'use strict';

  var MANIFEST = 'projects/projects.json'; // caminho relativo: funciona em /homepage/ no GitHub Pages
  var SCREEN_MAX = 8;                       // quantos projetos aparecem na tela inicial
  var NEW_DAYS = 14;                        // até quantos dias um projeto ganha o selo "NOVO"

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var nav = document.querySelector('.main-nav');
  var list = nav.querySelector('.nav-list');
  var indicator = nav.querySelector('.nav-indicator');
  var toggle = document.querySelector('.menu-toggle');
  var main = document.getElementById('conteudo');
  var panels = Array.prototype.slice.call(document.querySelectorAll('.panel'));
  var screen = document.getElementById('screen');
  var screenInner = screen.querySelector('.screen-inner');
  var controls = document.querySelector('.controls');
  var cardsBox = document.getElementById('lista-projetos');
  var filterInput = document.getElementById('filtro');
  var counter = document.getElementById('contador');
  var DEFAULT = 'principal';

  var projects = [];   // lista completa (mais novo primeiro)
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
  function safeCover(c) {
    if (typeof c !== 'string' || !c) return '';
    return /^(projects\/[^:]*|https:\/\/[^\s"']+)$/.test(c) ? c : '';
  }
  function normalize(raw) {
    if (!Array.isArray(raw)) return [];
    return raw.filter(function (p) {
      return p && typeof p.slug === 'string' && /^[A-Za-z0-9][\w.-]*$/.test(p.slug);
    }).map(function (p) {
      return {
        slug: p.slug,
        title: String(p.title || p.slug),
        description: String(p.description || ''),
        date: String(p.date || ''),
        tags: Array.isArray(p.tags) ? p.tags.map(String).slice(0, 8) : [],
        cover: safeCover(p.cover),
        url: 'projects/' + encodeURIComponent(p.slug) + '/'
      };
    }).sort(function (a, b) { return b.date < a.date ? -1 : b.date > a.date ? 1 : a.title.localeCompare(b.title); });
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
        '<h3>NENHUM PROJETO AINDA...</h3>' +
        '<p class="insert-coin">INSERT COIN</p>' +
        '<p>O cartucho está vazio. Assim que um tutorial for adicionado em <code>projects/</code>, ele aparece aqui.</p>' +
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
          : 'Não consegui carregar <code>projects/projects.json</code>. Recarregue a página para tentar de novo.') + '</p>' +
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
        '<ul class="screen-list" id="screen-list" role="listbox" tabindex="0" aria-label="Últimos projetos — use as setas para escolher">' +
        items.map(function (p, i) {
          return '<li class="screen-item" role="option" id="opt-' + i + '" data-index="' + i + '" aria-selected="' + (i === selected) + '">' +
            esc(p.title) + (isNew(p.date) ? '<span class="new">NOVO</span>' : '') + '</li>';
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
      '<div class="preview-cover">' + (p.cover ? '<img src="' + esc(p.cover) + '" alt="" loading="lazy">' : '<span aria-hidden="true">🕹️</span>') + '</div>' +
      '<h3>' + esc(p.title) + '</h3>' +
      '<p class="meta">📅 ' + formatDate(p.date) + '</p>' +
      (p.description ? '<p class="desc">' + esc(p.description) + '</p>' : '') +
      tagsHtml(p.tags) +
      '<a class="btn btn-primary btn-small" href="' + esc(p.url) + '"><span class="btn-label">▶ Abrir projeto</span></a>';
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

  /* ================= Aba Projetos ================= */
  function renderCards() {
    var q = (filterInput.value || '').trim().toLowerCase();
    var items = projects.filter(function (p) {
      if (!q) return true;
      return (p.title + ' ' + p.description + ' ' + p.tags.join(' ')).toLowerCase().indexOf(q) >= 0;
    });
    counter.textContent = items.length + ' de ' + projects.length + ' projeto(s)';
    if (!items.length) {
      cardsBox.innerHTML = '<div class="cards-empty"><strong>INSERT COIN</strong>' +
        (projects.length ? 'Nenhum projeto combina com a busca.' : 'Nenhum projeto ainda... os tutoriais aparecem aqui assim que forem adicionados.') + '</div>';
      return;
    }
    var arts = ['art-1', 'art-2', 'art-3'];
    cardsBox.innerHTML = items.map(function (p, i) {
      return '<article class="card">' +
        '<div class="card-art ' + arts[i % 3] + '" aria-hidden="true">' + (p.cover ? '<img src="' + esc(p.cover) + '" alt="" loading="lazy">' : '👾') + '</div>' +
        '<h3>' + esc(p.title) + '</h3>' +
        '<p class="meta">📅 ' + formatDate(p.date) + '</p>' +
        '<p>' + esc(p.description) + '</p>' +
        tagsHtml(p.tags) +
        '<a class="btn btn-small" href="' + esc(p.url) + '"><span class="btn-label">▶ Abrir</span></a>' +
      '</article>';
    }).join('');
  }
  filterInput.addEventListener('input', renderCards);

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
  function load() {
    var bootTime = reduceMotion.matches ? 0 : 2700; // deixa a animação de boot terminar
    var started = Date.now();
    var isFile = location.protocol === 'file:';
    var req = isFile ? Promise.reject(new Error('file')) :
      fetch(MANIFEST, { cache: 'no-cache' }).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      });
    req.then(function (data) {
      projects = normalize(data);
      return 'ok';
    }, function (err) {
      if (window.console) console.warn('[CLEITINHO.DEV] falha ao ler', MANIFEST, err);
      return 'error';
    }).then(function (res) {
      setTimeout(function () {
        if (res === 'error') renderError(isFile);
        else if (!projects.length) renderEmpty();
        else renderList();
        renderCards();
      }, Math.max(0, bootTime - (Date.now() - started)));
    });
  }

  setControls(false);
  route(false);
  load();
})();
