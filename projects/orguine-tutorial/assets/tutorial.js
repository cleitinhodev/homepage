/* Interações do tutorial do Orguine.
   Os valores (versão, data e links) vêm do ORGUINE_CONFIG, no topo do arquivo HTML. */
(function () {
  'use strict';
  document.documentElement.classList.add('js');
  var C = window.ORGUINE_CONFIG || (typeof ORGUINE_CONFIG !== 'undefined' ? ORGUINE_CONFIG : {});
  var LANG = document.documentElement.getAttribute('lang') || 'pt-BR';
  var T = {
    'pt-BR': { copy: 'copiar', copied: 'copiado ✓', manual: 'selecione e copie' },
    'en':    { copy: 'copy',   copied: 'copied ✓',  manual: 'select and copy' }
  }[LANG] || { copy: 'copiar', copied: 'copiado ✓', manual: 'selecione e copie' };
  /* dataRelease vem como DD/MM/AAAA; fora do português mostra por extenso no idioma da página */
  function fmtDate(v) {
    var m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(String(v).trim());
    if (!m || LANG.indexOf('pt') === 0) return v;
    try { return new Date(+m[3], +m[2] - 1, +m[1]).toLocaleDateString(LANG, { year: 'numeric', month: 'long', day: 'numeric' }); }
    catch (e) { return v; }
  }
  function get(path) { return path.split('.').reduce(function (o, k) { return o == null ? undefined : o[k]; }, C); }

  /* 1) Preenche textos e links a partir do ORGUINE_CONFIG */
  function applyConfig() {
    document.querySelectorAll('[data-cfg-text]').forEach(function (el) {
      var key = el.getAttribute('data-cfg-text'), v = get(key);
      if (v != null && v !== '') el.textContent = key === 'dataRelease' ? fmtDate(v) : v;
    });
    document.querySelectorAll('[data-cfg-href]').forEach(function (el) {
      var key = el.getAttribute('data-cfg-href'), v = get(key);
      if (!v) return;
      el.setAttribute('href', v);
      if (/^https?:/i.test(v) && key !== 'links.voltar' && key.indexOf('links.download') !== 0) {
        el.setAttribute('target', '_blank'); el.setAttribute('rel', 'noopener');
      }
    });
    var tpl = document.documentElement.getAttribute('data-title');
    if (tpl && C.versao) document.title = tpl.replace('{versao}', C.versao);
  }
  applyConfig();
  window.orguineApplyConfig = applyConfig;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 2) Revelar ao rolar */
  var els = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) { io.observe(el); });
  } else { els.forEach(function (el) { el.classList.add('in'); }); }

  /* 3) Contadores animados */
  function runCounter(el) {
    var end = +el.getAttribute('data-count'), start = end === 0 ? 99 : 0, t0 = null, dur = 1400;
    function tick(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(start + (end - start) * e);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if ('IntersectionObserver' in window && !reduce) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { runCounter(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    document.querySelectorAll('[data-count]').forEach(function (el) { co.observe(el); });
  }

  /* 4) Abas dos modos */
  var tabs = document.querySelectorAll('.tab');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) { t.setAttribute('aria-selected', 'false'); });
      document.querySelectorAll('.panel').forEach(function (p) { p.classList.remove('on'); });
      tab.setAttribute('aria-selected', 'true');
      var p = document.getElementById(tab.getAttribute('data-panel'));
      if (p) p.classList.add('on', 'in');
    });
  });

  /* 5) Ampliar imagens (lightbox) */
  var lb = document.getElementById('lb'), lbImg = lb.querySelector('img'), lbCap = lb.querySelector('p');
  function closeLb() { lb.classList.remove('on'); document.body.style.overflow = ''; }
  document.querySelectorAll('img[data-zoom]').forEach(function (img) {
    var target = img.closest('.shot') || img.closest('.window') || img;
    target.addEventListener('click', function () {
      lbImg.src = img.currentSrc || img.src; lbImg.alt = img.alt;
      lbCap.textContent = img.getAttribute('data-caption') || img.alt;
      lb.classList.add('on'); document.body.style.overflow = 'hidden';
    });
  });
  lb.addEventListener('click', closeLb);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeLb(); });

  /* 6) Copiar comandos do terminal */
  document.querySelectorAll('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var txt = document.getElementById(b.getAttribute('data-copy')).innerText.split('\n')
        .filter(function (l) { return l.trim().charAt(0) === '$'; })
        .map(function (l) { return l.replace(/^\s*\$\s*/, ''); }).join('\n');
      var done = function () { b.textContent = T.copied; setTimeout(function () { b.textContent = T.copy; }, 1600); };
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(txt).then(done, function () { b.textContent = T.manual; });
      else b.textContent = T.manual;
    });
  });

  /* 7) Menu no celular, barra de leitura e botão de topo */
  var menuBtn = document.getElementById('menuBtn'), nav = document.getElementById('nav');
  menuBtn.addEventListener('click', function () {
    var open = nav.classList.toggle('open'); menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { nav.classList.remove('open'); }); });
  var bar = document.getElementById('progress'), topBtn = document.getElementById('toTop');
  function onScroll() {
    var h = document.documentElement, max = h.scrollHeight - h.clientHeight;
    bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
    topBtn.classList.toggle('on', h.scrollTop > 700);
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  topBtn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });
})();
