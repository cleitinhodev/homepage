/* RETRO INVADER — mini space shooter em <canvas> para a aba Links.
   Fica parado na tela de título até o jogador apertar Jogar/START.
   A música (assets/audio/game-theme.mp3, preload="none") só toca durante a partida. */
(function () {
  'use strict';

  var canvas = document.getElementById('game-canvas');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var wrap = document.getElementById('game');
  var panel = document.getElementById('links');
  var btnPlay = document.getElementById('game-play');
  var btnPause = document.getElementById('game-pause');
  var btnMute = document.getElementById('game-mute');
  var music = document.getElementById('game-music');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  var W = canvas.width, H = canvas.height;
  var LS_HI = 'retroInvader.hiScore', LS_MUTE = 'retroInvader.muted';
  var FONT = '"Press Start 2P", ui-monospace, monospace';
  var C = { red: '#ff1f4b', violet: '#a855f7', pink: '#ff4fa3', white: '#f3e8ff', yellow: '#ffe066', cyan: '#00e5ff', muted: '#b9a1d9' };

  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* modo privado */ } }

  var hiScore = parseInt(lsGet(LS_HI) || '0', 10) || 0;
  var muted = lsGet(LS_MUTE) === '1';

  /* ================= Sprites (bitmaps) ================= */
  var SPR = {
    squid: [
      ['00011000', '00111100', '01111110', '11011011', '11111111', '00100100', '01011010', '10100101'],
      ['00011000', '00111100', '01111110', '11011011', '11111111', '01011010', '10000001', '01000010']
    ],
    crab: [
      ['00100000100', '00010001000', '00111111100', '01101110110', '11111111111', '10111111101', '10100000101', '00011011000'],
      ['00100000100', '10010001001', '10111111101', '11101110111', '11111111111', '01111111110', '00100000100', '01000000010']
    ],
    octo: [
      ['000011110000', '011111111110', '111111111111', '111001100111', '111111111111', '000110011000', '001101101100', '110000000011'],
      ['000011110000', '011111111110', '111111111111', '111001100111', '111111111111', '001110011100', '011001100110', '001100001100']
    ],
    ship: [['0000001000000', '0000011100000', '0000011100000', '0111111111110', '1111111111111', '1111111111111', '1111111111111', '1111111111111']],
    ufo: [['0000011111100000', '0001111111111000', '0011111111111100', '0110110110110110', '1111111111111111', '0011100110011100', '0001000000001000']]
  };
  var cache = {};
  function sprite(name, frame, color, px) {
    var key = name + frame + color + px;
    if (cache[key]) return cache[key];
    var rows = SPR[name][frame];
    var pad = 6;
    var c = document.createElement('canvas');
    c.width = rows[0].length * px + pad * 2; c.height = rows.length * px + pad * 2;
    var g = c.getContext('2d');
    g.shadowColor = color; g.shadowBlur = 6; g.fillStyle = color;
    rows.forEach(function (r, y) { for (var x = 0; x < r.length; x++) if (r[x] === '1') g.fillRect(pad + x * px, pad + y * px, px, px); });
    c.pad = pad; c.w = rows[0].length * px; c.h = rows.length * px;
    return (cache[key] = c);
  }
  function drawSprite(name, frame, color, px, x, y) {
    var s = sprite(name, frame, color, px);
    ctx.drawImage(s, Math.round(x - s.pad), Math.round(y - s.pad));
    return s;
  }

  /* ================= Som (efeitos 8-bit via WebAudio) ================= */
  var actx = null;
  function beep(freq, dur, type, vol, slide) {
    if (muted) return;
    try {
      if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === 'suspended') actx.resume();
      var o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime;
      o.type = type || 'square'; o.frequency.setValueAtTime(freq, t);
      if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
      g.gain.setValueAtTime(vol || 0.05, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + dur);
    } catch (e) { /* sem áudio */ }
  }
  function musicPlay() {
    if (!music) return;
    music.muted = muted;
    var p = music.play();
    if (p && p.catch) p.catch(function () { /* bloqueado pelo navegador */ });
  }
  function musicPause() { if (music && !music.paused) music.pause(); }
  function updateMuteBtn() {
    btnMute.setAttribute('aria-pressed', String(muted));
    btnMute.querySelector('.btn-label').textContent = muted ? '♪ Som: OFF' : '♪ Som: ON';
    if (music) music.muted = muted;
  }

  /* ================= Estado do jogo ================= */
  var state = 'title'; // title | playing | paused | gameover
  var keys = { left: false, right: false, fire: false };
  var stars = [];
  for (var i = 0; i < 70; i++) stars.push({ x: Math.random() * W, y: Math.random() * H, s: Math.random() * 1.6 + 0.4, v: Math.random() * 30 + 10 });

  var score, lives, wave, player, bullets, shots, enemies, formation, particles, ufo, ufoTimer, shotTimer, banner, animT, animFrame;
  var TYPES = { squid: { pts: 30, color: C.pink }, crab: { pts: 20, color: C.violet }, octo: { pts: 10, color: C.red } };
  var ROWS = ['squid', 'crab', 'crab', 'octo', 'octo'], COLS = 10, PX = 3, GAP_X = 48, GAP_Y = 36;

  function newGame() {
    score = 0; lives = 3; wave = 1;
    player = { x: W / 2, y: H - 58, w: 39, h: 24, cool: 0, inv: 0 };
    particles = [];
    startWave();
  }
  function startWave() {
    bullets = []; shots = []; ufo = null;
    ufoTimer = 14 + Math.random() * 10; shotTimer = 1.5;
    enemies = [];
    var top = 70 + Math.min(wave - 1, 5) * 12;
    var left = (W - (COLS - 1) * GAP_X) / 2;
    ROWS.forEach(function (type, r) {
      var w = SPR[type][0][0].length * PX, h = 8 * PX;
      for (var c = 0; c < COLS; c++) enemies.push({ type: type, x: left + c * GAP_X - w / 2, y: top + r * GAP_Y, w: w, h: h, col: c, alive: true });
    });
    formation = { dir: 1, total: enemies.length };
    banner = { text: 'WAVE ' + wave, t: 1.6 };
    animT = 0; animFrame = 0;
  }
  function aliveEnemies() { return enemies.filter(function (e) { return e.alive; }); }

  function start() {
    newGame();
    state = 'playing';
    if (music) { try { music.currentTime = 0; } catch (e) { /* ainda não carregado */ } }
    musicPlay();
    beep(440, 0.12, 'square', 0.05, 880);
    syncUi();
    wrap.focus({ preventScroll: true });
  }
  function pause() {
    if (state !== 'playing') return;
    state = 'paused'; keys.left = keys.right = keys.fire = false;
    musicPause(); syncUi();
  }
  function resume() {
    if (state !== 'paused') return;
    state = 'playing'; musicPlay(); syncUi();
    wrap.focus({ preventScroll: true });
  }
  function gameOver() {
    state = 'gameover'; musicPause();
    if (score > hiScore) { hiScore = score; lsSet(LS_HI, String(hiScore)); }
    beep(220, 0.6, 'sawtooth', 0.06, 55);
    syncUi();
  }
  function syncUi() {
    var playing = state === 'playing', paused = state === 'paused';
    btnPlay.querySelector('.btn-label').textContent = paused ? '▶ Continuar' : (state === 'gameover' ? '↻ Jogar de novo' : (playing ? '↻ Reiniciar' : '▶ Jogar'));
    btnPause.disabled = !playing;
    wrap.classList.toggle('is-playing', playing);
  }

  /* ================= Atualização ================= */
  function boom(x, y, color, n) {
    for (var i = 0; i < (n || 14); i++) {
      var a = Math.random() * Math.PI * 2, s = Math.random() * 160 + 40;
      particles.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, t: 0.5 + Math.random() * 0.4, color: color });
    }
  }
  function hit(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }

  function update(dt) {
    stars.forEach(function (s) { s.y += s.v * dt; if (s.y > H) { s.y = 0; s.x = Math.random() * W; } });
    particles = particles.filter(function (p) { p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.96; p.vy *= 0.96; p.t -= dt; return p.t > 0; });
    if (banner) { banner.t -= dt; if (banner.t <= 0) banner = null; }

    // jogador
    var sp = 280;
    if (keys.left) player.x -= sp * dt;
    if (keys.right) player.x += sp * dt;
    player.x = Math.max(player.w / 2 + 8, Math.min(W - player.w / 2 - 8, player.x));
    player.cool -= dt; player.inv -= dt;
    if (keys.fire && player.cool <= 0 && bullets.length < 2) {
      bullets.push({ x: player.x - 2, y: player.y - 14, w: 4, h: 14 });
      player.cool = 0.32; beep(880, 0.08, 'square', 0.03, 440);
    }
    bullets = bullets.filter(function (b) { b.y -= 560 * dt; return b.y + b.h > 0; });

    // formação
    var alive = aliveEnemies();
    if (!alive.length) { wave++; startWave(); beep(660, 0.25, 'triangle', 0.06, 1320); return; }
    var ratio = 1 - alive.length / formation.total;
    var speed = (26 + ratio * 110) * (1 + (wave - 1) * 0.18);
    var dx = speed * dt * formation.dir, edge = false;
    alive.forEach(function (e) { if ((e.x + dx < 12 && formation.dir < 0) || (e.x + e.w + dx > W - 12 && formation.dir > 0)) edge = true; });
    if (edge) { formation.dir *= -1; alive.forEach(function (e) { e.y += 16; }); }
    else alive.forEach(function (e) { e.x += dx; });
    animT += dt;
    var step = Math.max(0.12, 0.6 - ratio * 0.45 - (wave - 1) * 0.04);
    if (animT >= step) { animT = 0; animFrame ^= 1; }

    // inimigos chegaram embaixo
    for (var i = 0; i < alive.length; i++) if (alive[i].y + alive[i].h >= player.y) { boom(player.x, player.y, C.cyan, 30); lives = 0; gameOver(); return; }

    // tiros dos inimigos
    shotTimer -= dt;
    var maxShots = Math.min(6, 2 + Math.floor(wave / 2));
    if (shotTimer <= 0 && !banner) {
      shotTimer = Math.max(0.25, 1.15 - wave * 0.09) * (0.6 + Math.random() * 0.8);
      if (shots.length < maxShots) {
        var bottoms = {};
        alive.forEach(function (e) { if (!bottoms[e.col] || e.y > bottoms[e.col].y) bottoms[e.col] = e; });
        var list = Object.keys(bottoms).map(function (k) { return bottoms[k]; });
        // prefere quem está perto do jogador
        list.sort(function (a, b) { return Math.abs(a.x - player.x) - Math.abs(b.x - player.x); });
        var shooter = list[Math.random() < 0.5 ? 0 : Math.floor(Math.random() * list.length)];
        if (shooter) shots.push({ x: shooter.x + shooter.w / 2 - 2, y: shooter.y + shooter.h, w: 4, h: 12, wig: 0 });
      }
    }
    var shotSpeed = 170 + wave * 16;
    shots = shots.filter(function (s) { s.y += shotSpeed * dt; s.wig += dt * 20; return s.y < H; });

    // UFO bônus
    ufoTimer -= dt;
    if (!ufo && ufoTimer <= 0) { var dir = Math.random() < 0.5 ? 1 : -1; ufo = { x: dir > 0 ? -60 : W + 10, y: 40, w: 48, h: 21, dir: dir }; }
    if (ufo) { ufo.x += ufo.dir * 120 * dt; if (ufo.x < -80 || ufo.x > W + 40) { ufo = null; ufoTimer = 16 + Math.random() * 12; } }

    // colisões: balas x inimigos / UFO
    bullets = bullets.filter(function (b) {
      for (var i = 0; i < alive.length; i++) {
        var e = alive[i];
        if (e.alive && hit(b, e)) {
          e.alive = false; score += TYPES[e.type].pts;
          boom(e.x + e.w / 2, e.y + e.h / 2, TYPES[e.type].color); beep(180, 0.12, 'square', 0.05, 60);
          return false;
        }
      }
      if (ufo && hit(b, ufo)) {
        var pts = [50, 100, 150, 300][Math.floor(Math.random() * 4)];
        score += pts; boom(ufo.x + ufo.w / 2, ufo.y + 10, C.yellow, 30);
        banner = { text: '+' + pts, t: 0.9, small: true }; ufo = null; ufoTimer = 18 + Math.random() * 10;
        beep(1200, 0.3, 'triangle', 0.06, 300);
        return false;
      }
      return true;
    });
    // tiros x balas (se anulam)
    bullets = bullets.filter(function (b) {
      for (var i = 0; i < shots.length; i++) if (hit(b, shots[i])) { boom(b.x, b.y, C.white, 5); shots.splice(i, 1); return false; }
      return true;
    });
    // tiros x jogador
    if (player.inv <= 0) {
      var pbox = { x: player.x - player.w / 2 + 3, y: player.y + 6, w: player.w - 6, h: player.h - 6 };
      for (var j = 0; j < shots.length; j++) {
        if (hit(shots[j], pbox)) {
          shots.splice(j, 1); lives--; boom(player.x, player.y + 10, C.cyan, 32); beep(120, 0.4, 'sawtooth', 0.07, 40);
          if (lives <= 0) { gameOver(); return; }
          player.inv = 1.6; break;
        }
      }
    }
  }

  /* ================= Desenho ================= */
  function pad(n, len) { n = String(n); while (n.length < len) n = '0' + n; return n; }
  function text(t, x, y, size, color, align, glow) {
    ctx.font = size + 'px ' + FONT; ctx.textAlign = align || 'center'; ctx.textBaseline = 'middle';
    ctx.shadowColor = glow || color; ctx.shadowBlur = 10; ctx.fillStyle = color; ctx.fillText(t, x, y); ctx.shadowBlur = 0;
  }
  function drawBg(t) {
    var g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#0b0118'); g.addColorStop(1, '#1a0433');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    stars.forEach(function (s) {
      ctx.globalAlpha = 0.35 + 0.65 * Math.abs(Math.sin(s.x + t * (reduceMotion.matches ? 0 : 1.5)));
      ctx.fillStyle = s.s > 1.4 ? C.pink : C.white; ctx.fillRect(s.x, s.y, s.s, s.s);
    });
    ctx.globalAlpha = 1;
    // horizonte synthwave
    ctx.strokeStyle = 'rgba(255,31,75,.35)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, H - 24); ctx.lineTo(W, H - 24); ctx.stroke();
  }
  function drawHud() {
    text('SCORE ' + pad(score, 6), 16, 20, 12, C.white, 'left', C.red);
    text('HI ' + pad(Math.max(hiScore, score), 6), W / 2, 20, 12, C.pink, 'center');
    text('WAVE ' + wave, W - 16, 20, 12, C.white, 'right', C.violet);
    for (var i = 0; i < lives - 1; i++) drawSprite('ship', 0, C.cyan, 2, 16 + i * 36, H - 18);
    text('x' + lives, W - 16, H - 11, 10, C.cyan, 'right');
  }
  function drawGame(t) {
    drawBg(t);
    enemies.forEach(function (e) { if (e.alive) drawSprite(e.type, animFrame, TYPES[e.type].color, PX, e.x, e.y); });
    if (ufo) drawSprite('ufo', 0, C.yellow, 3, ufo.x, ufo.y);
    if (state === 'playing' || state === 'paused') {
      if (player.inv <= 0 || Math.floor(player.inv * 10) % 2 === 0) drawSprite('ship', 0, C.cyan, 3, player.x - player.w / 2, player.y);
    }
    ctx.shadowBlur = 8;
    ctx.shadowColor = C.white; ctx.fillStyle = C.white;
    bullets.forEach(function (b) { ctx.fillRect(b.x, b.y, b.w, b.h); });
    ctx.shadowColor = C.red; ctx.fillStyle = C.red;
    shots.forEach(function (s) { var o = Math.sin(s.wig) * 2; ctx.fillRect(s.x + o, s.y, s.w, s.h / 2); ctx.fillRect(s.x - o, s.y + s.h / 2, s.w, s.h / 2); });
    ctx.shadowBlur = 0;
    particles.forEach(function (p) { ctx.globalAlpha = Math.min(1, p.t * 2); ctx.fillStyle = p.color; ctx.fillRect(p.x, p.y, 3, 3); });
    ctx.globalAlpha = 1;
    drawHud();
    if (banner) text(banner.text, W / 2, banner.small ? 70 : H / 2, banner.small ? 14 : 26, banner.small ? C.yellow : C.white, 'center', C.red);
  }
  function blinkOn(t) { return reduceMotion.matches || Math.floor(t * 2) % 2 === 0; }
  function drawTitle(t) {
    drawBg(t);
    text('RETRO', W / 2, 92, 40, C.white, 'center', C.red);
    text('INVADER', W / 2, 146, 40, C.pink, 'center', C.violet);
    var f = reduceMotion.matches ? 0 : Math.floor(t * 2) % 2;
    var rows = [['squid', '= 30 PTS'], ['crab', '= 20 PTS'], ['octo', '= 10 PTS'], ['ufo', '= ??? PTS']];
    rows.forEach(function (r, i) {
      var y = 210 + i * 36, type = r[0];
      var color = type === 'ufo' ? C.yellow : TYPES[type].color;
      var s = sprite(type, type === 'ufo' ? 0 : f, color, type === 'ufo' ? 2 : PX);
      drawSprite(type, type === 'ufo' ? 0 : f, color, type === 'ufo' ? 2 : PX, W / 2 - 70 - s.w / 2, y - s.h / 2);
      text(r[1], W / 2 - 30, y, 12, C.white, 'left', color);
    });
    if (blinkOn(t)) text('PRESS START', W / 2, 382, 18, C.red, 'center', C.red);
    text('aperte JOGAR, ENTER ou toque na tela', W / 2, 414, 9, C.muted, 'center', C.violet);
    text('HI-SCORE ' + pad(hiScore, 6), W / 2, 448, 12, C.pink, 'center');
  }
  function overlay(title, sub, t) {
    ctx.fillStyle = 'rgba(7,0,15,.72)'; ctx.fillRect(0, 0, W, H);
    text(title, W / 2, H / 2 - 40, 30, C.white, 'center', C.red);
    if (sub && blinkOn(t)) text(sub, W / 2, H / 2 + 14, 12, C.pink, 'center', C.violet);
  }

  /* ================= Loop ================= */
  var last = 0;
  function frame(ts) {
    requestAnimationFrame(frame);
    if (panel.hidden || document.hidden) { last = ts; return; }
    var dt = Math.min(0.05, (ts - (last || ts)) / 1000); last = ts;
    var t = ts / 1000;
    if (state === 'playing') update(dt);
    else if (state === 'gameover') particles = particles.filter(function (p) { p.x += p.vx * dt; p.y += p.vy * dt; p.t -= dt; return p.t > 0; });

    if (state === 'title') drawTitle(t);
    else {
      drawGame(t);
      if (state === 'paused') overlay('PAUSADO', 'P / ESC para continuar', t);
      if (state === 'gameover') {
        overlay('GAME OVER', 'PRESS START para jogar de novo', t);
        text('SCORE ' + pad(score, 6) + '   HI ' + pad(hiScore, 6), W / 2, H / 2 + 60, 12, C.white, 'center', C.violet);
      }
    }
  }

  /* ================= Entrada ================= */
  var KEYMAP = { ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right', ' ': 'fire', Spacebar: 'fire' };
  var GAME_KEYS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'Spacebar', 'a', 'A', 'd', 'D', 'p', 'P', 'Escape', 'Enter'];

  function onKey(e, down) {
    if (panel.hidden || GAME_KEYS.indexOf(e.key) < 0 || e.altKey || e.ctrlKey || e.metaKey) return;
    var focused = wrap.contains(document.activeElement);
    var active = state === 'playing' || state === 'paused';
    if (!active && !focused) return;
    var onButton = document.activeElement && document.activeElement.tagName === 'BUTTON';
    // fora da partida, Enter/Espaço num botão continuam acionando o botão normalmente
    if (!active && onButton && (e.key === 'Enter' || e.key === ' ')) return;

    e.preventDefault();
    e.stopPropagation(); // não deixa o menu / a tela inicial reagirem às setas
    if (!down) { if (KEYMAP[e.key]) keys[KEYMAP[e.key]] = false; return; }

    if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
      if (state === 'playing') pause(); else if (state === 'paused') resume();
      return;
    }
    if (state === 'title' || state === 'gameover') {
      if (e.key === 'Enter' || e.key === ' ') start();
      return;
    }
    if (state === 'paused' && e.key === 'Enter') { resume(); return; }
    if (KEYMAP[e.key] && state === 'playing') keys[KEYMAP[e.key]] = true;
  }
  window.addEventListener('keydown', function (e) { onKey(e, true); }, true);
  window.addEventListener('keyup', function (e) { onKey(e, false); }, true);

  btnPlay.addEventListener('click', function () { if (state === 'paused') resume(); else start(); });
  btnPause.addEventListener('click', pause);
  btnMute.addEventListener('click', function () {
    muted = !muted; lsSet(LS_MUTE, muted ? '1' : '0'); updateMuteBtn();
  });
  canvas.addEventListener('click', function () {
    if (state === 'title' || state === 'gameover') start();
    else if (state === 'paused') resume();
    else wrap.focus({ preventScroll: true });
  });

  // botões de toque (segurar = mover / atirar)
  Array.prototype.forEach.call(document.querySelectorAll('[data-touch]'), function (b) {
    var k = b.getAttribute('data-touch');
    function on(e) {
      e.preventDefault();
      if (state !== 'playing') { if (k === 'fire' && state !== 'paused') start(); else if (state === 'paused') resume(); return; }
      keys[k] = true; b.classList.add('is-pressed');
    }
    function off() { keys[k] = false; b.classList.remove('is-pressed'); }
    b.addEventListener('pointerdown', on);
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) { b.addEventListener(ev, off); });
    b.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  });

  // pausa ao trocar de aba do navegador, minimizar ou sair da aba Links
  document.addEventListener('visibilitychange', function () { if (document.hidden) pause(); });
  window.addEventListener('blur', pause);
  window.addEventListener('pagehide', pause);
  new MutationObserver(function () { if (panel.hidden) pause(); }).observe(panel, { attributes: true, attributeFilter: ['hidden'] });

  updateMuteBtn();
  syncUi();
  requestAnimationFrame(frame);
})();
