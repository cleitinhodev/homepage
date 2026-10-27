/* Renemya tutorial — JS puro, sem dependências. Funciona via http(s) e file://. */
(function () {
  "use strict";
  var LANGS = window.RNY_LANGS || [["en", "English"]];
  var CODES = LANGS.map(function (l) { return l[0]; });
  var KEY = "renemya-tutorial-lang";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  function normalize(code) {
    if (!code) return null;
    var c = String(code).trim().replace("-", "_");
    var low = c.toLowerCase();
    for (var i = 0; i < CODES.length; i++) if (CODES[i].toLowerCase() === low) return CODES[i];
    var base = low.split("_")[0];
    var alias = { pt: "pt_BR", zh: "zh_CN" };
    if (alias[base] && CODES.indexOf(alias[base]) >= 0) return alias[base];
    for (var j = 0; j < CODES.length; j++) if (CODES[j].toLowerCase().split("_")[0] === base) return CODES[j];
    return null;
  }

  function fromUrl() {
    var m = /[?&]lang=([\w-]+)/.exec(location.search) || /[#&]lang=([\w-]+)/.exec(location.hash);
    return m ? normalize(m[1]) : null;
  }
  function stored() { try { return normalize(localStorage.getItem(KEY)); } catch (e) { return null; } }
  function store(c) { try { localStorage.setItem(KEY, c); } catch (e) { /* file:// em alguns navegadores */ } }
  function fromBrowser() {
    var list = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language];
    for (var i = 0; i < list.length; i++) { var n = normalize(list[i]); if (n) return n; }
    return null;
  }
  function sectionHash() {
    var h = location.hash.replace(/^#/, "");
    return h && h.indexOf("lang=") !== 0 ? h : null;
  }

  function load(code, cb) {
    window.RNY_I18N = window.RNY_I18N || {};
    if (window.RNY_I18N[code]) return cb(window.RNY_I18N[code]);
    var s = document.createElement("script");
    s.src = "assets/js/i18n/" + code + ".js";
    s.onload = function () { cb(window.RNY_I18N[code]); };
    s.onerror = function () { if (code !== "en") load("en", cb); };
    document.head.appendChild(s);
  }

  var select = $("#lang-select");
  LANGS.forEach(function (l) {
    var o = document.createElement("option");
    o.value = l[0]; o.textContent = l[1];
    o.lang = l[0].replace("_", "-");
    select.appendChild(o);
  });

  function render(d, keepHash) {
    var root = document.documentElement;
    root.lang = d.htmlLang; root.dir = d.dir;
    document.title = d.ui.title.replace(/<[^>]+>/g, "");
    $$("[data-ui]").forEach(function (el) {
      var k = el.getAttribute("data-ui");
      if (d.ui[k] != null) el.innerHTML = d.ui[k];
    });
    $$("[data-ui-label]").forEach(function (el) {
      var k = el.getAttribute("data-ui-label");
      if (d.ui[k] != null) el.setAttribute("aria-label", d.ui[k].replace(/<[^>]+>/g, ""));
    });
    $("#hero-title").innerHTML = d.ui.h1 || "Renemya";
    $("#article").innerHTML = d.html;
    select.value = d.code;
    $$("figure a.zoom").forEach(function (a) { a.title = (d.ui.zoom || "").replace(/<[^>]+>/g, ""); });
    buildToc();
    try {
      var url = location.pathname + "?lang=" + d.code + (keepHash && sectionHash() ? "#" + sectionHash() : "");
      history.replaceState(null, "", url);
    } catch (e) { /* alguns navegadores bloqueiam em file:// */ }
    if (keepHash && sectionHash()) {
      var t = document.getElementById(sectionHash());
      if (t) setTimeout(function () { t.scrollIntoView(); }, 30);
    }
  }

  function buildToc() {
    var list = $("#toc-list"); list.innerHTML = "";
    $$("#article section.part").forEach(function (sec) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = "#" + sec.id; a.textContent = $("h2", sec).textContent; a.dataset.target = sec.id;
      li.appendChild(a);
      var subs = $$("h3[id]", sec);
      if (subs.length) {
        var ol = document.createElement("ol");
        subs.forEach(function (h) {
          var sl = document.createElement("li"), sa = document.createElement("a");
          sa.href = "#" + h.id; sa.textContent = h.textContent; sa.dataset.target = h.id;
          sl.appendChild(sa); ol.appendChild(sl);
        });
        li.appendChild(ol);
      }
      list.appendChild(li);
    });
    spy();
  }

  var observer;
  function spy() {
    if (observer) observer.disconnect();
    if (!("IntersectionObserver" in window)) return;
    var links = {};
    $$("#toc-list a").forEach(function (a) { links[a.dataset.target] = a; });
    observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && links[e.target.id]) {
          $$("#toc-list a.active").forEach(function (x) { x.classList.remove("active"); });
          links[e.target.id].classList.add("active");
        }
      });
    }, { rootMargin: "-80px 0px -70% 0px" });
    $$("#article section.part, #article h3[id]").forEach(function (el) { observer.observe(el); });
  }

  function setLang(code, keepHash) {
    load(code, function (d) { if (d) { render(d, keepHash); store(d.code); } });
  }
  select.addEventListener("change", function () { setLang(select.value, false); window.scrollTo(0, 0); });

  // sumário no celular
  var toc = $("#toc"), toggle = $(".toc-toggle");
  toggle.addEventListener("click", function () {
    var open = toc.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  toc.addEventListener("click", function (e) {
    if (e.target.closest("a")) { toc.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); }
  });

  // lightbox
  var lb = $("#lightbox"), lbImg = $("#lb-img"), lbCap = $("#lb-cap"), lastFocus = null;
  function openLb(a) {
    var img = $("img", a), cap = a.parentNode.querySelector("figcaption");
    lbImg.src = a.getAttribute("href"); lbImg.alt = img ? img.alt : "";
    lbCap.textContent = cap ? cap.textContent : "";
    lastFocus = document.activeElement; lb.hidden = false; $(".lb-close").focus();
    document.body.style.overflow = "hidden";
  }
  function closeLb() { lb.hidden = true; lbImg.removeAttribute("src"); document.body.style.overflow = ""; if (lastFocus) lastFocus.focus(); }
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a.zoom");
    if (a) { e.preventDefault(); openLb(a); }
  });
  lb.addEventListener("click", function (e) { if (e.target !== lbImg) closeLb(); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { if (!lb.hidden) closeLb(); toc.classList.remove("open"); }
    if (e.key === "Tab" && !lb.hidden) { e.preventDefault(); $(".lb-close").focus(); }
  });

  setLang(fromUrl() || stored() || fromBrowser() || "en", true);
})();
