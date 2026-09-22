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

  /* ---------------- language (EN / 中文) ---------------- */

  var ZH = {
    "pub.also": "早期版本发表于 <b>CVPR 2025 Workshop</b>：",
    "mu.s1": "无缘",
    "mu.a1": "太平盛世 · 2005",
    "mu.a2": "黑色柳丁 · 2002",
    "mu.s3": "Susan说",
    "mu.a3": "太平盛世 · 2005",
    "nav.about": "关于",
    "nav.research": "研究",
    "nav.publications": "论文",
    "nav.honors": "荣誉",
    "nav.music": "音乐",
    "nav.contact": "联系",
    "hero.callout": "<strong>正在申请 2027 Fall 博士项目。</strong>非常欢迎约 coffee chat，也期待各种合作机会，随时联系我！",
    "hero.tag": "我希望让 AI agent",
    "hero.sub": "<strong>华中科技大学</strong>计算机专业本科生，目前在 <strong>USC</strong> 跟随 Jieyu Zhao 教授做科研实习。",
    "hero.cta1": "看看我的工作",
    "hero.cta2": "联系我",
    "tile.pub": "论文",
    "tile.pubm": "3 篇论文 + 1 个项目",
    "tile.res": "研究",
    "tile.resm": "3 段经历",
    "tile.hon": "荣誉",
    "tile.con": "联系",
    "tile.conm": "打个招呼",
    "about.h": "关于我",
    "about.loc": "📍 中国 · 武汉",
    "about.lead": "你好！我是彭雨洋，华中科技大学计算机科学与技术专业（图灵班）大四学生。我好奇机器如何<em>感知</em>一个不断变化的世界，并在其中<em>行动</em>——从回答关于今日新闻图片的问题，到协调成群的 LLM agent，再到操作真实的桌面软件。",
    "about.p2": "我目前专注于<strong>计算机操作智能体（Computer-Use Agents）</strong>：大规模合成 GUI 训练数据，并用强化学习教会 agent 完成复杂的多步任务。在此之前我一直参加算法竞赛（NOI、ICPC、CCPC），这段经历至今影响着我思考系统与效率的方式。",
    "chip.c1": "多模态学习",
    "chip.c2": "计算机视觉",
    "chip.c3": "LLM 智能体",
    "chip.c4": "计算机操作智能体",
    "chip.c5": "强化学习",
    "stat.s1": "篇论文 · 另有 1 个开源项目",
    "stat.s2": "第一 / 共同第一作者",
    "stat.s3": "段科研实习",
    "stat.s4": "项竞赛奖牌与荣誉",
    "res.h": "科研经历",
    "res.d1": "2026.02 — 至今",
    "res.now": "● 进行中",
    "res.t1": "计算机操作智能体",
    "res.o1": "科研实习 · Jieyu Zhao 教授 · 南加州大学（USC）",
    "res.b11": "面向计算机操作智能体的 GUI 合成数据生成与强化学习训练方法。",
    "res.b12": "搭建自动化数据合成流水线，提升 agent 在复杂 GUI 任务上的策略学习效果。",
    "res.d2": "2025.08 — 2026.02",
    "res.g2": "KDD 2026 · 第一作者",
    "res.t2": "CoAct：LLM Agent 并行执行",
    "res.o2": "科研实习 · Qinbin Li 教授 · 华中科技大学",
    "res.b21": "提出基于对比式任务分配的在线调度框架。",
    "res.b22": "降低节点间通信开销，提升 LLM agent 的并行执行效率。",
    "res.d3": "2024.12 — 2025.08",
    "res.g3": "NeurIPS 2025 · 共同第一作者",
    "res.t3": "LiveVQA：实时视觉知识",
    "res.o3": "科研实习 · Yao Wan 教授 · 华中科技大学",
    "res.b31": "构建大规模开放数据集，评测模型对最新视觉信息的理解能力。",
    "res.b32": "开发并开源评测工具包，保证研究可复现。",
    "res.d4": "2023.09 — 2027.06（预计）",
    "res.g4": "教育经历",
    "res.t4": "计算机科学与技术 · 工学学士（图灵班）",
    "res.o4": "华中科技大学 · 武汉",
    "pub.h": "论文与项目",
    "pub.fa": "全部",
    "pub.ff": "第一 / 共同一作",
    "pub.fg": "智能体",
    "pub.fv": "多模态",
    "pub.note": "<sup>*</sup> 共同第一作者",
    "pub.oss": "开源项目",
    "pub.cvpr": "CVPR 2025 Workshop",
    "pub.code": "代码",
    "pub.web": "项目主页",
    "pub.data": "数据",
    "hon.h": "荣誉奖项",
    "hon.t1": "CCF 优秀大学生",
    "hon.o1": "中国计算机学会",
    "hon.t2": "金牌",
    "hon.o2": "CCPC 女生专场",
    "hon.t3": "银牌",
    "hon.o3": "ICPC 亚洲区域赛 · 沈阳站",
    "hon.t4": "铜牌",
    "hon.o4": "全国青少年信息学奥林匹克竞赛（NOI）",
    "mu.h": "工作之外",
    "mu.t": "我是<span class=\"grad\">陶喆</span>的超级粉丝。",
    "mu.p": "做研究的时候、走在路上、想放松一下的时候，耳机里常常都是他的歌。这几首可以单曲循环一整天：",
    "mu.note": "30 秒试听来自 Apple Music · 点 ↗ 听完整版",
    "mu.cta": "你也喜欢陶喆？来和我聊聊音乐吧 <span aria-hidden=\"true\">→</span>",
    "con.e": "<span class=\"dot\"></span> 正在寻找 2027 Fall 博士机会",
    "con.t": "一起打造<br><span class=\"grad\">真正有用的 agent。</span>",
    "foot.hint": "小彩蛋：按一下 <kbd>g</kbd> 试试"
  };

  var lang = 'en';
  try { lang = new URLSearchParams(location.search).get('lang') || localStorage.getItem('lang') || 'en'; } catch (e) {}
  if (lang !== 'zh') lang = 'en';
  function isZh() { return lang === 'zh'; }

  function applyLang() {
    $$('[data-i18n]').forEach(function (el) {
      if (el.dataset.en === undefined) el.dataset.en = el.innerHTML;
      var zh = ZH[el.getAttribute('data-i18n')];
      el.innerHTML = isZh() && zh !== undefined ? zh : el.dataset.en;
    });
    root.setAttribute('lang', isZh() ? 'zh-CN' : 'en');
    document.title = isZh() ? '彭雨洋 · Yuyang Peng' : 'Yuyang Peng · 彭雨洋';
    var btn = $('#lang-toggle');
    btn.textContent = isZh() ? 'EN' : '中';
    btn.setAttribute('aria-label', isZh() ? 'Switch to English' : '切换到中文');
    document.dispatchEvent(new Event('langchange'));
  }
  $('#lang-toggle').addEventListener('click', function () {
    lang = isZh() ? 'en' : 'zh';
    try { localStorage.setItem('lang', lang); } catch (e) {}
    applyLang();
  });
  applyLang();

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
    var wordsEn = JSON.parse(el.getAttribute('data-words'));
    var wordsZh = JSON.parse(el.getAttribute('data-words-zh'));
    function words() { return isZh() ? wordsZh : wordsEn; }
    var i = 0;
    el.textContent = words()[0];
    document.addEventListener('langchange', function () { el.textContent = words()[i % words().length]; });
    if (reduceMotion) return;
    (async function loop() {
      for (;;) {
        await sleep(2400);
        var w = el.textContent;
        for (var k = w.length; k >= 0; k--) { el.textContent = w.slice(0, k); await sleep(28); }
        i = (i + 1) % words().length;
        var n = words()[i];
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
        obs: 'KDD 2026 · CoAct (first author)',
        zh: { goal: '找到她最新的论文', q: '彭雨洋 论文', think: '「论文」磁贴里应该有列表', obs: 'KDD 2026 · CoAct（第一作者）' }
      },
      {
        goal: 'what is she working on now?',
        q: 'current research',
        tile: 'research',
        think: 'Research tile has the timeline',
        obs: 'Computer-use agents @ USC',
        zh: { goal: '她现在在做什么研究？', q: '当前研究', think: '「研究」磁贴里有时间线', obs: '计算机操作智能体 @ USC' }
      },
      {
        goal: 'any competition results?',
        q: 'awards',
        tile: 'honors',
        think: 'Honors tile mentions ICPC',
        obs: 'ICPC silver · CCPC gold · NOI bronze',
        zh: { goal: '有竞赛成绩吗？', q: '获奖', think: '「荣誉」磁贴提到了 ICPC', obs: 'ICPC 银牌 · CCPC 金牌 · NOI 铜牌' }
      },
      {
        goal: 'how do I reach her?',
        q: 'contact',
        tile: 'contact',
        think: 'Contact tile → email',
        obs: 'pengcarol7@gmail.com',
        zh: { goal: '怎么联系她？', q: '联系方式', think: '「联系」磁贴 → 邮箱', obs: 'pengcarol7@gmail.com' }
      }
    ];

    if (reduceMotion) {
      line('k-think', isZh() ? '# 计算机操作智能体演示（已减少动画）' : '# computer-use agent demo (motion reduced)');
      line('k-obs', isZh() ? '✓ 4 个磁贴 · 点击跳转' : '✓ 4 tiles · click one to jump');
      return;
    }

    (async function run() {
      await sleep(900);
      for (var i = 0; ; i = (i + 1) % tasks.length) {
        while (!visible || document.hidden) await sleep(400);
        var t = isZh() ? Object.assign({}, tasks[i], tasks[i].zh) : tasks[i];
        line('k-think', (isZh() ? '# 任务：' : '# task: ') + t.goal);

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

  /* ---------------- music player (Apple Music previews) ---------------- */

  (function musicPlayer() {
    var box = $('#music-player');
    if (!box) return;
    var rows = $$('#playlist li');
    var status = $('#music-status');
    var audio = new Audio();
    audio.preload = 'none';
    var current = -1, retried = {}, loading = false;

    function title(i) { return $('.playlist__t', rows[i]).textContent; }

    function render() {
      var playing = !audio.paused && current >= 0;
      box.classList.toggle('is-playing', playing);
      rows.forEach(function (r, i) {
        r.classList.toggle('is-current', i === current);
        r.classList.toggle('is-playing', playing && i === current);
        if (i !== current) r.style.setProperty('--p', 0);
      });
      var L = isZh()
        ? { idle: '点一首歌试听', load: '加载中 · ', play: '正在播放 · ', pause: '已暂停 · ' }
        : { idle: 'Tap a song to play a preview', load: 'Loading · ', play: 'Now playing · ', pause: 'Paused · ' };
      document.dispatchEvent(new CustomEvent('musicstate', { detail: { playing: playing } }));
      status.textContent = current < 0 ? L.idle
        : (playing ? (loading ? L.load : L.play) : L.pause) + title(current);
    }

    function load(i) {
      current = i;
      loading = true;
      audio.src = rows[i].getAttribute('data-src');
      var p = audio.play();
      if (p && p.catch) p.catch(function () { render(); });
      render();
    }

    function toggle(i) {
      if (i === current) {
        if (audio.paused) audio.play(); else audio.pause();
      } else {
        load(i);
      }
    }

    // preview URLs can rotate; refresh from the iTunes lookup API once on failure
    audio.addEventListener('error', function () {
      var i = current, id = rows[i] && rows[i].getAttribute('data-id');
      if (!id || retried[id]) { status.textContent = isZh() ? '暂时无法试听，请点 ↗ 听完整版' : 'Preview unavailable — try the ↗ link'; box.classList.remove('is-playing'); return; }
      retried[id] = true;
      fetch('https://itunes.apple.com/lookup?country=tw&id=' + id)
        .then(function (r) { return r.json(); })
        .then(function (d) {
          var url = d.results && d.results[0] && d.results[0].previewUrl;
          if (!url) throw new Error('no preview');
          rows[i].setAttribute('data-src', url);
          if (current === i) load(i);
        })
        .catch(function () { status.textContent = isZh() ? '暂时无法试听，请点 ↗ 听完整版' : 'Preview unavailable — try the ↗ link'; });
    });
    audio.addEventListener('play', render);
    audio.addEventListener('playing', function () { loading = false; render(); });
    audio.addEventListener('waiting', function () { loading = true; render(); });
    audio.addEventListener('pause', render);
    audio.addEventListener('timeupdate', function () {
      if (current >= 0 && audio.duration) rows[current].style.setProperty('--p', audio.currentTime / audio.duration);
    });
    audio.addEventListener('ended', function () {
      rows[current].style.setProperty('--p', 0);
      if (current < rows.length - 1) load(current + 1);
      else { current = -1; render(); }
    });

    document.addEventListener('langchange', render);
    render();

    rows.forEach(function (r, i) {
      $('.playlist__btn', r).addEventListener('click', function () { toggle(i); });
    });
    $('#music-art').addEventListener('click', function () { toggle(current < 0 ? 0 : current); });
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
        // scroll only the window: scrollIntoView would also scroll overflow:hidden cards
        var er = el.getBoundingClientRect();
        window.scrollTo({ top: window.scrollY + er.top - (window.innerHeight - er.height) / 2, behavior: reduceMotion ? 'auto' : 'smooth' });
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
