/* Idioma do tutorial do Orguine.
   - ?lang=pt-BR ou ?lang=en na URL força um idioma (e lembra a escolha).
   - Clicar no seletor PT/EN lembra a escolha (localStorage).
   - Na primeira visita, sem escolha salva, usa o idioma do navegador.
   A lista de idiomas e arquivos fica em assets/config.js (ORGUINE_CONFIG.idiomas). */
(function () {
  'use strict';
  var KEY = 'orguine-tutorial-lang';
  var cfg = (typeof ORGUINE_CONFIG !== 'undefined' && ORGUINE_CONFIG) || {};
  var LANGS = cfg.idiomas || { 'pt-BR': 'index.html', 'en': 'tutorial-orguine.en.html' };
  var current = document.documentElement.getAttribute('lang') || 'pt-BR';

  function match(code) {
    if (!code) return null;
    code = String(code).toLowerCase();
    for (var k in LANGS) if (k.toLowerCase() === code) return k;           // exato (pt-br)
    var base = code.split(/[-_]/)[0];
    for (var k2 in LANGS) if (k2.toLowerCase().split('-')[0] === base) return k2; // só a base (pt, en)
    return null;
  }
  function save(code) { try { localStorage.setItem(KEY, code); } catch (e) { /* file:// ou modo privado */ } }
  function load() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function go(code) {
    var file = LANGS[code]; if (!file) return;
    location.replace(file + location.hash);
  }

  var want = null, q = null;
  try { q = new URLSearchParams(location.search).get('lang'); } catch (e) { /* navegador antigo */ }
  if (q && match(q)) { want = match(q); save(want); }
  else if (match(load())) { want = match(load()); }
  else if (!/bot|crawl|spider|slurp|lighthouse/i.test(navigator.userAgent || '')) {
    var prefs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language];
    for (var i = 0; i < prefs.length && !want; i++) want = match(prefs[i]);
  }
  if (want && want !== current) { go(want); return; }

  /* Seletor de idioma: lembra a escolha e mantém a seção (#âncora) atual. */
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('[data-lang]') : null;
    if (!a) return;
    var code = a.getAttribute('data-lang');
    save(code);
    if (code === current) { e.preventDefault(); return; }
    if (LANGS[code]) a.setAttribute('href', LANGS[code] + location.hash);
  });
  /* Mantém os links do seletor iguais aos nomes de arquivo do config.js */
  document.addEventListener('DOMContentLoaded', function () {
    var els = document.querySelectorAll('[data-lang]');
    for (var i = 0; i < els.length; i++) { var f = LANGS[els[i].getAttribute('data-lang')]; if (f) els[i].setAttribute('href', f); }
  });
  window.orguineLang = { current: current, langs: LANGS, set: function (c) { save(c); go(c); } };
})();
