/* ==========================================================================
   Kidrise — kidrise.com.hk 互動功能
   ========================================================================== */
(function () {
  "use strict";
  document.documentElement.classList.remove("no-js");

  /* ---------- 基本設定（如有更改，只需修改這裡） ---------- */
  var KR = (window.KR = {
    shop: "https://stemtoy.com.hk",
    whatsapp: "85266721884",
    email: "contact@kidrise.com.hk",
    utm: function (campaign) {
      return "utm_source=kidrise.com.hk&utm_medium=referral&utm_campaign=" + encodeURIComponent(campaign || "brand_site");
    },
    productUrl: function (handle, campaign) {
      return KR.shop + "/products/" + handle + "?" + KR.utm(campaign);
    },
    collectionUrl: function (handle, campaign) {
      return KR.shop + "/collections/" + encodeURIComponent(handle) + "?" + KR.utm(campaign);
    },
  });

  var AREAS = {
    sensory: { zh: "感官探索", color: "coral" },
    motor: { zh: "手眼協調", color: "sun" },
    build: { zh: "拼砌建構", color: "sky" },
    pretend: { zh: "角色扮演", color: "lilac" },
    logic: { zh: "邏輯思維", color: "mint" },
    science: { zh: "科學探索", color: "sky" },
    game: { zh: "親子桌遊", color: "coral" },
  };
  var AGE_LABEL = { "1-2": "1–2 歲", "3-5": "3–5 歲", "6-8": "6–8 歲", "9+": "9 歲+" };
  var AGE_COLLECTION = { "1-2": "適合0-3歲", "3-5": "適合3-6歲", "6-8": "適合6-11歲", "9+": "適合11-歲" };

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  var money = function (n) { return "HK$" + Math.round(n).toLocaleString("en-HK"); };
  var PRODUCTS = window.KR_PRODUCTS || [];

  /* ---------- Toast ---------- */
  var toastEl;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      toastEl.setAttribute("role", "status");
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(function () { toastEl.classList.remove("show"); }, 3200);
  }
  KR.toast = toast;

  /* ---------- Nav ---------- */
  var nav = $(".nav");
  if (nav) {
    var burger = $(".burger", nav);
    var onScroll = function () {
      nav.classList.toggle("is-scrolled", window.scrollY > 10);
      var tt = $(".totop");
      if (tt) tt.classList.toggle("show", window.scrollY > 900);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    if (burger) {
      burger.addEventListener("click", function () {
        var open = nav.classList.toggle("is-open");
        burger.setAttribute("aria-expanded", open ? "true" : "false");
        document.documentElement.style.overflow = open ? "hidden" : "";
      });
      $$(".nav__links a", nav).forEach(function (a) {
        a.addEventListener("click", function () {
          nav.classList.remove("is-open");
          burger.setAttribute("aria-expanded", "false");
          document.documentElement.style.overflow = "";
        });
      });
    }
  }
  var totop = $(".totop");
  if (totop) totop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });

  /* ---------- Reveal + counters ---------- */
  function countUp(el) {
    var to = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    var dur = 1600, t0 = null;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * e).toLocaleString("en-HK") + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add("in");
        $$("[data-count]", en.target).concat(en.target.hasAttribute("data-count") ? [en.target] : []).forEach(function (c) {
          if (!c._done) { c._done = true; countUp(c); }
        });
        io.unobserve(en.target);
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -40px 0px" });
    $$(".reveal, [data-count]").forEach(function (el) { io.observe(el); });
  } else {
    $$(".reveal").forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Rotating words ---------- */
  $$(".rot").forEach(function (rot) {
    var words = $$("span", rot);
    var i = 0;
    words[0].classList.add("on");
    if (words.length < 2) return;
    setInterval(function () {
      var cur = words[i];
      cur.classList.remove("on");
      cur.classList.add("out");
      i = (i + 1) % words.length;
      var nxt = words[i];
      nxt.classList.remove("out");
      void nxt.offsetWidth;
      nxt.classList.add("on");
      setTimeout(function () { cur.classList.remove("out"); }, 650);
    }, 2600);
  });

  /* ---------- Parallax (hero) ---------- */
  var par = $("[data-parallax]");
  if (par && window.matchMedia("(pointer: fine)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var items = $$("[data-depth]", par);
    par.addEventListener("mousemove", function (e) {
      var r = par.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      items.forEach(function (it) {
        var d = parseFloat(it.getAttribute("data-depth"));
        it.style.translate = (x * d * 40).toFixed(1) + "px " + (y * d * 40).toFixed(1) + "px";
      });
    });
    par.addEventListener("mouseleave", function () {
      items.forEach(function (it) { it.style.translate = ""; });
    });
  }

  /* ---------- Product cards ---------- */
  function productCard(p, campaign) {
    var badges = "";
    if (p.own) badges += '<span class="chip chip--ink">Kidrise 自家品牌</span>';
    if (p.area && AREAS[p.area]) badges += '<span class="chip chip--' + AREAS[p.area].color + '">' + AREAS[p.area].zh + "</span>";
    var ages = (p.ages || []).map(function (a) { return "<span>" + (AGE_LABEL[a] || a) + "</span>"; }).join("");
    var compare = p.c && p.c > p.p ? "<s>" + money(p.c) + "</s>" : "";
    return (
      '<a class="pcard" href="' + esc(KR.productUrl(p.h, campaign)) + '" target="_blank" rel="noopener" title="' + esc(p.full) + '">' +
      '<div class="pcard__img"><img loading="lazy" decoding="async" src="' + esc(p.img) + '" alt="' + esc(p.n) + '" width="640" height="640"><div class="pcard__badges">' + badges + "</div></div>" +
      '<div class="pcard__body"><div class="pcard__name">' + esc(p.n) + "</div>" +
      '<div class="pcard__ages">' + ages + "</div>" +
      '<div class="pcard__foot"><div class="pcard__price">' + compare + money(p.p) + "</div>" +
      '<span class="pcard__go" aria-hidden="true">' + ARROW + "</span></div></div></a>"
    );
  }
  var ARROW = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  KR.productCard = productCard;

  function render(el, list, campaign) {
    if (!el) return;
    if (!list.length) {
      el.innerHTML = '<div class="finder__empty" style="grid-column:1/-1">暫時未有符合條件的精選，請試試其他篩選，或直接<a class="mark" href="' + esc(KR.collectionUrl("all", campaign)) + '" target="_blank" rel="noopener">瀏覽全部玩具</a>。</div>';
      return;
    }
    el.innerHTML = list.map(function (p) { return productCard(p, campaign); }).join("");
  }

  // Static grids: <div data-products="own|area:science|handles:a,b" data-limit="8">
  $$("[data-products]").forEach(function (el) {
    var spec = el.getAttribute("data-products");
    var limit = parseInt(el.getAttribute("data-limit") || "8", 10);
    var campaign = el.getAttribute("data-campaign") || "brand_site";
    var list = PRODUCTS.slice();
    if (spec === "own") list = list.filter(function (p) { return p.own; });
    else if (spec.indexOf("area:") === 0) {
      var a = spec.slice(5).split(",");
      list = list.filter(function (p) { return a.indexOf(p.area) > -1; });
    } else if (spec.indexOf("handles:") === 0) {
      var hs = spec.slice(8).split(",");
      list = hs.map(function (h) { return PRODUCTS.filter(function (p) { return p.h === h; })[0]; }).filter(Boolean);
    } else if (spec.indexOf("max:") === 0) {
      var mx = parseFloat(spec.slice(4));
      list = list.filter(function (p) { return p.p <= mx; });
    }
    render(el, list.slice(0, limit), campaign);
  });

  /* ---------- Age tabs ---------- */
  var AGE_INFO = {
    "1-2": {
      title: "1–2 歲：用五感認識世界",
      lede: "這個階段的孩子透過觸摸、聆聽、抓握去理解世界。玩具宜簡單、耐用、沒有細小零件。",
      points: ["感官刺激：布書、手敲琴、不同材質", "大肌肉與小手肌：抓握、拔插、敲打", "因果關係：「我按一下，就會發生事情」"],
      tip: "家長小貼士：每次只放 2–3 件玩具，孩子會玩得更專注。",
    },
    "3-5": {
      title: "3–5 歲：小手更靈活，開始講規則",
      lede: "孩子開始享受配對、分類和簡單規則遊戲，也最喜歡扮演大人的角色。",
      points: ["手眼協調：迷宮、扭螺絲、夾子遊戲", "邏輯啟蒙：顏色形狀配對、數數", "社交與語言：角色扮演、合作型桌遊"],
      tip: "家長小貼士：選擇可以一起玩 15 分鐘的遊戲，比單人玩具更受歡迎。",
    },
    "6-8": {
      title: "6–8 歲：動手做實驗，問「點解？」",
      lede: "升上小學後，孩子對「點解會咁」充滿好奇，正是建立科學思維和解難能力的黃金期。",
      points: ["科學探索：顯微鏡、望遠鏡、光與影", "工程思維：木模型、機械結構、拼砌", "策略與數學：桌遊、磁力拼圖"],
      tip: "家長小貼士：配合小學科學科課題（如光、植物、簡單電路）選玩具，學校學到的會更深刻。",
    },
    "9+": {
      title: "9 歲+：挑戰更難的專案",
      lede: "高小孩子需要有挑戰性、可以完成一個「作品」的專案，成就感是最大的動力。",
      points: ["進階工程：液壓、太陽能、機械人", "觀察記錄：數碼顯微鏡、觀星任務", "策略桌遊：數學、推理、合作"],
      tip: "家長小貼士：讓孩子把作品拍片或寫觀察日記，學習成果會更持久。",
    },
  };

  $$("[data-agetabs]").forEach(function (root) {
    var tabs = $$(".agetab", root);
    var grid = $("[data-age-grid]", root);
    var info = $("[data-age-info]", root);
    var limit = parseInt(root.getAttribute("data-limit") || "6", 10);
    var campaign = root.getAttribute("data-campaign") || "age_tabs";
    function show(age) {
      tabs.forEach(function (t) { t.setAttribute("aria-selected", t.getAttribute("data-age") === age ? "true" : "false"); });
      var d = AGE_INFO[age];
      if (info && d) {
        info.innerHTML =
          '<span class="chip chip--mint">' + AGE_LABEL[age] + "</span>" +
          '<h3 class="mt-1">' + esc(d.title) + "</h3>" +
          '<p class="muted small">' + esc(d.lede) + "</p>" +
          "<ul>" + d.points.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>" +
          '<p class="notice">' + esc(d.tip) + "</p>" +
          '<a class="btn btn--coral btn--sm mt-1" target="_blank" rel="noopener" href="' + esc(KR.collectionUrl(AGE_COLLECTION[age], campaign)) + '">瀏覽 ' + AGE_LABEL[age] + ' 全部玩具 <span class="arr">→</span></a>';
      }
      var list = PRODUCTS.filter(function (p) { return (p.ages || []).indexOf(age) > -1; });
      // 先顯示自家品牌，再按價格由低至高
      list.sort(function (a, b) { return (b.own ? 1 : 0) - (a.own ? 1 : 0) || a.p - b.p; });
      render(grid, list.slice(0, limit), campaign);
      if (grid) { grid.classList.remove("flipin"); void grid.offsetWidth; }
    }
    tabs.forEach(function (t) {
      t.addEventListener("click", function () { show(t.getAttribute("data-age")); });
    });
    show(root.getAttribute("data-default") || "3-5");
  });

  /* ---------- Play page: filter grid ---------- */
  var pf = $("[data-play-filter]");
  if (pf) {
    var state = { age: "all", area: "all", price: "all" };
    var grid = $("[data-play-grid]", pf);
    var count = $("[data-play-count]", pf);
    var priceOk = function (p) {
      if (state.price === "all") return true;
      var r = state.price.split("-");
      return p.p >= parseFloat(r[0]) && p.p <= parseFloat(r[1]);
    };
    function apply() {
      var list = PRODUCTS.filter(function (p) {
        return (state.age === "all" || p.ages.indexOf(state.age) > -1) && (state.area === "all" || p.area === state.area) && priceOk(p);
      });
      list.sort(function (a, b) { return (b.own ? 1 : 0) - (a.own ? 1 : 0) || a.p - b.p; });
      render(grid, list, "play_filter");
      if (count) count.textContent = list.length;
    }
    $$("[data-filter]", pf).forEach(function (b) {
      b.addEventListener("click", function () {
        var key = b.getAttribute("data-filter");
        state[key] = b.getAttribute("data-value");
        $$('[data-filter="' + key + '"]', pf).forEach(function (o) { o.setAttribute("aria-pressed", o === b ? "true" : "false"); });
        apply();
      });
    });
    // deep link: play.html#area=science
    var hash = location.hash.replace("#", "");
    hash.split("&").forEach(function (kv) {
      var p = kv.split("=");
      if (p.length === 2 && state.hasOwnProperty(p[0])) {
        var btn = $('[data-filter="' + p[0] + '"][data-value="' + p[1] + '"]', pf);
        if (btn) btn.click();
      }
    });
    apply();
  }

  /* ---------- Gift finder ---------- */
  var finder = $("[data-finder]");
  if (finder) {
    var steps = [
      {
        key: "age", name: "收禮小朋友幾多歲？", hint: "以實際年齡揀選，我們會配合安全及發展需要推薦。",
        opts: [
          { v: "1-2", big: "1–2 歲", sm: "BB 啟蒙・五感探索", ico: "🧸" },
          { v: "3-5", big: "3–5 歲", sm: "幼稚園・配對與扮演", ico: "🎨" },
          { v: "6-8", big: "6–8 歲", sm: "初小・科學與拼砌", ico: "🔬" },
          { v: "9+", big: "9 歲+", sm: "高小・進階專案", ico: "🚀" },
        ],
      },
      {
        key: "budget", name: "預算大約多少？", hint: "所有價錢以網店結帳頁為準。",
        opts: [
          { v: "0-199", big: "$199 以下", sm: "派對禮物・小心意", ico: "🎈" },
          { v: "200-399", big: "$200–399", sm: "最受歡迎生日禮物", ico: "🎁" },
          { v: "400-699", big: "$400–699", sm: "有份量的成長禮物", ico: "🌟" },
          { v: "700-99999", big: "$700 以上", sm: "大禮・可以玩幾年", ico: "🏆" },
        ],
      },
      {
        key: "interest", name: "小朋友最鍾意…", hint: "唔肯定？揀「都想試」就得。",
        opts: [
          { v: "science", big: "睇睇研究", sm: "觀察・實驗・星空", ico: "🔭" },
          { v: "build", big: "動手砌", sm: "模型・積木・機械", ico: "🛠️" },
          { v: "logic|game", big: "玩遊戲", sm: "桌遊・解謎・數學", ico: "🎲" },
          { v: "sensory|motor|pretend", big: "郁手郁腳", sm: "感官・小手肌・扮演", ico: "🖐️" },
          { v: "any", big: "都想試", sm: "幫我揀最適合的", ico: "✨" },
        ],
      },
    ];
    var ans = {};
    var idx = 0;
    var body = $(".finder__body", finder);
    var bar = $(".finder__progress i", finder);
    var stepName = $(".finder__stepname", finder);

    function drawStep() {
      var s = steps[idx];
      bar.style.width = ((idx + 1) / (steps.length + 1)) * 100 + "%";
      stepName.textContent = "第 " + (idx + 1) + " / " + steps.length + " 步";
      body.innerHTML =
        '<h3 class="finder__q">' + esc(s.name) + '</h3><p class="muted">' + esc(s.hint) + "</p>" +
        '<div class="finder__opts" role="group">' +
        s.opts.map(function (o) {
          return '<button type="button" class="opt" data-v="' + esc(o.v) + '" aria-pressed="' + (ans[s.key] === o.v ? "true" : "false") + '"><span class="opt__emoji" aria-hidden="true">' + o.ico + '</span><span class="opt__big">' + esc(o.big) + '</span><span class="opt__sm">' + esc(o.sm) + "</span></button>";
        }).join("") +
        "</div>" +
        '<div class="finder__nav">' + (idx > 0 ? '<button type="button" class="btn btn--ghost btn--sm" data-back>← 上一步</button>' : "<span></span>") +
        '<span class="small muted">揀選後會自動進入下一步</span></div>';
      $$(".opt", body).forEach(function (b) {
        b.addEventListener("click", function () {
          ans[s.key] = b.getAttribute("data-v");
          $$(".opt", body).forEach(function (o) { o.setAttribute("aria-pressed", o === b ? "true" : "false"); });
          setTimeout(function () {
            idx++;
            if (idx < steps.length) drawStep(); else drawResult();
          }, 260);
        });
      });
      var back = $("[data-back]", body);
      if (back) back.addEventListener("click", function () { idx--; drawStep(); });
    }

    function drawResult() {
      bar.style.width = "100%";
      stepName.textContent = "為你配對完成！";
      var r = ans.budget.split("-").map(parseFloat);
      var interests = ans.interest === "any" ? null : ans.interest.split("|");
      var base = PRODUCTS.filter(function (p) { return p.ages.indexOf(ans.age) > -1; });
      var exact = base.filter(function (p) { return p.p >= r[0] && p.p <= r[1] && (!interests || interests.indexOf(p.area) > -1); });
      var note = "";
      var byOwn = function (a, b) { return (b.own ? 1 : 0) - (a.own ? 1 : 0) || a.p - b.p; };
      var list = exact.slice().sort(byOwn);
      if (list.length < 4) {
        var extra = base.filter(function (p) { return p.p >= r[0] && p.p <= r[1] && list.indexOf(p) < 0; }).sort(byOwn);
        if (extra.length) { list = list.concat(extra); note = (exact.length ? "頭 " + exact.length + " 件最符合興趣；" : "") + "另加入同一預算內的其他人氣之選。"; }
      }
      if (list.length < 3) {
        var mid = (r[0] + Math.min(r[1], 1200)) / 2;
        list = list.concat(base.filter(function (p) { return list.indexOf(p) < 0; }).sort(function (a, b) { return Math.abs(a.p - mid) - Math.abs(b.p - mid); }));
        note = "這個預算內的精選較少，以下加入了最接近預算的推介；網店內還有更多選擇。";
      }
      list = list.slice(0, 8);
      var ageOpt = steps[0].opts.filter(function (o) { return o.v === ans.age; })[0];
      var budOpt = steps[1].opts.filter(function (o) { return o.v === ans.budget; })[0];
      var intOpt = steps[2].opts.filter(function (o) { return o.v === ans.interest; })[0];
      body.innerHTML =
        '<div class="finder__result-head"><div><h3 class="finder__q">為你揀選的 ' + list.length + " 份禮物</h3>" +
        '<div class="finder__summary"><span class="chip chip--mint">' + esc(ageOpt.big) + '</span><span class="chip chip--coral">' + esc(budOpt.big) + '</span><span class="chip chip--sky">' + esc(intOpt.big) + "</span></div>" +
        (note ? '<p class="small muted mt-1 mb-0">' + esc(note) + "</p>" : "") +
        '</div><div class="flex"><button type="button" class="btn btn--ghost btn--sm" data-restart>↺ 重新配對</button>' +
        '<a class="btn btn--sm" target="_blank" rel="noopener" href="' + esc(KR.collectionUrl("kidrise-birthday-gift-kids-toy-stem-montessori", "gift_finder")) + '">更多生日禮物 <span class="arr">→</span></a></div></div>' +
        '<div class="pgrid pgrid--4">' + list.map(function (p) { return productCard(p, "gift_finder"); }).join("") + "</div>" +
        '<p class="pnote">✓ 可於網店加購禮物包裝　✓ 滿 $400 免運費（包括住宅）　✓ 價錢以網店結帳頁為準</p>';
      $("[data-restart]", body).addEventListener("click", function () { ans = {}; idx = 0; drawStep(); });
    }
    drawStep();

    // Price tier shortcuts on gifts page
    $$("[data-tier]").forEach(function (t) {
      t.addEventListener("click", function () {
        var target = $("[data-tier-grid]");
        var r = t.getAttribute("data-tier").split("-").map(parseFloat);
        $$("[data-tier]").forEach(function (o) { o.setAttribute("aria-pressed", o === t ? "true" : "false"); });
        var list = PRODUCTS.filter(function (p) { return p.p >= r[0] && p.p <= r[1]; }).sort(function (a, b) { return (b.own ? 1 : 0) - (a.own ? 1 : 0) || a.p - b.p; });
        render(target, list.slice(0, 8), "gift_tier");
        var lbl = $("[data-tier-label]");
        if (lbl) lbl.textContent = t.querySelector(".tier__amt").textContent.replace(/\s+/g, " ");
      });
    });
    var firstTier = $('[data-tier="200-399"]');
    if (firstTier) firstTier.click();
  }

  /* ---------- Activity generator ---------- */
  var ACTIVITIES = [
    { t: "冰塊救恐龍", a: [2, 6], m: 20, place: "home", area: "science", ico: "🦖", c: "sky", mat: ["細恐龍或小公仔", "膠盒及清水（前一晚雪好）", "鹽、暖水、湯匙、滴管"], s: ["前一晚把公仔放入膠盒加水雪成冰磚。", "把冰磚放在大托盤上，請孩子想想：用甚麼方法最快救出恐龍？", "逐一試：暖水、鹽、湯匙敲、用手握住。", "記錄哪個方法最快，再一起討論原因。"], l: "認識溫度與融化，學習「提出假設 → 測試 → 比較」的科學方法。", rel: "" },
    { t: "影子動物園", a: [3, 8], m: 15, place: "home", area: "science", ico: "🔦", c: "sun", mat: ["電筒", "白色牆身或床單", "手、紙板剪成的動物"], s: ["關燈，用電筒照向牆身。", "用手做出兔子、小狗、雀仔的影子。", "把電筒移近或移遠，觀察影子大小怎樣改變。", "輪流做影子，讓對方估是甚麼動物。"], l: "了解光沿直線傳播、物件擋光形成影子；對應小學科學「光與影」課題。", rel: "kidrise-engineering-toi-find-it-out-with-a-small-flashlight" },
    { t: "浮定沉？大預測", a: [3, 7], m: 20, place: "home", area: "science", ico: "🛁", c: "sky", mat: ["一大盆水", "10 件家中物品（匙羹、膠樽蓋、蘋果、錢幣、樹葉…）", "紙筆"], s: ["每件物品放入水前，先讓孩子預測「浮」或「沉」。", "放入水中驗證，在紙上打 ✓ 或 ✗。", "找出預測錯的物品，討論它的大小、重量、物料。", "挑戰：可以令沉下去的錫紙浮起來嗎？（摺成小船）"], l: "建立「預測與驗證」習慣，初步理解物料與浮力。", rel: "" },
    { t: "紙杯電話", a: [5, 9], m: 25, place: "home", area: "science", ico: "📞", c: "coral", mat: ["2 個紙杯", "約 3 米棉繩", "牙籤或萬字夾"], s: ["由大人在紙杯底刺一個小孔。", "把繩穿過小孔，在杯內綁上牙籤固定。", "兩人各拿一個杯，把繩拉直。", "一人說話、一人聽；試試繩鬆時還聽得到嗎？"], l: "理解聲音靠振動傳遞，拉直的繩比鬆的繩傳聲更好。", rel: "" },
    { t: "屋企超級市場", a: [3, 6], m: 20, place: "home", area: "pretend", ico: "🛒", c: "lilac", mat: ["廚房罐頭、零食、水果", "自製價錢牌", "玩具錢或紙幣"], s: ["一齊在紙上畫一張「購物清單」（3–5 件物品）。", "把物品擺成貨架，貼上 $1–$10 價錢牌。", "孩子做顧客按清單「購物」，大人做收銀員。", "對換角色，讓孩子計數及找錢。"], l: "練習配對、數數及簡單加減，同時學習社交對話。", rel: "" },
    { t: "公園葉子收集家", a: [3, 8], m: 30, place: "outdoor", area: "science", ico: "🍃", c: "mint", mat: ["環保袋", "白紙及蠟筆", "放大鏡（如有）"], s: ["到公園收集已跌在地上的葉子（不要摘花草）。", "按大小、顏色、形狀把葉子分類。", "把葉子放在白紙下，用蠟筆側面拓印葉脈。", "用放大鏡觀察葉脈，說說像甚麼？"], l: "觀察、分類及比較，是小學科學「生物與環境」的基礎技能。", rel: "kidrise-science-bresser-binoculars-for-kids" },
    { t: "月亮觀察日記", a: [5, 10], m: 10, place: "outdoor", area: "science", ico: "🌙", c: "sky", mat: ["Kidrise 月相觀察表（可列印）", "鉛筆", "望遠鏡（可選）"], s: ["每晚同一時間，在窗邊或天台找月亮。", "在觀察表上畫出月亮的形狀。", "連續記錄兩星期，看看月亮如何「變身」。", "有望遠鏡的話，試找出月球表面的環形山。"], l: "長期觀察與記錄，認識月相變化的規律。", rel: "kidrise-stem-science-amazing-telescope-for-kids" },
    { t: "晾衫夾挑戰", a: [1, 3], m: 10, place: "home", area: "motor", ico: "🧺", c: "sun", mat: ["5–10 個晾衫夾", "紙碟或紙皮"], s: ["示範如何用手指捏開晾衫夾。", "讓孩子把夾子逐個夾在紙碟邊。", "進階：按顏色夾、數住夾、夾成太陽形狀。", "完成後一齊數數一共夾了幾多個。"], l: "強化手指力量與手眼協調，為日後握筆寫字打好基礎。", rel: "kidrise-montessori-goryeo-harvest-carrots-game" },
    { t: "彩虹糖水分層", a: [6, 10], m: 25, place: "home", area: "science", ico: "🌈", c: "coral", mat: ["4 隻透明杯", "砂糖、食用色素", "清水、湯匙、高身透明杯"], s: ["4 杯水分別加入 0、2、4、6 匙糖及不同顏色。", "攪勻至糖完全溶解。", "由最多糖的一杯開始，用湯匙背慢慢倒入高身杯。", "觀察顏色有沒有分層，討論原因。"], l: "認識「密度」：溶了較多糖的水較重，會沉在下面。", rel: "" },
    { t: "公仔降落傘", a: [5, 9], m: 30, place: "home", area: "build", ico: "🪂", c: "mint", mat: ["膠袋", "4 條約 30cm 的繩", "細公仔、剪刀、膠紙"], s: ["把膠袋剪成正方形，四角各綁一條繩。", "四條繩的另一端綁在公仔身上。", "由大人在安全高度（例如梳化旁）放手。", "改變降落傘大小，比較哪個下降得最慢。"], l: "體驗空氣阻力，學習只改變一個變數的「公平測試」。", rel: "" },
    { t: "一分鐘砌高塔", a: [4, 9], m: 15, place: "home", area: "build", ico: "🏗️", c: "sky", mat: ["紙杯、積木或紙咭", "計時器"], s: ["定下規則：一分鐘內砌最高、而且要企到 5 秒。", "第一回合自由砌。", "討論：底部闊一點會不會更穩？", "第二回合改良設計，比較高度。"], l: "工程設計循環：設計 → 測試 → 改良，並理解底部與穩定性。", rel: "kidrise-mathematics-giromag-magnetic-puzzle-toy-80" },
    { t: "客廳尋寶地圖", a: [4, 8], m: 30, place: "home", area: "logic", ico: "🗺️", c: "sun", mat: ["白紙、顏色筆", "一件「寶物」（小玩具）"], s: ["和孩子一起由上望落去畫出客廳平面圖。", "大人把寶物藏起，在地圖上畫 ✕。", "孩子按地圖找寶物。", "對換角色，讓孩子藏寶及畫地圖。"], l: "空間感與方向感，學習用符號代表真實物件。", rel: "" },
    { t: "聲音樽配對", a: [1, 4], m: 15, place: "home", area: "sensory", ico: "🎵", c: "coral", mat: ["6 個相同的小膠樽（3 對）", "米、豆、鈕扣（須封好樽蓋）"], s: ["每兩個樽放入相同物料，蓋緊並用膠紙封口。", "大人搖一搖，讓孩子聽聲音。", "請孩子找出聲音一樣的兩個樽。", "說說聲音是「大聲 / 細聲」「沙沙 / 咚咚」。"], l: "訓練聽覺分辨能力及詞彙表達。⚠️ 3 歲以下請確保樽蓋完全封好。", rel: "montessori-goryeobaby-elephant-xylophone" },
    { t: "放大鏡下的世界", a: [5, 10], m: 20, place: "home", area: "science", ico: "🔬", c: "mint", mat: ["放大鏡或顯微鏡", "鹽、糖、頭髮、布料、樹葉"], s: ["先用肉眼觀察每件樣本，畫下樣子。", "再用放大鏡或顯微鏡觀察。", "比較前後有甚麼新發現（例如鹽是正方形的）。", "把最有趣的發現拍照或畫成「觀察報告」。"], l: "認識放大工具，培養仔細觀察與記錄的科學習慣。", rel: "kidrise-amazing-microscope" },
    { t: "平衡鳥", a: [6, 10], m: 25, place: "home", area: "build", ico: "🐦", c: "lilac", mat: ["紙皮", "2 個一蚊硬幣", "膠紙、剪刀、顏色筆"], s: ["在紙皮上畫一隻展開翅膀的雀鳥並剪出來。", "在兩邊翼尖底部各貼一個硬幣。", "把鳥嘴放在手指尖上，看看能否平衡。", "移動硬幣位置，找出最穩的平衡點。"], l: "認識重心與平衡，是機械與結構設計的重要概念。", rel: "kidrise-mechanical-paper-models-maternal-dilemma" },
    { t: "廚房火山爆發", a: [4, 9], m: 15, place: "home", area: "science", ico: "🌋", c: "coral", mat: ["梳打粉 2 湯匙", "白醋半杯", "洗潔精少許、紅色色素、膠杯、托盤"], s: ["把膠杯放在托盤中央，加入梳打粉。", "加入少量洗潔精及色素。", "倒入白醋，觀察「火山爆發」。", "試試改變份量，泡泡會不會更多？"], l: "認識酸與鹼的化學反應會產生氣體（二氧化碳）。", rel: "" },
    { t: "數字跳飛機", a: [3, 6], m: 15, place: "outdoor", area: "motor", ico: "🔢", c: "sun", mat: ["粉筆或膠紙", "一粒小石或豆袋"], s: ["在地上畫出 1–10 的格仔。", "把豆袋擲到某一格，跳到該格再跳回來。", "跳的時候大聲數出數字。", "進階：大人講一條算式，孩子跳到答案格。"], l: "結合大肌肉活動與數字認知，邊郁邊學最有效。", rel: "" },
    { t: "自製感官袋", a: [1, 3], m: 10, place: "home", area: "sensory", ico: "🫧", c: "mint", mat: ["大號密實袋", "髮膠或洗手液", "亮片、小膠珠、食用色素", "強力膠紙"], s: ["把髮膠倒入密實袋，加入亮片及色素。", "擠走空氣、封好，再用膠紙封邊兩次。", "平放在桌上或貼在窗上。", "讓孩子用手指按、推，觀察亮片流動。"], l: "安全的觸覺與視覺探索。⚠️ 全程需大人看管，確保袋子沒有破損。", rel: "kidrise-montessori-early-childhood-education-cloth-book" },
  ];
  var actRoot = $("[data-actgen]");
  if (actRoot) {
    var fst = { age: "all", time: "all", place: "all" };
    var cardEl = $("[data-actcard]", actRoot);
    var countEl = $("[data-actcount]", actRoot);
    var current = null;
    function pool() {
      return ACTIVITIES.filter(function (a) {
        var okAge = fst.age === "all" || (function () { var r = fst.age.split("-").map(Number); return a.a[0] <= r[1] && a.a[1] >= r[0]; })();
        var okTime = fst.time === "all" || a.m <= parseInt(fst.time, 10);
        var okPlace = fst.place === "all" || a.place === fst.place;
        return okAge && okTime && okPlace;
      });
    }
    function relatedHtml(h) {
      if (!h) return "";
      var p = PRODUCTS.filter(function (x) { return x.h === h; })[0];
      if (!p) return "";
      return '<a class="btn btn--paper btn--sm" target="_blank" rel="noopener" href="' + esc(KR.productUrl(p.h, "activity_" + current.t)) + '">想玩得更深入？' + esc(p.n) + ' <span class="arr">→</span></a>';
    }
    function draw(a) {
      current = a;
      if (!a) {
        cardEl.innerHTML = '<div class="actcard__top"><div><h3 class="actcard__title">冇符合條件的活動</h3><p class="muted mb-0">試試放寬時間或地點篩選。</p></div></div>';
        return;
      }
      cardEl.innerHTML =
        '<div class="actcard__top"><div class="actcard__icon" style="background:var(--' + a.c + (a.c === "sun" ? "" : "-soft") + ')" aria-hidden="true">' + a.ico + "</div>" +
        '<div><span class="eyebrow eyebrow--coral" style="margin-bottom:6px">今日親子任務</span><h3 class="actcard__title">' + esc(a.t) + "</h3>" +
        '<div class="actcard__meta"><span class="chip chip--mint">' + a.a[0] + "–" + a.a[1] + ' 歲</span><span class="chip">⏱ 約 ' + a.m + ' 分鐘</span><span class="chip chip--sky">' + (a.place === "home" ? "🏠 室內" : "🌳 戶外") + '</span><span class="chip chip--' + AREAS[a.area].color + '">' + AREAS[a.area].zh + "</span></div></div></div>" +
        '<div class="actcard__body"><div><h4>🧰 準備材料</h4><ul class="ticks">' + a.mat.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></div>" +
        "<div><h4>🧭 玩法步驟</h4><ol>" + a.s.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ol>" +
        '<div class="actcard__learn"><b>孩子學到甚麼：</b>' + esc(a.l) + "</div></div></div>" +
        '<div class="actcard__actions"><button type="button" class="btn btn--coral btn--sm" data-act-next>🎲 再抽一個</button><button type="button" class="btn btn--paper btn--sm" data-act-print>🖨 列印活動卡</button>' + relatedHtml(a.rel) + "</div>";
      cardEl.classList.remove("flip"); void cardEl.offsetWidth; cardEl.classList.add("flip");
      $("[data-act-next]", cardEl).addEventListener("click", pick);
      $("[data-act-print]", cardEl).addEventListener("click", function () { printActivity(a); });
    }
    function pick() {
      var p = pool();
      if (countEl) countEl.textContent = p.length;
      if (!p.length) return draw(null);
      var choices = p.length > 1 && current ? p.filter(function (x) { return x !== current; }) : p;
      draw(choices[Math.floor(Math.random() * choices.length)]);
    }
    $$("[data-af]", actRoot).forEach(function (b) {
      b.addEventListener("click", function () {
        var k = b.getAttribute("data-af");
        fst[k] = b.getAttribute("data-value");
        $$('[data-af="' + k + '"]', actRoot).forEach(function (o) { o.setAttribute("aria-pressed", o === b ? "true" : "false"); });
        pick();
      });
    });
    var go = $("[data-act-go]", actRoot);
    if (go) go.addEventListener("click", pick);
    // 本週推介：按週數輪替
    var week = Math.floor((Date.now() - new Date(2026, 0, 5).getTime()) / (7 * 864e5));
    draw(ACTIVITIES[((week % ACTIVITIES.length) + ACTIVITIES.length) % ACTIVITIES.length]);
    if (countEl) countEl.textContent = ACTIVITIES.length;

    // List all activities (library)
    var lib = $("[data-actlib]");
    if (lib) {
      lib.innerHTML = ACTIVITIES.map(function (a, i) {
        return '<button type="button" class="skill" data-act-i="' + i + '" style="text-align:left;cursor:pointer">' +
          '<span class="skill__ico" style="background:var(--' + a.c + (a.c === "sun" ? "" : "-soft") + ');font-size:28px" aria-hidden="true">' + a.ico + "</span>" +
          "<h3>" + esc(a.t) + '</h3><p>' + a.a[0] + "–" + a.a[1] + " 歲 · 約 " + a.m + " 分鐘 · " + (a.place === "home" ? "室內" : "戶外") + "</p>" +
          '<span class="skill__more">打開活動卡 →</span></button>';
      }).join("");
      $$("[data-act-i]", lib).forEach(function (b) {
        b.addEventListener("click", function () {
          draw(ACTIVITIES[parseInt(b.getAttribute("data-act-i"), 10)]);
          actRoot.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      });
    }
  }
  KR.activityCount = ACTIVITIES.length;

  /* ---------- Printing ---------- */
  function printHtml(html) {
    var main = $("main");
    var holder = document.createElement("div");
    holder.className = "print-target";
    holder.innerHTML = '<div class="printable">' + html + "</div>";
    main.appendChild(holder);
    var cleanup = function () { if (holder.parentNode) holder.parentNode.removeChild(holder); window.removeEventListener("afterprint", cleanup); };
    window.addEventListener("afterprint", cleanup);
    setTimeout(function () { window.print(); setTimeout(cleanup, 1500); }, 60);
  }
  function printActivity(a) {
    printHtml(
      '<div class="sheet"><p style="font-weight:800;letter-spacing:.2em">KIDRISE · PLAY. LEARN. GROW.</p>' +
      "<h1>" + esc(a.t) + "</h1><p>適合 " + a.a[0] + "–" + a.a[1] + " 歲　｜　約 " + a.m + " 分鐘　｜　" + (a.place === "home" ? "室內" : "戶外") + "</p>" +
      "<h3>準備材料</h3><ul>" + a.mat.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>" +
      "<h3>玩法步驟</h3><ol>" + a.s.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ol>" +
      "<h3>孩子學到甚麼</h3><p>" + esc(a.l) + "</p>" +
      '<table><tr><th style="width:50%">我的觀察 / 畫畫</th><th>完成日期：＿＿＿＿＿＿</th></tr><tr><td style="height:70mm"></td><td style="height:70mm">家長留言：</td></tr></table>' +
      '<p style="margin-top:8mm;font-size:10pt">⚠️ 所有活動請在成人陪同下進行。更多免費親子活動：kidrise.com.hk/activities</p></div>'
    );
  }
  var PRINTS = {
    moon: function () {
      var cells = "";
      for (var r = 0; r < 5; r++) {
        cells += "<tr>";
        for (var c = 0; c < 6; c++) {
          var d = r * 6 + c + 1;
          cells += '<td><b>Day ' + d + '</b><br>日期：＿＿＿<div class="moon" style="margin:3mm auto"></div>天氣：☀️ ☁️ 🌧</td>';
        }
        cells += "</tr>";
      }
      return '<div class="sheet"><p style="font-weight:800;letter-spacing:.2em">KIDRISE · 星空探索任務</p><h1>🌙 30 日月相觀察記錄表</h1>' +
        "<p>每晚同一時間找月亮，在圓圈內畫出它的形狀（看不到就畫 ✕）。完成 30 日，你會發現月亮的「變身規律」！</p>" +
        "<table>" + cells + "</table>" +
        '<p style="margin-top:6mm">我的發現：＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿</p></div>';
    },
    bingo: function () {
      var items = ["一塊心形的葉", "一隻正在爬的螞蟻", "三種不同顏色的花", "一粒圓圓的石頭", "雀仔的叫聲", "一個比你手掌大的葉", "樹皮上的花紋（拓印）", "一朵像動物的雲", "一隻蝴蝶或飛蟲"];
      var cells = "";
      for (var i = 0; i < 9; i++) {
        if (i % 3 === 0) cells += "<tr>";
        cells += '<td style="height:52mm;width:33%"><b>' + items[i] + '</b><br><br>☐ 找到了！<br>畫畫：</td>';
        if (i % 3 === 2) cells += "</tr>";
      }
      return '<div class="sheet"><p style="font-weight:800;letter-spacing:.2em">KIDRISE · 自然探索任務</p><h1>🌳 公園自然尋寶 Bingo</h1>' +
        "<p>到附近公園，找到一樣就打 ✓。連成一條線就 Bingo！（請只觀察，不要摘花或捉昆蟲）</p><table>" + cells + "</table></div>";
    },
    gift: function () {
      return '<div class="sheet"><p style="font-weight:800;letter-spacing:.2em">KIDRISE · 生日小禮物</p><h1>🎁 生日派對遊戲任務卡</h1>' +
        "<table><tr><th>遊戲</th><th>玩法</th><th>需要</th></tr>" +
        "<tr><td><b>影子估估吓</b></td><td>關燈，用電筒做手影，其他小朋友估是甚麼動物。</td><td>電筒</td></tr>" +
        "<tr><td><b>一分鐘高塔</b></td><td>分組在一分鐘內用紙杯砌最高的塔，要企穩 5 秒。</td><td>紙杯 30 個</td></tr>" +
        "<tr><td><b>浮定沉</b></td><td>先估，再把物件放入水中驗證，估中最多的一隊勝。</td><td>一盆水、10 件物品</td></tr>" +
        "<tr><td><b>尋寶地圖</b></td><td>壽星仔女畫地圖藏禮物，賓客按地圖尋寶。</td><td>紙、筆、小禮物</td></tr>" +
        "</table><p style=\"margin-top:6mm\">更多派對禮物：kidrise.com.hk/gifts</p></div>";
    },
  };
  $$("[data-print]").forEach(function (b) {
    b.addEventListener("click", function () {
      var k = b.getAttribute("data-print");
      if (PRINTS[k]) printHtml(PRINTS[k]());
    });
  });

  /* ---------- Enquiry forms → WhatsApp / Email ---------- */
  $$("form[data-enquiry]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var via = (e.submitter && e.submitter.getAttribute("data-send")) || "wa";
      var title = form.getAttribute("data-enquiry");
      var lines = ["【" + title + "】"];
      $$("[data-label]", form).forEach(function (f) {
        var v;
        if (f.matches("fieldset")) {
          v = $$("input:checked", f).map(function (i) { return i.value; }).join("、");
        } else v = f.value;
        if (v && String(v).trim()) lines.push(f.getAttribute("data-label") + "：" + String(v).trim());
      });
      lines.push("（來自 kidrise.com.hk）");
      var text = lines.join("\n");
      if (via === "mail") {
        window.location.href = "mailto:" + KR.email + "?subject=" + encodeURIComponent(title) + "&body=" + encodeURIComponent(text);
      } else {
        window.open("https://wa.me/" + KR.whatsapp + "?text=" + encodeURIComponent(text), "_blank", "noopener");
      }
      toast("已為你準備好訊息，請在 " + (via === "mail" ? "電郵" : "WhatsApp") + " 確認送出 ✓");
    });
  });

  /* ---------- Footer year ---------- */
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
