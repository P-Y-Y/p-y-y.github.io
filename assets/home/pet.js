/* Soul仔 — a web port of my Codex desktop pet.
   Sprite layout and timings follow the Codex pet v2 format:
   8 columns x 11 rows of 192x208 cells; rows 9-10 hold 16 "look" directions. */
(function () {
  'use strict';

  var SHEET = 'images/pet/soul.webp';
  var COLS = 8, ROWS = 11;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function seq(row, n, ms, lastMs) {
    var out = [];
    for (var i = 0; i < n; i++) out.push({ r: row, c: i, ms: i === n - 1 ? lastMs : ms });
    return out;
  }
  var IDLE = [280, 110, 110, 140, 140, 320].map(function (ms, i) { return { r: 0, c: i, ms: ms * 6 }; });
  var ANIM = {
    idle: IDLE,
    'running-right': seq(1, 8, 120, 220),
    'running-left': seq(2, 8, 120, 220),
    waving: seq(3, 4, 140, 280),
    jumping: seq(4, 5, 140, 280),
    failed: seq(5, 8, 140, 240),
    waiting: seq(6, 6, 150, 260),
    running: seq(7, 6, 120, 220),
    review: seq(8, 6, 150, 280)
  };

  var LINES = {
    en: [
      "Hi! I'm Soul仔 🎸",
      'Yuyang is applying for PhD · Fall 2027 ✨',
      'Try a song in the Music section ♪',
      'Also a 陶喆 fan? Say hi to Yuyang!',
      'Drag me around — I don\'t mind.',
      'Coffee chat? pengcarol7@gmail.com ☕'
    ],
    zh: [
      '嗨！我是 Soul仔 🎸',
      '雨洋正在申请 2027 Fall PhD ✨',
      '去「音乐」那里点首歌吧 ♪',
      '你也喜欢陶喆？来找雨洋聊聊！',
      '可以拖着我到处走哦～',
      '约个 coffee chat？pengcarol7@gmail.com ☕'
    ]
  };
  var MUSIC_LINES = { en: 'This one is a classic 🎶', zh: '这首太经典了 🎶' };

  var HIDE_KEY = 'pet-hidden';
  function store(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} }
  function load(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function zh() { return document.documentElement.lang === 'zh-CN'; }

  /* ---------- DOM ---------- */

  var wrap = document.createElement('div');
  wrap.className = 'pet';
  wrap.innerHTML =
    '<div class="pet__bubble" role="status" aria-live="polite"></div>' +
    '<button class="pet__close" type="button" aria-label="Hide pet">×</button>' +
    '<div class="pet__sprite" role="button" tabindex="0" aria-label="Soul仔 — a little David Tao pet. Click to chat, drag to move."></div>' +
    '<span class="pet__note" aria-hidden="true">♪</span>';
  var sprite = wrap.querySelector('.pet__sprite');
  var bubble = wrap.querySelector('.pet__bubble');
  var closeBtn = wrap.querySelector('.pet__close');

  var summon = document.createElement('button');
  summon.className = 'pet-summon';
  summon.type = 'button';
  summon.setAttribute('aria-label', 'Show pet');
  summon.textContent = '🎸';

  /* ---------- animation engine ---------- */

  var state = null, frames = [], fi = 0, timer = null, loopFrom = 0;

  function show(f) {
    sprite.style.backgroundPosition = (f.c / (COLS - 1) * 100) + '% ' + (f.r / (ROWS - 1) * 100) + '%';
  }

  // one-shot animations play three times then settle back into idle, like Codex
  function play(name, opts) {
    opts = opts || {};
    if (state === name && !opts.restart) return;
    state = name;
    clearTimeout(timer);
    var base = ANIM[name];
    if (reduceMotion) { show(base[0]); return; }
    if (name === 'idle' || opts.loop) {
      frames = base; loopFrom = 0;
    } else {
      frames = base.concat(base, base, IDLE); loopFrom = base.length * 3;
    }
    fi = 0;
    tick();
  }
  function tick() {
    show(frames[fi]);
    timer = setTimeout(function () {
      fi++;
      if (fi >= frames.length) fi = loopFrom;
      if (fi === loopFrom && loopFrom > 0) state = 'idle';
      tick();
    }, frames[fi].ms);
  }
  function stopAnim() { clearTimeout(timer); state = null; }

  /* ---------- look at the cursor (rows 9-10, 16 directions) ---------- */

  var lookTimer = null, busyUntil = 0;
  function lookAt(x, y) {
    if (musicOn || dragging || strolling || hovering || performance.now() < busyUntil) return;
    var r = sprite.getBoundingClientRect();
    var dx = x - (r.left + r.width / 2), dy = y - (r.top + r.height / 2);
    if (Math.hypot(dx, dy) < 30) return;
    var deg = (Math.atan2(dx, -dy) * 180 / Math.PI + 360) % 360;
    var o = Math.round(deg / 22.5) % 16;
    stopAnim();
    show({ r: 9 + Math.floor(o / 8), c: o % 8 });
    clearTimeout(lookTimer);
    lookTimer = setTimeout(function () { play('idle'); }, 2200);
  }

  /* ---------- speech bubble ---------- */

  var lineIdx = 0, bubbleTimer = null;
  function say(text, ms) {
    bubble.textContent = text;
    wrap.classList.add('is-talking');
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(function () { wrap.classList.remove('is-talking'); }, ms || 3600);
  }
  function nextLine() {
    busyUntil = performance.now() + 2000;
    var list = zh() ? LINES.zh : LINES.en;
    say(list[lineIdx % list.length]);
    lineIdx++;
  }

  /* ---------- position: fixed, x/y from bottom-right ---------- */

  var pos = { x: 20, y: 18 };
  function size() { return sprite.getBoundingClientRect(); }
  function clamp() {
    var r = size();
    pos.x = Math.max(4, Math.min(window.innerWidth - r.width - 4, pos.x));
    pos.y = Math.max(4, Math.min(window.innerHeight - r.height - 4, pos.y));
  }
  function place() {
    wrap.style.right = pos.x + 'px';
    wrap.style.bottom = pos.y + 'px';
    wrap.classList.toggle('is-left', pos.x > window.innerWidth / 2);
  }

  /* ---------- drag ---------- */

  var dragging = false, moved = 0, start = null, lastX = 0;
  sprite.addEventListener('pointerdown', function (e) {
    if (e.button !== 0) return;
    dragging = true; moved = 0;
    start = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y };
    lastX = e.clientX;
    sprite.setPointerCapture(e.pointerId);
    wrap.classList.add('is-drag');
    cancelStroll();
  });
  sprite.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    var dx = e.clientX - start.x, dy = e.clientY - start.y;
    moved = Math.max(moved, Math.hypot(dx, dy));
    if (moved < 4) return;
    pos.x = start.px - dx; pos.y = start.py - dy;
    clamp(); place();
    var vx = e.clientX - lastX; lastX = e.clientX;
    if (Math.abs(vx) > 1) play(vx > 0 ? 'running-right' : 'running-left', { loop: true });
  });
  function endDrag() {
    if (!dragging) return;
    dragging = false;
    wrap.classList.remove('is-drag');
    if (moved < 4) {
      play('waving', { restart: true });
      nextLine();
    } else {
      play(musicOn ? 'jumping' : 'idle', { loop: musicOn });
    }
    scheduleStroll();
  }
  sprite.addEventListener('pointerup', endDrag);
  sprite.addEventListener('pointercancel', endDrag);
  sprite.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); play('waving', { restart: true }); nextLine(); }
  });

  /* ---------- hover: jam, like Codex ---------- */

  var hovering = false;
  sprite.addEventListener('pointerenter', function (e) {
    if (e.pointerType !== 'mouse' || dragging) return;
    hovering = true;
    clearTimeout(lookTimer);
    if (!musicOn) play('jumping', { loop: true });
  });
  sprite.addEventListener('pointerleave', function (e) {
    if (e.pointerType !== 'mouse') return;
    hovering = false;
    if (!dragging && !musicOn) play('idle');
  });

  /* ---------- occasional stroll along the bottom ---------- */

  var strolling = false, strollTimer = null, raf = null;
  function scheduleStroll() {
    clearTimeout(strollTimer);
    if (reduceMotion) return;
    strollTimer = setTimeout(stroll, 14000 + Math.random() * 16000);
  }
  function cancelStroll() {
    clearTimeout(strollTimer);
    cancelAnimationFrame(raf);
    strolling = false;
  }
  function stroll() {
    if (dragging || hovering || musicOn || document.hidden) return scheduleStroll();
    var r = size();
    var maxX = Math.min(window.innerWidth - r.width - 4, 420);
    var target = 4 + Math.random() * Math.max(0, maxX - 4);
    if (Math.abs(target - pos.x) < 60) return scheduleStroll();
    strolling = true;
    // x is measured from the right edge, so a smaller x means moving right
    play(target < pos.x ? 'running-right' : 'running-left', { loop: true });
    var last = performance.now();
    (function step(now) {
      var dt = Math.min(50, now - last); last = now;
      var dir = target > pos.x ? 1 : -1;
      pos.x += dir * dt * 0.09;
      if ((dir > 0 && pos.x >= target) || (dir < 0 && pos.x <= target)) {
        pos.x = target; place();
        strolling = false;
        play('idle');
        return scheduleStroll();
      }
      place();
      raf = requestAnimationFrame(step);
    })(last);
  }

  /* ---------- react to the music player ---------- */

  var musicOn = false;
  document.addEventListener('musicstate', function (e) {
    var on = !!(e.detail && e.detail.playing);
    if (on === musicOn) return;
    musicOn = on;
    wrap.classList.toggle('is-jamming', on);
    if (on) {
      cancelStroll();
      play('jumping', { loop: true });
      say(zh() ? MUSIC_LINES.zh : MUSIC_LINES.en, 2800);
    } else {
      play('idle');
      scheduleStroll();
    }
  });

  document.addEventListener('langchange', function () { wrap.classList.remove('is-talking'); });

  /* ---------- show / hide ---------- */

  function hide() {
    store(HIDE_KEY, '1');
    wrap.classList.add('is-hidden');
    summon.classList.add('is-shown');
    cancelStroll();
    stopAnim();
  }
  function unhide() {
    store(HIDE_KEY, null);
    wrap.classList.remove('is-hidden');
    summon.classList.remove('is-shown');
    requestAnimationFrame(function () { wrap.classList.add('is-in'); });
    play('waving', { restart: true });
    nextLine();
    scheduleStroll();
  }
  closeBtn.addEventListener('click', hide);
  summon.addEventListener('click', unhide);

  /* ---------- boot after the page has loaded ---------- */

  function boot() {
    var img = new Image();
    img.onload = function () {
      sprite.style.backgroundImage = 'url(' + SHEET + ')';
      document.body.appendChild(wrap);
      document.body.appendChild(summon);
      clamp(); place();
      if (load(HIDE_KEY) === '1') {
        wrap.classList.add('is-hidden');
        summon.classList.add('is-shown');
        return;
      }
      requestAnimationFrame(function () { wrap.classList.add('is-in'); });
      play('waving', { restart: true });
      setTimeout(function () { if (!dragging) say(zh() ? LINES.zh[0] : LINES.en[0], 3200); }, 700);
      lineIdx = 1;
      scheduleStroll();
    };
    img.src = SHEET;
  }

  if (finePointer) {
    window.addEventListener('mousemove', function (e) {
      if (!wrap.isConnected || wrap.classList.contains('is-hidden')) return;
      lookAt(e.clientX, e.clientY);
    }, { passive: true });
  }
  window.addEventListener('resize', function () { if (wrap.isConnected) { clamp(); place(); } });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) cancelStroll(); else if (wrap.isConnected && !wrap.classList.contains('is-hidden')) scheduleStroll();
  });

  if (document.readyState === 'complete') setTimeout(boot, 600);
  else window.addEventListener('load', function () { setTimeout(boot, 600); });
})();
