/* ==========================================================================
   Kidrise FX — 互動及動態效果（純 JavaScript，不需外部程式庫）
   - 捲動進度條、彩紙／表情符號爆發、卡片 3D 傾斜反光、磁力按鈕
   - 標題逐字彈出、跑馬燈隨捲動加速、游標光圈、深色區聚光燈
   - Hero 字母彈跳、探索盒拖曳旋轉
   系統設定「減少動態效果」時，只保留必要功能。
   ========================================================================== */
(function () {
  "use strict";
  var doc = document;
  var root = doc.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var $$ = function (s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); };
  var raf = window.requestAnimationFrame.bind(window);
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  root.classList.add("fx");

  /* ---------- 1. 捲動進度條 ---------- */
  var bar = doc.createElement("div");
  bar.className = "fx-progress";
  bar.setAttribute("aria-hidden", "true");
  doc.body.appendChild(bar);
  var ticking = false;
  var lastY = window.scrollY;
  var velocity = 0;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    raf(function () {
      var max = root.scrollHeight - window.innerHeight;
      bar.style.transform = "scaleX(" + (max > 0 ? clamp(window.scrollY / max, 0, 1) : 0) + ")";
      velocity = window.scrollY - lastY;
      lastY = window.scrollY;
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- 2. 彩紙／表情符號爆發 ---------- */
  var COLORS = ["#ff6b57", "#ffc23d", "#1fbf9b", "#3d8bf5", "#8b6cff", "#1d1b3a"];
  var canvas, ctx, parts = [], running = false, dpr = Math.min(window.devicePixelRatio || 1, 2);
  function ensureCanvas() {
    if (canvas) return;
    canvas = doc.createElement("canvas");
    canvas.className = "fx-confetti";
    canvas.setAttribute("aria-hidden", "true");
    doc.body.appendChild(canvas);
    ctx = canvas.getContext("2d");
    var size = function () {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
    };
    size();
    window.addEventListener("resize", size);
  }
  function burst(x, y, opts) {
    if (reduce) return;
    opts = opts || {};
    ensureCanvas();
    var n = opts.count || 70;
    var power = opts.power || 11;
    var emojis = opts.emojis;
    for (var i = 0; i < n; i++) {
      var a = opts.spread ? (-Math.PI / 2) + (Math.random() - 0.5) * opts.spread : Math.random() * Math.PI * 2;
      var v = power * (0.45 + Math.random() * 0.75);
      parts.push({
        x: x, y: y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v - (opts.lift || 3),
        r: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.35,
        s: emojis ? 20 + Math.random() * 16 : 6 + Math.random() * 7,
        c: COLORS[(Math.random() * COLORS.length) | 0],
        e: emojis ? emojis[(Math.random() * emojis.length) | 0] : null,
        shape: Math.random() < 0.5 ? 0 : 1,
        life: 0,
        max: 80 + Math.random() * 50,
      });
    }
    if (!running) { running = true; raf(tick); }
  }
  function tick() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i];
      p.life++;
      p.vy += 0.32;
      p.vx *= 0.985;
      p.vy *= 0.985;
      p.x += p.vx;
      p.y += p.vy;
      p.r += p.vr;
      var alpha = 1 - Math.max(0, (p.life - p.max * 0.6) / (p.max * 0.4));
      if (p.life > p.max || p.y > window.innerHeight + 40) { parts.splice(i, 1); continue; }
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.r);
      if (p.e) {
        ctx.font = p.s + "px serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(p.e, 0, 0);
      } else {
        ctx.fillStyle = p.c;
        ctx.strokeStyle = "#1d1b3a";
        ctx.lineWidth = 1.2;
        if (p.shape) {
          ctx.beginPath(); ctx.arc(0, 0, p.s / 2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        } else {
          ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
          ctx.strokeRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
        }
      }
      ctx.restore();
    }
    if (parts.length) raf(tick); else { running = false; ctx.clearRect(0, 0, canvas.width, canvas.height); }
  }
  function burstAt(el, opts) {
    var r = el.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + Math.min(r.height / 2, 160), opts);
  }
  window.KRFX = { burst: burst, burstAt: burstAt };
  // kidrise.js 喺禮物配對完成、抽到活動時會發出呢個事件
  doc.addEventListener("kr:celebrate", function (e) {
    var d = e.detail || {};
    if (d.el) burstAt(d.el, d.opts); else burst(window.innerWidth / 2, window.innerHeight / 3, d.opts);
  });
  doc.addEventListener("click", function (e) {
    var t = e.target.closest("[data-confetti]");
    if (t) burst(e.clientX, e.clientY, { count: 60, spread: Math.PI * 0.9, power: 13 });
  });

  /* Hero：點擊拼貼會噴出玩具表情 */
  var collage = doc.querySelector(".collage");
  if (collage) {
    collage.addEventListener("click", function (e) {
      burst(e.clientX, e.clientY, { count: 18, emojis: ["🔭", "🔬", "🧩", "🌱", "⭐", "🎈", "🚀", "🦋"], power: 12, lift: 4 });
    });
  }

  /* ---------- 3. Hero 標題：逐個字母彈跳 ---------- */
  $$(".hero__title .w > span").forEach(function (word) {
    var txt = word.textContent;
    word.innerHTML = txt.split("").map(function (ch, i) {
      return '<span class="fx-lt" style="--i:' + i + '">' + ch + "</span>";
    }).join("");
  });
  if (!reduce) {
    doc.addEventListener("pointerover", function (e) {
      var lt = e.target.closest && e.target.closest(".fx-lt");
      if (!lt || lt.classList.contains("jelly")) return;
      lt.classList.add("jelly");
      lt.addEventListener("animationend", function done() { lt.classList.remove("jelly"); lt.removeEventListener("animationend", done); });
    });
  }

  /* ---------- 4. 標題逐字彈出 ---------- */
  var PUNCT = /^[，。、？！：；」』）》,.!?:;)]$/;
  // 按「字形」切字（emoji、組合字唔會被拆開），英文數字連續當一個詞
  var seg = window.Intl && Intl.Segmenter ? new Intl.Segmenter("zh-HK", { granularity: "grapheme" }) : null;
  function tokenize(str) {
    var chars = seg ? Array.from(seg.segment(str), function (x) { return x.segment; }) : Array.from(str);
    var out = [];
    chars.forEach(function (c) {
      var last = out[out.length - 1];
      var word = /^[A-Za-z0-9$+\-–.'’]$/;
      var space = /^\s+$/;
      if (last && ((word.test(c) && /^[A-Za-z0-9$+\-–.'’]+$/.test(last)) || (space.test(c) && space.test(last)))) out[out.length - 1] = last + c;
      else out.push(c);
    });
    return out;
  }
  function splitText(el) {
    var i = 0;
    var walker = doc.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    // 以標點／空格分詞組（.fx-w），詞組內逐字（.fx-ch）——保持中文唔會喺句中亂斷行
    nodes.forEach(function (node) {
      var tokens = tokenize(node.nodeValue);
      var frag = doc.createDocumentFragment();
      var word = null, prev = null;
      tokens.forEach(function (tk) {
        if (/^\s+$/.test(tk)) { frag.appendChild(doc.createTextNode(tk)); word = prev = null; return; }
        if (prev && PUNCT.test(tk)) { prev.textContent += tk; word = prev = null; return; }
        if (!word) {
          word = doc.createElement("span");
          word.className = "fx-w";
          frag.appendChild(word);
        }
        var s = doc.createElement("span");
        s.className = "fx-ch";
        s.style.setProperty("--i", i++);
        s.textContent = tk;
        word.appendChild(s);
        prev = s;
      });
      node.parentNode.replaceChild(frag, node);
    });
  }
  if (!reduce && "IntersectionObserver" in window) {
    var heads = $$(".h-lg, .phero__title, .tile__title, .cta h2");
    var hio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("fx-in"); hio.unobserve(en.target); }
      });
    }, { threshold: 0.2, rootMargin: "0px 0px -8% 0px" });
    heads.forEach(function (h) {
      if (h.closest(".hero")) return;
      h.setAttribute("aria-label", h.textContent.replace(/\s+/g, " ").trim());
      splitText(h);
      $$(".fx-w", h).forEach(function (c) { c.setAttribute("aria-hidden", "true"); });
      h.classList.add("fx-split");
      hio.observe(h);
    });
  }

  /* ---------- 5. 跑馬燈：捲得愈快、轉得愈快 ---------- */
  var bands = $$(".band");
  if (bands.length && !reduce) {
    var anims = bands.map(function (b) {
      var t = b.querySelector(".band__track");
      return t && t.getAnimations ? t.getAnimations()[0] : null;
    });
    var cur = 0;
    (function loop() {
      var target = clamp(Math.abs(velocity) / 6, 0, 5);
      cur += (target - cur) * 0.08;
      velocity *= 0.9;
      anims.forEach(function (a) { if (a) a.playbackRate = 1 + cur; });
      bands.forEach(function (b) { b.style.setProperty("--skew", (clamp(velocity, -40, 40) * -0.08).toFixed(2) + "deg"); });
      raf(loop);
    })();
  }

  if (!fine || reduce) return; // 以下效果只適用於滑鼠裝置

  /* ---------- 6. 卡片 3D 傾斜及反光 ---------- */
  var TILT = ".pcard, .tile, .skill, .tier, .acard, .res, .card";
  var active = null;
  function resetTilt(el) {
    el.style.transform = "";
    el.classList.remove("fx-tilting");
  }
  doc.addEventListener("pointermove", function (e) {
    var el = e.target.closest && e.target.closest(TILT);
    if (active && active !== el) { resetTilt(active); active = null; }
    if (!el || el.offsetWidth > 640 || el.querySelector("form, .finder__body")) return; // 大型面板及表格唔傾斜
    if (!el.querySelector(":scope > .fx-glare")) {
      var g = doc.createElement("span");
      g.className = "fx-glare";
      g.setAttribute("aria-hidden", "true");
      el.appendChild(g);
    }
    active = el;
    var r = el.getBoundingClientRect();
    var px = (e.clientX - r.left) / r.width;
    var py = (e.clientY - r.top) / r.height;
    var strength = r.width > 420 ? 4 : 8;
    el.classList.add("fx-tilting");
    el.style.transform = "perspective(900px) rotateX(" + ((0.5 - py) * strength).toFixed(2) + "deg) rotateY(" + ((px - 0.5) * strength).toFixed(2) + "deg) translateY(-6px)";
    el.style.setProperty("--gx", (px * 100).toFixed(1) + "%");
    el.style.setProperty("--gy", (py * 100).toFixed(1) + "%");
  });
  doc.addEventListener("pointerleave", function () { if (active) { resetTilt(active); active = null; } });

  /* ---------- 7. 磁力按鈕 ---------- */
  $$(".btn, .totop, .fab").forEach(function (b) {
    b.addEventListener("pointermove", function (e) {
      var r = b.getBoundingClientRect();
      var dx = e.clientX - (r.left + r.width / 2);
      var dy = e.clientY - (r.top + r.height / 2);
      b.style.translate = (dx * 0.22).toFixed(1) + "px " + (dy * 0.3).toFixed(1) + "px";
    });
    b.addEventListener("pointerleave", function () { b.style.translate = ""; });
  });

  /* ---------- 8. 游標光圈 ---------- */
  var ring = doc.createElement("div");
  ring.className = "fx-cursor";
  ring.setAttribute("aria-hidden", "true");
  ring.innerHTML = "<span></span>";
  var dot = doc.createElement("div");
  dot.className = "fx-dot";
  dot.setAttribute("aria-hidden", "true");
  doc.body.appendChild(ring);
  doc.body.appendChild(dot);
  var label = ring.firstChild;
  var mx = -100, my = -100, rx = -100, ry = -100;
  doc.addEventListener("pointermove", function (e) {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = "translate(" + mx + "px," + my + "px)";
    var t = e.target;
    var txt = "";
    var mode = "";
    if (t.closest) {
      if (t.closest(".pcard")) { mode = "big"; txt = "睇睇"; }
      else if (t.closest(".box3d-stage")) { mode = "big"; txt = "拖曳"; }
      else if (t.closest(".collage")) { mode = "big"; txt = "撳我"; }
      else if (t.closest("a, button, summary, label, input, select, textarea, [role=tab]")) mode = "link";
      else if (t.closest(".section--ink, .footer")) mode = "dark";
    }
    ring.setAttribute("data-mode", mode);
    if (label.textContent !== txt) label.textContent = txt;
  }, { passive: true });
  doc.addEventListener("pointerdown", function () { ring.classList.add("press"); });
  doc.addEventListener("pointerup", function () { ring.classList.remove("press"); });
  doc.documentElement.addEventListener("pointerleave", function () { ring.classList.add("gone"); dot.classList.add("gone"); });
  doc.documentElement.addEventListener("pointerenter", function () { ring.classList.remove("gone"); dot.classList.remove("gone"); });
  (function follow() {
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    ring.style.transform = "translate(" + rx.toFixed(1) + "px," + ry.toFixed(1) + "px)";
    raf(follow);
  })();

  /* ---------- 9. 深色區聚光燈 ---------- */
  $$(".section--ink, .footer").forEach(function (s) {
    s.classList.add("fx-spot");
    s.addEventListener("pointermove", function (e) {
      var r = s.getBoundingClientRect();
      s.style.setProperty("--mx", (e.clientX - r.left) + "px");
      s.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });

  /* ---------- 10. 探索盒：拖曳旋轉 ---------- */
  $$(".box3d-stage").forEach(function (stage) {
    var box = stage.querySelector(".box3d");
    if (!box) return;
    var rotY = 0, rotX = -18, vel = 0.36, dragging = false, sx = 0, sy = 0, lastX = 0, started = false;
    function start() {
      if (started) return;
      started = true;
      var a = box.getAnimations ? box.getAnimations()[0] : null;
      if (a && a.currentTime != null) rotY = ((a.currentTime % 16000) / 16000) * 360;
      box.style.animation = "none";
      (function spin() {
        if (!dragging) {
          rotY += vel;
          vel += (0.36 - vel) * 0.02;
          rotX += (-18 - rotX) * 0.05;
        }
        box.style.transform = "rotateX(" + rotX.toFixed(2) + "deg) rotateY(" + rotY.toFixed(2) + "deg)";
        raf(spin);
      })();
    }
    stage.classList.add("fx-drag");
    stage.addEventListener("pointerdown", function (e) {
      start();
      dragging = true;
      sx = e.clientX; sy = e.clientY; lastX = e.clientX;
      stage.setPointerCapture(e.pointerId);
      stage.classList.add("grabbing");
    });
    stage.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var dx = e.clientX - lastX;
      lastX = e.clientX;
      rotY += dx * 0.6;
      rotX = clamp(-18 - (e.clientY - sy) * 0.3, -60, 30);
      vel = dx * 0.6;
    });
    var end = function () { dragging = false; stage.classList.remove("grabbing"); };
    stage.addEventListener("pointerup", end);
    stage.addEventListener("pointercancel", end);
  });
})();
