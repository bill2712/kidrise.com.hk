/* ==========================================================================
   Kidrise — kidrise.com.hk 互動功能
   ========================================================================== */
(function () {
  "use strict";
  document.documentElement.classList.remove("no-js");
  // 語言：<html lang="en-HK"> 嘅頁面用英文字串，連結加 /en 前綴
  var EN = /^en/i.test(document.documentElement.lang || "");
  var T = function (zh, en) { return EN ? en : zh; };
  var LP = EN ? "/en" : "";

  /* ---------- 基本設定（如有更改，只需修改這裡） ---------- */
  var KR = (window.KR = {
    shop: "https://stemtoy.com.hk",
    whatsapp: "85266721884",
    email: "contact@kidrise.com.hk",
    utm: function (campaign) {
      return "utm_source=kidrise.com.hk&utm_medium=referral&utm_campaign=" + encodeURIComponent(campaign || "brand_site");
    },
    productUrl: function (handle, campaign) {
      return KR.shop + LP + "/products/" + handle + "?" + KR.utm(campaign);
    },
    collectionUrl: function (handle, campaign) {
      return KR.shop + LP + "/collections/" + encodeURIComponent(handle) + "?" + KR.utm(campaign);
    },
    lang: EN ? "en" : "zh",
  });

  var AREAS = {
    sensory: { zh: T("感官探索", "Sensory play"), color: "coral" },
    motor: { zh: T("手眼協調", "Fine motor"), color: "sun" },
    build: { zh: T("拼砌建構", "Building"), color: "sky" },
    pretend: { zh: T("角色扮演", "Pretend play"), color: "lilac" },
    logic: { zh: T("邏輯思維", "Logic"), color: "mint" },
    science: { zh: T("科學探索", "Science"), color: "sky" },
    game: { zh: T("親子桌遊", "Family games"), color: "coral" },
  };
  var AGE_LABEL = EN ? { "1-2": "Ages 1–2", "3-5": "Ages 3–5", "6-8": "Ages 6–8", "9+": "Ages 9+" } : { "1-2": "1–2 歲", "3-5": "3–5 歲", "6-8": "6–8 歲", "9+": "9 歲+" };
  var yrs = function (a, b) { return EN ? "Ages " + a + "–" + b : a + "–" + b + " 歲"; };
  var mins = function (m) { return EN ? "About " + m + " min" : "約 " + m + " 分鐘"; };
  var AGE_COLLECTION = { "1-2": "適合0-3歲", "3-5": "適合3-6歲", "6-8": "適合6-11歲", "9+": "適合11-歲" };

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  // GA4 事件（未設定 GA 時乜都唔做）
  var track = function (name, params) {
    try { if (typeof window.gtag === "function") window.gtag("event", name, params || {}); } catch (e) {}
  };
  KR.track = track;
  // 交俾 fx.js 放彩紙（如果 fx.js 未載入就乜都唔做）
  var celebrate = function (el, opts) {
    document.dispatchEvent(new CustomEvent("kr:celebrate", { detail: { el: el, opts: opts } }));
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
    if (p.own) badges += '<span class="chip chip--ink">' + T("Kidrise 自家品牌", "Kidrise original") + "</span>";
    var name = EN && p.ne ? p.ne : p.n;
    if (p.area && AREAS[p.area]) badges += '<span class="chip chip--' + AREAS[p.area].color + '">' + AREAS[p.area].zh + "</span>";
    var ages = (p.ages || []).map(function (a) { return "<span>" + (AGE_LABEL[a] || a) + "</span>"; }).join("");
    var compare = p.c && p.c > p.p ? "<s>" + money(p.c) + "</s>" : "";
    return (
      '<a class="pcard" href="' + esc(KR.productUrl(p.h, campaign)) + '" target="_blank" rel="noopener" title="' + esc(EN && p.ne ? p.ne : p.full) + '">' +
      '<div class="pcard__img"><img loading="lazy" decoding="async" src="' + esc(p.img) + '"' + srcset(p.img) + ' alt="' + esc(name) + '" width="640" height="640"><div class="pcard__badges">' + badges + "</div></div>" +
      '<div class="pcard__body"><div class="pcard__name">' + esc(name) + "</div>" +
      (p.rc ? '<div class="pcard__rate" aria-label="' + T("網店評分 " + p.r + " / 5，" + p.rc + " 個評價", "Rated " + p.r + " out of 5 from " + p.rc + " reviews") + '"><span class="stars" style="--r:' + p.r + '" aria-hidden="true">★★★★★</span><b>' + p.r + "</b><span>(" + p.rc + ")</span></div>" : "") +
      '<div class="pcard__ages">' + ages + "</div>" +
      '<div class="pcard__foot"><div class="pcard__price">' + compare + money(p.p) + "</div>" +
      '<span class="pcard__go" aria-hidden="true">' + ARROW + "</span></div></div></a>"
    );
  }
  // Shopify CDN 圖片：按螢幕大細揀尺寸
  function srcset(url) {
    var m = /^(https:\/\/cdn\.shopify\.com\/[^?]+)\?width=(\d+)$/.exec(url || "");
    if (!m) return "";
    var max = parseInt(m[2], 10);
    var ws = [160, 240, 360, 480, 640].filter(function (w) { return w < max; }).concat([max]);
    return ' srcset="' + ws.map(function (w) { return m[1] + "?width=" + w + " " + w + "w"; }).join(", ") + '" sizes="(max-width: 600px) 46vw, (max-width: 1100px) 30vw, 300px"';
  }
  var ARROW = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  KR.productCard = productCard;

  function render(el, list, campaign) {
    if (!el) return;
    if (!list.length) {
      el.innerHTML = '<div class="finder__empty" style="grid-column:1/-1">' + T("暫時未有符合條件的精選，請試試其他篩選，或直接", "No picks match these filters yet. Try another filter, or ") + '<a class="mark" href="' + esc(KR.collectionUrl("all", campaign)) + '" target="_blank" rel="noopener">' + T("瀏覽全部玩具", "browse all toys") + "</a>" + T("。", ".") + "</div>";
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

  var AGE_INFO_EN = {
    "1-2": {
      title: "Ages 1–2: discovering the world through the senses",
      lede: "Toddlers learn by touching, listening and grasping. Choose simple, sturdy toys with no small parts.",
      points: ["Sensory play: cloth books, xylophones, different textures", "Gross and fine motor: grasping, posting, banging", "Cause and effect: \u201cI press it, something happens\u201d"],
      tip: "Parent tip: put out only 2–3 toys at a time and your child will play with more focus.",
    },
    "3-5": {
      title: "Ages 3–5: nimbler hands, first rules",
      lede: "Preschoolers love matching, sorting and simple rule games, and they love acting like grown-ups.",
      points: ["Hand–eye coordination: mazes, screws, peg games", "Early logic: colour and shape matching, counting", "Social and language skills: pretend play, cooperative board games"],
      tip: "Parent tip: games you can play together for 15 minutes beat solo toys.",
    },
    "6-8": {
      title: "Ages 6–8: hands-on experiments and endless \u201cwhy?\u201d",
      lede: "In primary school, children want to know why things happen. It is the best time to build scientific thinking and problem solving.",
      points: ["Science: microscopes, telescopes, light and shadow", "Engineering: wooden models, mechanisms, construction", "Strategy and maths: board games, magnetic puzzles"],
      tip: "Parent tip: match toys to the primary science topics (light, plants, simple circuits) so school learning sticks.",
    },
    "9+": {
      title: "Ages 9+: bigger, harder projects",
      lede: "Upper-primary kids want a real challenge and a finished piece of work. The sense of achievement is the best motivator.",
      points: ["Advanced engineering: hydraulics, solar power, robots", "Observation logs: digital microscopes, stargazing missions", "Strategy games: maths, deduction, teamwork"],
      tip: "Parent tip: ask your child to film their build or keep an observation journal. The learning lasts longer.",
    },
  };
  if (EN) AGE_INFO = AGE_INFO_EN;

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
          '<a class="btn btn--coral btn--sm mt-1" target="_blank" rel="noopener" href="' + esc(KR.collectionUrl(AGE_COLLECTION[age], campaign)) + '">' + T("瀏覽 " + AGE_LABEL[age] + " 全部玩具", "Shop all toys for " + AGE_LABEL[age].toLowerCase()) + ' <span class="arr">→</span></a>';
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
    var stepsZh = [
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
    var stepsEn = [
      {
        key: "age", name: "How old is the birthday child?", hint: "Pick their actual age. We match picks to safety and development needs.",
        opts: [
          { v: "1-2", big: "Ages 1–2", sm: "Baby & toddler · senses", ico: "🧸" },
          { v: "3-5", big: "Ages 3–5", sm: "Preschool · matching & pretend", ico: "🎨" },
          { v: "6-8", big: "Ages 6–8", sm: "Lower primary · science & building", ico: "🔬" },
          { v: "9+", big: "Ages 9+", sm: "Upper primary · bigger projects", ico: "🚀" },
        ],
      },
      {
        key: "budget", name: "What's your budget?", hint: "Final prices are shown at the shop checkout.",
        opts: [
          { v: "0-199", big: "Under $199", sm: "Party favours · small gifts", ico: "🎈" },
          { v: "200-399", big: "$200–399", sm: "Most popular birthday gifts", ico: "🎁" },
          { v: "400-699", big: "$400–699", sm: "A substantial gift", ico: "🌟" },
          { v: "700-99999", big: "$700+", sm: "A big gift that lasts for years", ico: "🏆" },
        ],
      },
      {
        key: "interest", name: "They love…", hint: "Not sure? Pick \u201cA bit of everything\u201d.",
        opts: [
          { v: "science", big: "Exploring", sm: "Observing · experiments · stars", ico: "🔭" },
          { v: "build", big: "Building", sm: "Models · blocks · mechanisms", ico: "🛠️" },
          { v: "logic|game", big: "Games", sm: "Board games · puzzles · maths", ico: "🎲" },
          { v: "sensory|motor|pretend", big: "Hands-on play", sm: "Senses · fine motor · pretend", ico: "🖐️" },
          { v: "any", big: "A bit of everything", sm: "Pick the best for me", ico: "✨" },
        ],
      },
    ];
    var steps = EN ? stepsEn : stepsZh;
    var ans = {};
    var idx = 0;
    var body = $(".finder__body", finder);
    var bar = $(".finder__progress i", finder);
    var stepName = $(".finder__stepname", finder);

    function drawStep() {
      var s = steps[idx];
      bar.style.width = ((idx + 1) / (steps.length + 1)) * 100 + "%";
      stepName.textContent = T("第 " + (idx + 1) + " / " + steps.length + " 步", "Step " + (idx + 1) + " of " + steps.length);
      body.innerHTML =
        '<h3 class="finder__q">' + esc(s.name) + '</h3><p class="muted">' + esc(s.hint) + "</p>" +
        '<div class="finder__opts" role="group">' +
        s.opts.map(function (o) {
          return '<button type="button" class="opt" data-v="' + esc(o.v) + '" aria-pressed="' + (ans[s.key] === o.v ? "true" : "false") + '"><span class="opt__emoji" aria-hidden="true">' + o.ico + '</span><span class="opt__big">' + esc(o.big) + '</span><span class="opt__sm">' + esc(o.sm) + "</span></button>";
        }).join("") +
        "</div>" +
        '<div class="finder__nav">' + (idx > 0 ? '<button type="button" class="btn btn--ghost btn--sm" data-back>' + T("← 上一步", "← Back") + "</button>" : "<span></span>") +
        '<span class="small muted">' + T("揀選後會自動進入下一步", "Tap an option to continue") + "</span></div>";
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
      stepName.textContent = T("為你配對完成！", "Here are your matches!");
      track("gift_finder_complete", { age: ans.age, budget: ans.budget, interest: ans.interest });
      var r = ans.budget.split("-").map(parseFloat);
      var interests = ans.interest === "any" ? null : ans.interest.split("|");
      var base = PRODUCTS.filter(function (p) { return p.ages.indexOf(ans.age) > -1; });
      var exact = base.filter(function (p) { return p.p >= r[0] && p.p <= r[1] && (!interests || interests.indexOf(p.area) > -1); });
      var note = "";
      var byOwn = function (a, b) { return (b.own ? 1 : 0) - (a.own ? 1 : 0) || a.p - b.p; };
      var list = exact.slice().sort(byOwn);
      if (list.length < 4) {
        var extra = base.filter(function (p) { return p.p >= r[0] && p.p <= r[1] && list.indexOf(p) < 0; }).sort(byOwn);
        if (extra.length) { list = list.concat(extra); note = EN ? (exact.length ? "The first " + exact.length + " match their interest best. " : "") + "We've added other popular picks in the same budget." : (exact.length ? "頭 " + exact.length + " 件最符合興趣；" : "") + "另加入同一預算內的其他人氣之選。"; }
      }
      if (list.length < 3) {
        var mid = (r[0] + Math.min(r[1], 1200)) / 2;
        list = list.concat(base.filter(function (p) { return list.indexOf(p) < 0; }).sort(function (a, b) { return Math.abs(a.p - mid) - Math.abs(b.p - mid); }));
        note = T("這個預算內的精選較少，以下加入了最接近預算的推介；網店內還有更多選擇。", "There are only a few picks in this budget, so we've added the closest matches. The shop has many more.");
      }
      list = list.slice(0, 8);
      var ageOpt = steps[0].opts.filter(function (o) { return o.v === ans.age; })[0];
      var budOpt = steps[1].opts.filter(function (o) { return o.v === ans.budget; })[0];
      var intOpt = steps[2].opts.filter(function (o) { return o.v === ans.interest; })[0];
      body.innerHTML =
        '<div class="finder__result-head"><div><h3 class="finder__q">' + T("為你揀選的 " + list.length + " 份禮物", list.length + " gift ideas for you") + "</h3>" +
        '<div class="finder__summary"><span class="chip chip--mint">' + esc(ageOpt.big) + '</span><span class="chip chip--coral">' + esc(budOpt.big) + '</span><span class="chip chip--sky">' + esc(intOpt.big) + "</span></div>" +
        (note ? '<p class="small muted mt-1 mb-0">' + esc(note) + "</p>" : "") +
        '</div><div class="flex"><button type="button" class="btn btn--ghost btn--sm" data-restart>' + T("↺ 重新配對", "↺ Start again") + "</button>" +
        '<a class="btn btn--sm" target="_blank" rel="noopener" href="' + esc(KR.collectionUrl("kidrise-birthday-gift-kids-toy-stem-montessori", "gift_finder")) + '">' + T("更多生日禮物", "More birthday gifts") + ' <span class="arr">→</span></a></div></div>' +
        '<div class="pgrid pgrid--4">' + list.map(function (p) { return productCard(p, "gift_finder"); }).join("") + "</div>" +
        '<p class="pnote">' + T("✓ 可於網店加購禮物包裝　✓ 滿 $400 免運費（包括住宅）　✓ 價錢以網店結帳頁為準", "✓ Gift wrapping available at checkout　✓ Free delivery over $400 (homes included)　✓ Final prices at the shop checkout") + "</p>";
      $("[data-restart]", body).addEventListener("click", function () { ans = {}; idx = 0; drawStep(); });
      celebrate(finder, { count: 90 });
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
  var ACTIVITIES = window.KR_ACTIVITIES || [];
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
      return '<a class="btn btn--paper btn--sm" target="_blank" rel="noopener" href="' + esc(KR.productUrl(p.h, "activity_" + current.slug)) + '">' + T("想玩得更深入？", "Go further: ") + esc(EN && p.ne ? p.ne : p.n) + ' <span class="arr">→</span></a>';
    }
    function draw(a) {
      current = a;
      if (!a) {
        cardEl.innerHTML = '<div class="actcard__top"><div><h3 class="actcard__title">' + T("冇符合條件的活動", "No activities match") + '</h3><p class="muted mb-0">' + T("試試放寬時間或地點篩選。", "Try a longer time or a different place.") + "</p></div></div>";
        return;
      }
      cardEl.innerHTML =
        '<div class="actcard__top"><div class="actcard__icon" style="background:var(--' + a.c + (a.c === "sun" ? "" : "-soft") + ')" aria-hidden="true">' + a.ico + "</div>" +
        '<div><span class="eyebrow eyebrow--coral" style="margin-bottom:6px">' + T("今日親子任務", "Today's family mission") + '</span><h3 class="actcard__title">' + esc(a.t) + "</h3>" +
        '<div class="actcard__meta"><span class="chip chip--mint">' + yrs(a.a[0], a.a[1]) + '</span><span class="chip">⏱ ' + mins(a.m) + '</span><span class="chip chip--sky">' + (a.place === "home" ? T("🏠 室內", "🏠 Indoors") : T("🌳 戶外", "🌳 Outdoors")) + '</span><span class="chip chip--' + AREAS[a.area].color + '">' + AREAS[a.area].zh + "</span></div></div></div>" +
        '<div class="actcard__body"><div><h4>' + T("🧰 準備材料", "🧰 You'll need") + '</h4><ul class="ticks">' + a.mat.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></div>" +
        "<div><h4>" + T("🧭 玩法步驟", "🧭 How to play") + "</h4><ol>" + a.s.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ol>" +
        '<div class="actcard__learn"><b>' + T("孩子學到甚麼：", "What they learn: ") + "</b>" + esc(a.l) + "</div></div></div>" +
        '<div class="actcard__actions"><button type="button" class="btn btn--coral btn--sm" data-act-next>' + T("🎲 再抽一個", "🎲 Draw another") + '</button><a class="btn btn--paper btn--sm" href="' + LP + "/activities/" + a.slug + '/">' + T("📄 完整活動卡及列印", "📄 Full activity card & print") + "</a>" + relatedHtml(a.rel) + "</div>";
      cardEl.classList.remove("flip"); void cardEl.offsetWidth; cardEl.classList.add("flip");
      $("[data-act-next]", cardEl).addEventListener("click", pickFx);
    }
    function pickFx() {
      pick();
      if (current) track("activity_draw", { item_id: current.slug });
      if (current) celebrate(cardEl, { count: 26, emojis: [current.ico, "⭐", "✨"], power: 10 });
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
    if (go) go.addEventListener("click", pickFx);
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
          "<h3>" + esc(a.t) + "</h3><p>" + yrs(a.a[0], a.a[1]) + " · " + mins(a.m) + " · " + (a.place === "home" ? T("室內", "Indoors") : T("戶外", "Outdoors")) + "</p>" +
          '<span class="skill__more">' + T("打開活動卡 →", "Open activity →") + "</span></button>";
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

  /* ---------- Print current page (activity cards & printables) ---------- */
  $$("[data-print-page]").forEach(function (b) {
    b.addEventListener("click", function () {
      track("print_worksheet", { item_id: location.pathname.split("/").filter(Boolean).pop() || "", page_type: location.pathname.split("/")[1] || "" });
      window.print();
    });
  });

  /* ---------- GA4：網店、WhatsApp、電郵點擊 ---------- */
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a) return;
    var href = a.getAttribute("href");
    if (href.indexOf("stemtoy.com.hk") > -1) {
      var m = href.match(/\/products\/([^?#/]+)/);
      var c = href.match(/utm_campaign=([^&#]+)/);
      track("shop_click", { link_url: href.split("?")[0], item_id: m ? m[1] : "", campaign: c ? decodeURIComponent(c[1]) : "", link_text: (a.textContent || "").trim().slice(0, 60) });
    } else if (href.indexOf("wa.me/") > -1) {
      track("whatsapp_click", { page_path: location.pathname });
    } else if (href.indexOf("mailto:") === 0) {
      track("email_click", { page_path: location.pathname });
    }
  });

  /* ---------- Learn: category filter ---------- */
  var learn = $("[data-learn]");
  if (learn) {
    $$("[data-cat-filter]", learn).forEach(function (b) {
      b.addEventListener("click", function () {
        var c = b.getAttribute("data-cat-filter");
        $$("[data-cat-filter]", learn).forEach(function (o) { o.setAttribute("aria-pressed", o === b ? "true" : "false"); });
        $$(".acard", learn).forEach(function (card) {
          card.style.display = c === "all" || card.getAttribute("data-cat") === c ? "" : "none";
        });
      });
    });
  }

  /* ---------- Resources: theme filter ---------- */
  $$("[data-res-filters]").forEach(function (root) {
    $$("[data-res-filter]", root).forEach(function (b) {
      b.addEventListener("click", function () {
        var t = b.getAttribute("data-res-filter");
        $$("[data-res-filter]", root).forEach(function (o) { o.setAttribute("aria-pressed", o === b ? "true" : "false"); });
        $$(".res", root).forEach(function (card) {
          card.style.display = t === "all" || card.getAttribute("data-theme") === t || card.getAttribute("data-kit") === t ? "" : "none";
        });
      });
    });
  });

  /* ---------- Enquiry forms → WhatsApp / Email（不經任何後台）---------- */
  $$("form[data-enquiry]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var via = (e.submitter && e.submitter.getAttribute("data-send")) || "wa";
      var title = form.getAttribute("data-enquiry");
      var lines = [T("【" + title + "】", "[" + title + "]")];
      $$("[data-label]", form).forEach(function (f) {
        var v;
        if (f.matches("fieldset")) {
          v = $$("input:checked", f).map(function (i) { return i.value; }).join(T("、", ", "));
        } else v = f.value;
        if (v && String(v).trim()) lines.push(f.getAttribute("data-label") + T("：", ": ") + String(v).trim());
      });
      lines.push(T("（來自 kidrise.com.hk）", "(Sent from kidrise.com.hk/en)"));
      var text = lines.join("\n");
      track("generate_lead", { form_name: title, method: via });
      if (via === "mail") {
        window.location.href = "mailto:" + KR.email + "?subject=" + encodeURIComponent(title) + "&body=" + encodeURIComponent(text);
      } else {
        window.open("https://wa.me/" + KR.whatsapp + "?text=" + encodeURIComponent(text), "_blank", "noopener");
      }
      toast(EN ? "Your message is ready. Please press send in " + (via === "mail" ? "your email app" : "WhatsApp") + " ✓" : "已為你準備好訊息，請在 " + (via === "mail" ? "電郵" : "WhatsApp") + " 確認送出 ✓");
    });
  });

  /* ---------- 站內搜尋（/search-index.json，按需要先載入）---------- */
  (function () {
    var dlg = $("#site-search");
    var pageInput = $("[data-search-page]");
    if (!dlg && !pageInput) return;
    var INDEX = null, loading = null;
    var load = function () {
      if (INDEX) return Promise.resolve(INDEX);
      if (!loading) loading = fetch(EN ? "/search-index.en.json" : "/search-index.json").then(function (r) { return r.json(); }).then(function (d) {
        INDEX = d.map(function (x) { x._t = (x.t + " " + x.f).toLowerCase(); x._d = (x.d + " " + x.k).toLowerCase(); return x; });
        return INDEX;
      });
      return loading;
    };
    var norm = function (q) { return q.toLowerCase().replace(/[，。！？、：；]/g, " ").trim(); };
    var score = function (x, q) {
      var terms = q.split(/\s+/).filter(Boolean), sc = 0;
      for (var i = 0; i < terms.length; i++) {
        var t = terms[i], s1 = 0;
        if (x._t.indexOf(t) > -1) s1 = x._t.indexOf(t) === 0 ? 14 : 10;
        else if (x._d.indexOf(t) > -1) s1 = 4;
        else if (t.length >= 3) {
          // 中文冇空格：用雙字詞配對，一半以上命中都計
          var hit = 0, n = t.length - 1;
          for (var j = 0; j < n; j++) { var bg = t.substr(j, 2); if (x._t.indexOf(bg) > -1) hit += 2; else if (x._d.indexOf(bg) > -1) hit += 1; }
          if (hit >= n) s1 = hit / n;
        }
        if (!s1) return 0;
        sc += s1;
      }
      return sc;
    };
    var hl = function (text, q) {
      var out = esc(text);
      q.split(/\s+/).filter(function (t) { return t.length > 0; }).forEach(function (t) {
        var e = esc(t).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        out = out.replace(new RegExp("(" + e + ")", "gi"), "<mark>$1</mark>");
      });
      return out;
    };
    var SUGGEST = EN ? ["science", "outdoor", "rainy day", "birthday gift", "age 3", "microscope", "light", "school"] : ["月相", "科學實驗", "工作紙", "戶外", "生日禮物", "3 歲", "顯微鏡", "專注力", "學校"];
    var render = function (box, raw) {
      var q = norm(raw);
      if (!q) {
        box.innerHTML = '<p class="search__hint">' + T("熱門搜尋", "Popular searches") + '</p><div class="search__chips">' +
          SUGGEST.map(function (w) { return '<button type="button" class="chip" data-q="' + esc(w) + '">' + esc(w) + "</button>"; }).join("") + "</div>";
        return;
      }
      var res = INDEX.map(function (x) { return [score(x, q), x]; }).filter(function (r) { return r[0] > 0; })
        .sort(function (a, b) { return b[0] - a[0]; }).slice(0, 30);
      if (!res.length) {
        box.innerHTML = EN ? '<p class="search__empty">Nothing found for \u201c' + esc(raw) + '\u201d. Try another word, or <a href="/en/activities/">browse all activities</a>.</p>'
          : '<p class="search__empty">找不到「' + esc(raw) + '」。試下其他字眼，或者 <a href="/resources/">瀏覽全部免費資源</a>。</p>';
        return;
      }
      box.innerHTML = '<p class="search__hint">' + res.length + (res.length === 30 ? "+" : "") + T(" 個結果", " results") + "</p><ul class=\"search__list\">" + res.map(function (r) {
        var x = r[1];
        return '<li><a class="search__item" href="' + x.u + '"><span class="search__ico" style="background:var(--' + x.c + '-soft)">' + (x.i || "📄") + "</span>" +
          '<span class="search__txt"><span class="search__kind">' + esc(x.k) + "</span><b>" + hl(x.t, q) + "</b><small>" + hl(x.d.slice(0, 70) + (x.d.length > 70 ? "…" : ""), q) + "</small></span></a></li>";
      }).join("") + "</ul>";
    };
    var bind = function (input, box) {
      var timer, sent = "";
      var run = function () {
        load().then(function () { render(box, input.value); });
        clearTimeout(timer);
        timer = setTimeout(function () {
          var q = input.value.trim();
          if (q.length > 1 && q !== sent) { sent = q; track("search", { search_term: q }); }
        }, 1200);
      };
      input.addEventListener("input", run);
      box.addEventListener("click", function (e) {
        var c = e.target.closest("[data-q]");
        if (c) { input.value = c.getAttribute("data-q"); run(); input.focus(); }
      });
      input.addEventListener("keydown", function (e) {
        var items = $$(".search__item", box);
        var cur = items.indexOf(document.activeElement);
        if (e.key === "ArrowDown" && items.length) { e.preventDefault(); items[0].focus(); }
        if (e.key === "Enter") {
          e.preventDefault();
          if (items[0]) { location.href = items[0].getAttribute("href"); }
        }
        void cur;
      });
      box.addEventListener("keydown", function (e) {
        var items = $$(".search__item", box), i = items.indexOf(document.activeElement);
        if (i < 0) return;
        if (e.key === "ArrowDown") { e.preventDefault(); (items[i + 1] || items[i]).focus(); }
        if (e.key === "ArrowUp") { e.preventDefault(); (items[i - 1] || input).focus(); }
      });
      return run;
    };
    if (dlg) {
      var input = $(".search__input", dlg), box = $("[data-search-results]", dlg);
      var run = bind(input, box);
      var open = function (e) {
        if (e) e.preventDefault();
        if (typeof dlg.showModal !== "function") { location.href = "/search/"; return; }
        if (!dlg.open) dlg.showModal();
        document.documentElement.classList.add("search-open");
        input.focus(); input.select();
        run();
      };
      dlg.addEventListener("close", function () { document.documentElement.classList.remove("search-open"); });
      $$("[data-search-open]").forEach(function (b) { b.addEventListener("click", open); });
      $("[data-search-close]", dlg).addEventListener("click", function () { dlg.close(); });
      dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
      document.addEventListener("keydown", function (e) {
        var typing = /input|textarea|select/i.test((e.target.tagName || "")) || e.target.isContentEditable;
        if ((e.key === "/" && !typing) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")) open(e);
      });
    }
    if (pageInput) {
      var runPage = bind(pageInput, $("[data-search-results]", $("main")));
      pageInput.value = new URLSearchParams(location.search).get("q") || "";
      pageInput.form.addEventListener("submit", function (e) {
        e.preventDefault();
        history.replaceState(null, "", LP + "/search/?q=" + encodeURIComponent(pageInput.value.trim()));
        runPage();
      });
      runPage();
    }
  })();

  /* ---------- Footer year ---------- */
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
