/* =====================================================================
   Easy Game Translator — Tutorial
   ---------------------------------------------------------------------
   CONFIG: this is the ONLY place you need to edit when a new version
   is released. Change VERSION and the links below (same file names
   pattern as the GitHub release), save, and upload the folder again.
   ===================================================================== */
const CONFIG = {
  VERSION: '4.0.6',
  DOWNLOAD_WINDOWS: 'https://github.com/cleitinhodev/easy_game_translator/releases/download/v4.0.7/EasyGameTranslator-4.0.7-setup.exe',
  DOWNLOAD_WINDOWS_PORTABLE: 'https://github.com/cleitinhodev/easy_game_translator/releases/download/v4.0.7/EasyGameTranslator-4.0.7-portable.exe',
  DOWNLOAD_LINUX_APPIMAGE: 'https://github.com/cleitinhodev/easy_game_translator/releases/download/v4.0.7/EasyGameTranslator-4.0.7-x86_64.AppImage',
  DOWNLOAD_LINUX_DEB: 'https://github.com/cleitinhodev/easy_game_translator/releases/download/v4.0.7/EasyGameTranslator-4.0.7-amd64.deb',
  SHA256SUMS: 'https://github.com/cleitinhodev/easy_game_translator/releases/download/v4.0.7/SHA256SUMS.txt',
  REPO: 'https://github.com/cleitinhodev/easy_game_translator',
  RELEASES: 'https://github.com/cleitinhodev/easy_game_translator/releases',
  DONATE: 'https://www.bugzinho.com/donate',
  WEBSITE: 'https://www.bugzinho.com/easygametranslator',
}
/* ===================================================================== */

