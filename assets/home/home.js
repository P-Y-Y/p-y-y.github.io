(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;

  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function $(s, el) { return (el || document).querySelector(s); }
  function $$(s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); }

  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------------- theme ---------------- */

  function isDark() {
    var t = root.getAttribute('data-theme');
    if (t) return t === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  $('#theme-toggle').addEventListener('click', function () {
    var next = isDark() ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    net && net.recolor();
  });

  /* ---------------- scroll progress + active nav ---------------- */

  var bar = $('#progress-bar');
  var fill = $('#timeline-fill');
  var timeline = $('#timeline');
  var navLinks = $$('.nav__links a');
  var sections = navLinks.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  var ticking = false;

  function onScroll() {
    ticking = false;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = 'scaleX(' + (h > 0 ? window.scrollY / h : 0) + ')';

    var r = timeline.getBoundingClientRect();
    var p = (window.innerHeight * 0.6 - r.top) / r.height;
    fill.style.transform = 'scaleY(' + Math.max(0, Math.min(1, p)) + ')';

    var current = -1;
    sections.forEach(function (s, i) {
      if (s && s.getBoundingClientRect().top < window.innerHeight * 0.4) current = i;
    });
    navLinks.forEach(function (a, i) { a.classList.toggle('is-active', i === current); });
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------------- reveal + counters ---------------- */

  function countUp(el) {
    var target = +el.getAttribute('data-count');
    if (reduceMotion) { el.textContent = target; return; }
    var start = performance.now(), dur = 1100;
    (function step(now) {
      var t = Math.min(1, (now - start) / dur);
      el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(step);
    })(start);
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        var siblings = $$('.reveal', el.parentNode);
        var delay = Math.max(0, siblings.indexOf(el)) % 4 * 90;
        setTimeout(function () { el.classList.add('is-in'); }, reduceMotion ? 0 : delay);
        $$('[data-count]', el).forEach(countUp);
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    $$('.reveal').forEach(function (el) { io.observe(el); });
  } else {
    $$('.reveal').forEach(function (el) { el.classList.add('is-in'); });
    $$('[data-count]').forEach(countUp);
  }

  /* ---------------- hero typewriter ---------------- */

  (function typer() {
    var el = $('#typer');
    var words = JSON.parse(el.getAttribute('data-words'));
    if (reduceMotion) return;
    var i = 0;
    (async function loop() {
      for (;;) {
        await sleep(2400);
        var w = el.textContent;
        for (var k = w.length; k >= 0; k--) { el.textContent = w.slice(0, k); await sleep(28); }
        i = (i + 1) % words.length;
        var n = words[i];
        for (var j = 1; j <= n.length; j++) { el.textContent = n.slice(0, j); await sleep(55 + Math.random() * 45); }
      }
    })();
  })();

  /* ---------------- agent demo ---------------- */

  (function agentDemo() {
    var screen = $('#agent-screen');
    var cursor = $('#agent-cursor');
    var log = $('#agent-log');
    var query = $('#agent-query');
    var search = $('.agent__search', screen);
    var visible = true;

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(screen);
    }

    function line(cls, html) {
      var d = document.createElement('div');
      d.className = cls;
      d.innerHTML = html;
      log.appendChild(d);
      while (log.children.length > 5) log.removeChild(log.firstChild);
    }

    function pointOf(el) {
      var s = screen.getBoundingClientRect(), r = el.getBoundingClientRect();
      return {
        x: r.left - s.left + r.width * (0.35 + Math.random() * 0.3),
        y: r.top - s.top + r.height * (0.4 + Math.random() * 0.25)
      };
    }

    function moveTo(p) {
      cursor.style.transform = 'translate(' + (p.x - 4) + 'px,' + (p.y - 2) + 'px)';
      return sleep(950);
    }

    async function click(el, p) {
      el.classList.add('is-press');
      var r = document.createElement('span');
      r.className = 'ripple';
      r.style.left = p.x + 'px';
      r.style.top = p.y + 'px';
      screen.appendChild(r);
      setTimeout(function () { r.remove(); }, 650);
      await sleep(160);
      el.classList.remove('is-press');
    }

    // coordinates are shown on the 0–999 grid the agent "sees"
    function grid(p) {
      var w = screen.clientWidth, h = screen.clientHeight;
      return Math.round(p.x / w * 999) + ', ' + Math.round(p.y / h * 999);
    }

    var tasks = [
      {
        goal: 'find her latest paper',
        q: 'yuyang peng publications',
        tile: 'publications',
        think: 'Publications tile should list papers',
        obs: 'KDD 2026 · CoAct (first author)'
      },
      {
        goal: 'what is she working on now?',
        q: 'current research',
        tile: 'research',
        think: 'Research tile has the timeline',
        obs: 'Computer-use agents @ USC'
      },
      {
        goal: 'any competition results?',
        q: 'awards',
        tile: 'honors',
        think: 'Honors tile mentions ICPC',
        obs: 'ICPC silver · CCPC gold · NOI bronze'
      },
      {
        goal: 'how do I reach her?',
        q: 'contact',
        tile: 'contact',
        think: 'Contact tile → email',
        obs: 'pengcarol7@gmail.com'
      }
    ];

    if (reduceMotion) {
      line('k-think', '# computer-use agent demo (motion reduced)');
      line('k-obs', '✓ 4 tiles · click one to jump');
      return;
    }

    (async function run() {
      await sleep(900);
      for (var i = 0; ; i = (i + 1) % tasks.length) {
        while (!visible || document.hidden) await sleep(400);
        var t = tasks[i];
        line('k-think', '# task: ' + t.goal);

        var sp = pointOf(search);
        await moveTo(sp);
        await click(search, sp);
        line('k-act', 'click(<b>' + grid(sp) + '</b>)');
        search.classList.add('is-focus');
        query.textContent = '';
        for (var c = 1; c <= t.q.length; c++) { query.textContent = t.q.slice(0, c); await sleep(45 + Math.random() * 40); }
        line('k-act', 'type(<b>"' + t.q + '"</b>)');
        await sleep(350);
        search.classList.remove('is-focus');

        var tile = $('[data-target="' + t.tile + '"]', screen);
        line('k-think', '# ' + t.think);
        var tp = pointOf(tile);
        await moveTo(tp);
        tile.classList.add('is-hover');
        await sleep(250);
        await click(tile, tp);
        line('k-act', 'click(<b>' + grid(tp) + '</b>)');
        await sleep(300);
        line('k-obs', '✓ ' + t.obs);
        await sleep(1500);
        tile.classList.remove('is-hover');
      }
    })();
  })();

  /* ---------------- publication filters ---------------- */

  $$('.filter').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var f = btn.getAttribute('data-filter');
      $$('.filter').forEach(function (b) { b.classList.toggle('is-active', b === btn); });
      $$('.pub').forEach(function (p) {
        var show = f === 'all' || p.getAttribute('data-tags').split(' ').indexOf(f) >= 0;
        p.classList.toggle('is-hidden', !show);
        if (show) p.classList.add('is-in');
      });
    });
  });

  /* ---------------- card tilt ---------------- */

  if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
    $$('.pub').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        if (!card.classList.contains('is-in')) return;
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        card.classList.add('is-tilting');
        card.style.transform = 'perspective(1100px) rotateX(' + (-y * 4) + 'deg) rotateY(' + (x * 5) + 'deg) translateY(-3px)';
      });
      card.addEventListener('mouseleave', function () {
        card.classList.remove('is-tilting');
        card.style.transform = '';
      });
    });
  }

  /* ---------------- background agent network ---------------- */

  var net = (function () {
    var canvas = $('#net');
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W, H, nodes = [], mouse = { x: -9999, y: -9999 }, rgb = '79, 70, 229', running = true;

    function recolor() {
      rgb = getComputedStyle(root).getPropertyValue('--net').trim() || rgb;
      if (reduceMotion) draw();
    }

    function resize() {
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(70, Math.max(26, W * H / 22000)));
      nodes = [];
      for (var i = 0; i < n; i++) {
        nodes.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
          r: Math.random() * 1.6 + 0.8,
          hub: Math.random() < 0.12
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      var link = Math.min(170, W / 7);
      for (var i = 0; i < nodes.length; i++) {
        var a = nodes[i];
        for (var j = i + 1; j < nodes.length; j++) {
          var b = nodes[j], dx = a.x - b.x, dy = a.y - b.y, d = Math.sqrt(dx * dx + dy * dy);
          if (d < link) {
            ctx.strokeStyle = 'rgba(' + rgb + ',' + (0.16 * (1 - d / link)) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        var md = Math.hypot(a.x - mouse.x, a.y - mouse.y);
        if (md < 200) {
          ctx.strokeStyle = 'rgba(' + rgb + ',' + (0.35 * (1 - md / 200)) + ')';
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        }
      }
      for (var k = 0; k < nodes.length; k++) {
        var p = nodes[k];
        ctx.fillStyle = 'rgba(' + rgb + ',' + (p.hub ? 0.55 : 0.35) + ')';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.hub ? p.r + 1.6 : p.r, 0, Math.PI * 2); ctx.fill();
      }
    }

    function tick() {
      if (!running) return;
      for (var i = 0; i < nodes.length; i++) {
        var p = nodes[i];
        var dx = mouse.x - p.x, dy = mouse.y - p.y, d = Math.hypot(dx, dy);
        if (d < 200 && d > 1) { p.vx += dx / d * 0.012; p.vy += dy / d * 0.012; }
        p.vx *= 0.99; p.vy *= 0.99;
        if (Math.hypot(p.vx, p.vy) < 0.08) { p.vx += (Math.random() - 0.5) * 0.04; p.vy += (Math.random() - 0.5) * 0.04; }
        p.x += p.vx; p.y += p.vy;
        if (p.x < -20) p.x = W + 20; if (p.x > W + 20) p.x = -20;
        if (p.y < -20) p.y = H + 20; if (p.y > H + 20) p.y = -20;
      }
      draw();
      requestAnimationFrame(tick);
    }

    window.addEventListener('mousemove', function (e) { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
    document.addEventListener('mouseleave', function () { mouse.x = mouse.y = -9999; });
    window.addEventListener('resize', function () { resize(); if (reduceMotion) draw(); });
    document.addEventListener('visibilitychange', function () {
      var was = running;
      running = !document.hidden;
      if (running && !was && !reduceMotion) requestAnimationFrame(tick);
    });
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', recolor);

    resize(); recolor();
    if (reduceMotion) draw(); else requestAnimationFrame(tick);
    return { recolor: recolor };
  })();

  /* ---------------- easter egg: press g for a guided agent tour ---------------- */

  (function tour() {
    var active = false, cancel = false;
    var stops = [
      ['#about .section__head h2', 'observe(about)'],
      ['#research .tl__card', 'click(current_research)'],
      ['#publications .pub h3', 'click(latest_paper)'],
      ['#honors .honor', 'observe(awards)'],
      ['#contact .contact__mail', 'hover(email) — done ✓']
    ];

    function stop() { cancel = true; }

    async function run() {
      active = true; cancel = false;
      var c = document.createElement('div');
      c.className = 'tour-cursor';
      c.innerHTML = $('#agent-cursor').innerHTML + '<span class="tour-label">agent: tour started</span>';
      document.body.appendChild(c);
      var label = $('.tour-label', c);
      c.style.transform = 'translate(' + (window.innerWidth / 2) + 'px,' + (window.innerHeight / 2) + 'px)';
      window.addEventListener('wheel', stop, { once: true, passive: true });
      window.addEventListener('touchstart', stop, { once: true, passive: true });
      await sleep(500);

      for (var i = 0; i < stops.length && !cancel; i++) {
        var el = $(stops[i][0]);
        label.textContent = 'scroll(down)';
        el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
        await sleep(900);
        if (cancel) break;
        var r = el.getBoundingClientRect();
        var x = r.left + Math.min(r.width * 0.5, 160), y = r.top + Math.min(r.height * 0.5, 30);
        c.style.transform = 'translate(' + x + 'px,' + y + 'px)';
        label.textContent = stops[i][1];
        await sleep(1050);
        var rp = document.createElement('span');
        rp.className = 'ripple tour-ripple';
        rp.style.left = x + 'px'; rp.style.top = y + 'px';
        document.body.appendChild(rp);
        setTimeout(function (n) { n.remove(); }.bind(null, rp), 650);
        await sleep(900);
      }
      c.style.opacity = '0';
      setTimeout(function () { c.remove(); }, 400);
      active = false;
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { stop(); return; }
      if (e.key !== 'g' || e.metaKey || e.ctrlKey || e.altKey || active) return;
      var tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      run();
    });
  })();
})();