;(function () {
  'use strict'
  const LANGS = [
    ['pt-BR', 'Português (Brasil)'], ['en', 'English'], ['es', 'Español'], ['fr', 'Français'], ['de', 'Deutsch'],
    ['it', 'Italiano'], ['ru', 'Русский'], ['uk', 'Українська'], ['pl', 'Polski'], ['tr', 'Türkçe'],
    ['nl', 'Nederlands'], ['id', 'Bahasa Indonesia'], ['vi', 'Tiếng Việt'], ['th', 'ไทย'], ['ar', 'العربية'],
    ['hi', 'हिन्दी'], ['ja', '日本語'], ['ko', '한국어'], ['zh-CN', '简体中文'], ['zh-TW', '繁體中文'],
  ]
  const RTL = new Set(['ar'])
  const CODES = LANGS.map((l) => l[0])
  const STORE_KEY = 'egt-tutorial-lang'
  window.EGT_I18N = window.EGT_I18N || {}

  // image sizes (all languages share the same capture sizes) — avoids layout jumps
  const IMG = window.EGT_IMG_SIZES || {}

  // ---------------------------------------------------------------- page structure
  // blocks: p, h, img, tip, warn, note, list, steps, code, legend, dodont, faq, sign
  const SECTIONS = [
    { id: 'about', icon: 'nina', blocks: [['p', 'about.p1'], ['p', 'about.p2'], ['img', 'intro', 'about.cap'], ['p', 'about.p3']] },
    { id: 'notice', icon: '🛡️', blocks: [['list', 'notice.items'], ['warn', 'notice.av']] },
    { id: 'install', icon: '💾', blocks: [
      ['dl'],
      ['h', 'install.win_h'], ['steps', 'install.win_steps'], ['tip', 'install.vc'],
      ['h', 'install.linux_h'], ['p', 'install.linux_p'],
      ['p', 'install.appimage'], ['code', 'chmod +x EasyGameTranslator-{v}-x86_64.AppImage\n./EasyGameTranslator-{v}-x86_64.AppImage'],
      ['p', 'install.deb'], ['code', 'sudo apt install ./EasyGameTranslator-{v}-amd64.deb'],
      ['tip', 'install.fuse'], ['warn', 'install.wayland'],
      ['h', 'install.verify_h'], ['p', 'install.verify'], ['code', 'sha256sum -c SHA256SUMS.txt --ignore-missing\n# Windows (PowerShell):\nGet-FileHash .\\EasyGameTranslator-{v}-setup.exe -Algorithm SHA256'],
    ] },
    { id: 'overview', icon: '🗺️', blocks: [['p', 'overview.p'], ['img', 'main-map', 'overview.cap'], ['legend', 'overview.legend']] },
    { id: 'step1', icon: '1', blocks: [['p', 'step1.p'], ['list', 'step1.items'], ['note', 'step1.no_target'], ['img', 'ocr-menu', 'step1.cap_ocr'], ['img', 'target-menu', 'step1.cap_target']] },
    { id: 'step2', icon: '2', blocks: [['p', 'step2.p'], ['img', 'select', 'step2.cap_select'], ['dodont', 'step2'], ['p', 'step2.after'], ['img', 'region-set', 'step2.cap_set'], ['tip', 'step2.borderless']] },
    { id: 'step3', icon: '3', blocks: [['p', 'step3.p'], ['img', 'translating', 'step3.cap'], ['list', 'step3.items'], ['p', 'step3.cache'], ['h', 'step3.font_h'], ['p', 'step3.font'], ['img', 'font-menu', 'step3.cap_font']] },
    { id: 'box', icon: '🪟', blocks: [['p', 'box.p'], ['img', 'box-game', 'box.cap'], ['p', 'box.controls'], ['img', 'box-controls', 'box.cap_controls'], ['tip', 'box.exclude'], ['warn', 'box.linux']] },
    { id: 'dual', icon: '🅰️', blocks: [['p', 'dual.p'], ['img', 'dual-game', 'dual.cap_game'], ['img', 'dual', 'dual.cap']] },
    { id: 'manual', icon: '🎙️', blocks: [['p', 'manual.p'], ['img', 'manual', 'manual.cap'], ['p', 'manual.voice']] },
    { id: 'profiles', icon: '💾', blocks: [['p', 'profiles.p'], ['tip', 'profiles.tip']] },
    { id: 'settings', icon: '⚙️', blocks: [
      ['p', 'settings.p'],
      ['h', 'settings.general_h'], ['p', 'settings.general'], ['img', 'set-general', 'settings.general_h'],
      ['h', 'settings.ocr_h'], ['p', 'settings.ocr'], ['img', 'set-ocr', 'settings.ocr_h'],
      ['h', 'settings.translation_h'], ['p', 'settings.translation'], ['img', 'set-translation', 'settings.translation_h'],
      ['h', 'settings.replace_h'], ['p', 'settings.replace'], ['img', 'set-replace', 'settings.replace_h'],
      ['h', 'settings.ai_h'], ['p', 'settings.ai'], ['p', 'settings.gemini'], ['img', 'set-ai', 'settings.cap_ai'], ['warn', 'settings.tokens'],
      ['p', 'settings.ollama'], ['img', 'set-ai-ollama', 'settings.cap_ollama'], ['p', 'settings.remove'], ['img', 'set-ai-remove', 'settings.cap_remove'],
      ['h', 'settings.history_h'], ['p', 'settings.history'], ['img', 'set-history', 'settings.history_h'],
      ['h', 'settings.updates_h'], ['p', 'settings.updates'], ['img', 'set-updates', 'settings.updates_h'],
      ['h', 'settings.bugs_h'], ['p', 'settings.bugs'], ['img', 'set-bugs', 'settings.bugs_h'],
    ] },
    { id: 'privacy', icon: '🔒', blocks: [['p', 'privacy.p'], ['list', 'privacy.items']] },
    { id: 'help', icon: '💙', blocks: [['p', 'help.p'], ['img', 'help', 'help.cap'], ['p', 'help.donate'], ['p', 'help.open']] },
    { id: 'faq', icon: '❓', blocks: [['faq', 'faq.items']] },
    { id: 'end', icon: '🎮', blocks: [['p', 'end.p'], ['sign', 'end.sign']] },
  ]

  // ---------------------------------------------------------------- helpers
  const $ = (s, r = document) => r.querySelector(s)
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e }
  let LANG = 'pt-BR'; let DICT = {}; const MISSING = new Set()
  const OPTIONAL = new Set(['step1.no_target']) // only some languages have these
  function raw(key) {
    if (OPTIONAL.has(key)) { const d = window.EGT_I18N[LANG]; return d && d.t && d.t[key] != null ? d.t[key] : null }
    const chain = [LANG, 'en', 'pt-BR']
    for (const l of chain) { const d = window.EGT_I18N[l]; if (d && d.t && d.t[key] != null) { if (l !== LANG) MISSING.add(key); return d.t[key] } }
    MISSING.add(key); return null
  }
  const link = (href, text) => `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`
  function fill(s) {
    if (typeof s !== 'string') return s
    return s.replace(/\{v\}/g, CONFIG.VERSION)
      .replace(/\{donate\}/g, link(CONFIG.DONATE, 'bugzinho.com/donate'))
      .replace(/\{repo\}/g, link(CONFIG.REPO, 'GitHub'))
      .replace(/\{releases\}/g, link(CONFIG.RELEASES, raw('dl.releases') || 'Releases'))
      .replace(/\{sha\}/g, link(CONFIG.SHA256SUMS, 'SHA256SUMS.txt'))
      .replace(/\{aistudio\}/g, link('https://aistudio.google.com/apikey', 'Google AI Studio'))
      .replace(/\{ollama\}/g, link('https://ollama.com', 'ollama.com'))
      .replace(/\{vcredist\}/g, link('https://learn.microsoft.com/cpp/windows/latest-supported-vc-redist', 'Microsoft Visual C++ Redistributable'))
      .replace(/\{tesseract\}/g, link('https://github.com/UB-Mannheim/tesseract/wiki', 'UB Mannheim'))
  }
  const t = (k) => fill(raw(k))
  const imgSrc = (name) => `assets/img/${LANG}/${name}.webp`

  function figure(name, capKey) {
    const f = el('figure', 'shot')
    const sz = IMG[name] || [1100, 727]
    const cap = capKey ? t(capKey) : ''
    const im = el('img'); im.src = imgSrc(name); im.loading = 'lazy'; im.decoding = 'async'; im.width = sz[0]; im.height = sz[1]
    im.alt = cap ? cap.replace(/<[^>]+>/g, '') : ''
    im.addEventListener('click', () => openLightbox(im.src, cap))
    const frame = el('div', 'shot-frame'); frame.appendChild(im)
    const zoom = el('span', 'zoom', '⤢'); zoom.setAttribute('aria-hidden', 'true'); frame.appendChild(zoom)
    f.appendChild(frame)
    if (cap) f.appendChild(el('figcaption', null, cap))
    return f
  }

  function block(b) {
    const [type, key, extra] = b
    switch (type) {
      case 'p': { const v = t(key); return v ? el('p', null, v) : null }
      case 'h': return el('h3', null, t(key))
      case 'img': return figure(key, extra)
      case 'tip': case 'warn': case 'note': {
        const v = t(key); if (!v) return null
        const ic = { tip: '💡', warn: '⚠️', note: 'ℹ️' }[type]
        const c = el('div', 'callout ' + type); c.appendChild(el('span', 'callout-ic', ic)); c.appendChild(el('div', 'callout-body', v)); return c
      }
      case 'list': case 'steps': {
        const arr = raw(key); if (!Array.isArray(arr)) return null
        const l = el(type === 'steps' ? 'ol' : 'ul', type === 'steps' ? 'steps' : 'nice'); arr.forEach((s) => l.appendChild(el('li', null, fill(s)))); return l
      }
      case 'legend': {
        const arr = raw(key); if (!Array.isArray(arr)) return null
        const l = el('ol', 'legend'); arr.forEach((s, i) => { const li = el('li'); li.appendChild(el('span', 'num', String(i + 1))); li.appendChild(el('span', null, fill(s))); l.appendChild(li) }); return l
      }
      case 'code': { const pre = el('pre', 'code'); const c = el('code'); c.textContent = key.replace(/\{v\}/g, CONFIG.VERSION); pre.appendChild(c)
        const btn = el('button', 'copy', t('ui.copy')); btn.type = 'button'
        btn.addEventListener('click', () => { navigator.clipboard && navigator.clipboard.writeText(c.textContent).then(() => { btn.textContent = t('ui.copied'); setTimeout(() => { btn.textContent = t('ui.copy') }, 1600) }) })
        pre.appendChild(btn); return pre }
      case 'dodont': {
        const w = el('div', 'dodont')
        for (const k of ['do', 'dont']) {
          const arr = raw(key + '.' + k); if (!Array.isArray(arr)) continue
          const c = el('div', 'dd ' + k); c.appendChild(el('h4', null, t(key + '.' + k + '_h')))
          const ul = el('ul'); arr.forEach((s) => ul.appendChild(el('li', null, fill(s)))); c.appendChild(ul); w.appendChild(c)
        }
        return w
      }
      case 'faq': {
        const arr = raw(key); if (!Array.isArray(arr)) return null
        const w = el('div', 'faq')
        arr.forEach(([q, a]) => { const d = el('details'); d.appendChild(el('summary', null, fill(q))); d.appendChild(el('div', 'faq-a', fill(a))); w.appendChild(d) })
        return w
      }
      case 'sign': return el('p', 'sign', t(key))
      case 'dl': return downloads()
    }
    return null
  }

  function downloads() {
    const w = el('div', 'dl-grid')
    const items = [
      ['win', CONFIG.DOWNLOAD_WINDOWS, 'dl.win_setup', 'dl.win_setup_sub', true],
      ['win', CONFIG.DOWNLOAD_WINDOWS_PORTABLE, 'dl.win_portable', 'dl.win_portable_sub'],
      ['linux', CONFIG.DOWNLOAD_LINUX_APPIMAGE, 'dl.appimage', 'dl.appimage_sub'],
      ['linux', CONFIG.DOWNLOAD_LINUX_DEB, 'dl.deb', 'dl.deb_sub'],
    ]
    for (const [os, href, tk, sk, primary] of items) {
      const a = el('a', 'dl-card ' + os + (primary ? ' primary' : '')); a.href = href; a.rel = 'noopener'
      a.appendChild(el('span', 'dl-os', os === 'win' ? WIN_SVG : LINUX_SVG))
      const tx = el('span', 'dl-tx'); tx.appendChild(el('b', null, t(tk))); tx.appendChild(el('small', null, t(sk))); a.appendChild(tx)
      a.appendChild(el('span', 'dl-arrow', '↓')); w.appendChild(a)
    }
    const box = el('div', 'dl-wrap'); box.appendChild(w); box.appendChild(el('p', 'dl-note', t('dl.note'))); return box
  }
  const WIN_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 5.5 10.5 4.4v7.1H3zm8.5-1.2L21 3v8.5h-9.5zM3 12.5h7.5v7.1L3 18.5zm8.5 0H21V21l-9.5-1.3z"/></svg>'
  const LINUX_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2c-2.2 0-3.6 1.9-3.6 4.6 0 1.4.3 2.3-.5 3.6-1 1.6-2.9 3.7-2.9 6.4 0 .7.1 1.3.4 1.9-.8.3-1.6.8-1.4 1.6.3.9 1.9.7 3.2 1.3 1.3.6 2.5.9 3.3-.1.6.1 2.4.1 3 0 .8 1 2 .7 3.3.1 1.3-.6 2.9-.4 3.2-1.3.2-.8-.6-1.3-1.4-1.6.3-.6.4-1.2.4-1.9 0-2.7-1.9-4.8-2.9-6.4-.8-1.3-.5-2.2-.5-3.6C15.6 3.9 14.2 2 12 2zm-1.6 4.1c.5 0 .8.6.8 1.2 0 .3-.1.5-.2.7l-.6-.2c.1-.1.1-.3.1-.5 0-.3-.1-.5-.2-.5s-.2.2-.2.5v.2l-.5-.2c0-.1-.1-.3-.1-.5.1-.4.4-.7.9-.7zm3.2 0c.5 0 .9.4.9 1 0 .3 0 .5-.1.7l-.5.1c0-.1.1-.3.1-.5 0-.4-.2-.6-.4-.6s-.4.3-.4.6v.3l-.6.2c-.1-.2-.1-.4-.1-.6 0-.7.5-1.2 1.1-1.2zM12 8.6c.8 0 2 .7 2 1 0 .3-1.1 1.2-2 1.2s-2-.9-2-1.2c0-.3 1.2-1 2-1z"/></svg>'

  // ---------------------------------------------------------------- render
  function render() {
    const d = window.EGT_I18N[LANG]
    document.documentElement.lang = LANG
    document.documentElement.dir = RTL.has(LANG) ? 'rtl' : 'ltr'
    document.title = raw('meta.title') || 'Easy Game Translator'
    const md = $('meta[name=description]'); if (md) md.content = (raw('meta.desc') || '')
    // static texts
    document.querySelectorAll('[data-t]').forEach((n) => { const v = t(n.getAttribute('data-t')); if (v != null) n.innerHTML = v })
    document.querySelectorAll('[data-ta]').forEach((n) => { const [attr, k] = n.getAttribute('data-ta').split(':'); const v = raw(k); if (v != null) n.setAttribute(attr, v) })
    $('#hero-shot').src = imgSrc('box-game')
    $('#hero-shot').alt = (raw('box.cap') || '').replace(/<[^>]+>/g, '')
    // hero downloads
    const hd = $('#hero-dl'); hd.innerHTML = ''; hd.appendChild(downloads())
    // sections + toc
    const main = $('#content'); main.innerHTML = ''
    const toc = $('#toc-list'); toc.innerHTML = ''
    SECTIONS.forEach((s, i) => {
      const sec = el('section', 'sec'); sec.id = s.id
      const head = el('header', 'sec-head')
      const ic = el('span', 'sec-ic' + (/^\d$/.test(s.icon) ? ' num' : ''))
      if (s.icon === 'nina') ic.innerHTML = '<img src="assets/nina.webp" alt="" width="44" height="44">'; else ic.textContent = s.icon
      head.appendChild(ic)
      const htx = el('div'); htx.appendChild(el('span', 'sec-kicker', /^\d$/.test(s.icon) ? (t('ui.step') || '').replace('{n}', s.icon) : '')); htx.appendChild(el('h2', null, t(s.id + '.title'))); head.appendChild(htx)
      sec.appendChild(head)
      for (const b of s.blocks) { const n = block(b); if (n) sec.appendChild(n) }
      main.appendChild(sec)
      const li = el('li'); const a = el('a', null, t(s.id + '.title')); a.href = '#' + s.id; li.appendChild(a); toc.appendChild(li)
    })
    // language select
    const sel = $('#lang'); sel.value = LANG
    observe()
    if (MISSING.size && /[?&]qa=1/.test(location.search)) console.warn('[i18n] missing for ' + LANG + ': ' + [...MISSING].join(', '))
    window.__EGT_MISSING = [...MISSING]
    if (location.hash && document.getElementById(location.hash.slice(1))) setTimeout(() => document.getElementById(location.hash.slice(1)).scrollIntoView(), 50)
  }

  let io
  function observe() {
    if (io) io.disconnect()
    const links = new Map([...document.querySelectorAll('#toc-list a')].map((a) => [a.getAttribute('href').slice(1), a]))
    io = new IntersectionObserver((ents) => {
      ents.forEach((e) => { if (e.isIntersecting) { links.forEach((a) => a.classList.remove('on')); const a = links.get(e.target.id); if (a) { a.classList.add('on') } } })
    }, { rootMargin: '-20% 0px -70% 0px' })
    document.querySelectorAll('section.sec').forEach((s) => io.observe(s))
    // reveal animation
    const rv = new IntersectionObserver((ents) => ents.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); rv.unobserve(e.target) } }), { rootMargin: '0px 0px -8% 0px' })
    document.querySelectorAll('.sec, .shot').forEach((n) => rv.observe(n))
  }

  // ---------------------------------------------------------------- lightbox
  function openLightbox(src, cap) {
    const lb = $('#lightbox'); $('#lb-img').src = src; $('#lb-img').alt = (cap || '').replace(/<[^>]+>/g, ''); $('#lb-cap').innerHTML = cap || ''
    lb.hidden = false; requestAnimationFrame(() => lb.classList.add('open')); $('#lb-close').focus()
  }
  function closeLightbox() { const lb = $('#lightbox'); lb.classList.remove('open'); setTimeout(() => { lb.hidden = true; $('#lb-img').src = '' }, 180) }

  // ---------------------------------------------------------------- language
  function detect() {
    const q = new URLSearchParams(location.search).get('lang')
    if (q && CODES.includes(q)) return q
    try { const s = localStorage.getItem(STORE_KEY); if (s && CODES.includes(s)) return s } catch (e) { /* private mode */ }
    const prefs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || 'en']
    for (const p0 of prefs) {
      const p = String(p0).toLowerCase()
      if (p.startsWith('pt')) return 'pt-BR'
      if (p.startsWith('zh')) return /(tw|hk|mo|hant)/.test(p) ? 'zh-TW' : 'zh-CN'
      const exact = CODES.find((c) => c.toLowerCase() === p); if (exact) return exact
      const base = CODES.find((c) => c.toLowerCase() === p.split('-')[0]); if (base) return base
    }
    return 'en'
  }
  function load(code, cb) {
    if (window.EGT_I18N[code]) return cb()
    const s = document.createElement('script'); s.src = `assets/i18n/${code}.js`; s.onload = cb
    s.onerror = () => { if (code !== 'en') load('en', () => { LANG = 'en'; cb() }) }
    document.head.appendChild(s)
  }
  function setLang(code, push) {
    const next = CODES.includes(code) ? code : 'en'
    const go = () => { LANG = next; MISSING.clear(); render()
      try { localStorage.setItem(STORE_KEY, next) } catch (e) { /* ignore */ }
      if (push) { const u = new URL(location.href); u.searchParams.set('lang', next); history.replaceState(null, '', u) } }
    // English + Portuguese are the fallback chain, load them as well
    load('pt-BR', () => load('en', () => load(next, go)))
  }

  document.addEventListener('DOMContentLoaded', () => {
    const sel = $('#lang')
    LANGS.forEach(([c, n]) => { const o = document.createElement('option'); o.value = c; o.textContent = n; sel.appendChild(o) })
    sel.addEventListener('change', () => setLang(sel.value, true))
    $('#lb-close').addEventListener('click', closeLightbox)
    $('#lightbox').addEventListener('click', (e) => { if (e.target.id === 'lightbox') closeLightbox() })
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('#lightbox').hidden) closeLightbox() })
    $('#toc-toggle').addEventListener('click', () => document.body.classList.toggle('toc-open'))
    $('#toc').addEventListener('click', (e) => { if (e.target.tagName === 'A') document.body.classList.remove('toc-open') })
    const top = $('#to-top'); window.addEventListener('scroll', () => { top.classList.toggle('show', scrollY > 900) }, { passive: true })
    top.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }))
    $('#year').textContent = new Date().getFullYear()
    setLang(detect(), false)
  })
})()
