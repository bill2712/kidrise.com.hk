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
        '<div class="actcard__actions"><button type="button" class="btn btn--coral btn--sm" data-act-next>🎲 再抽一個</button><a class="btn btn--paper btn--sm" href="/activities/' + a.slug + '/">📄 完整活動卡及列印</a>' + relatedHtml(a.rel) + "</div>";
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

  /* ---------- Shopify 表格（stemtoy.com.hk）----------
     data-shop="customer"：訂閱／登記 → Shopify 客戶名單，按 data-tags 及 [data-tag] 欄位加標籤
     data-shop="contact"：查詢 → Shopify 聯絡表格，寄到網店電郵
     以新分頁提交，Shopify 如要求驗證，家長可以直接完成。 */
  function shopSubmit(form, text) {
    var kind = form.getAttribute("data-shop") || "contact";
    var f = document.createElement("form");
    f.method = "post";
    f.action = KR.shop + "/contact";
    f.target = "_blank";
    f.acceptCharset = "UTF-8";
    f.style.display = "none";
    var add = function (n, v) {
      var i = document.createElement("input");
      i.type = "hidden"; i.name = n; i.value = v;
      f.appendChild(i);
    };
    add("form_type", kind);
    add("utf8", "✓");
    var email = $('input[type="email"]', form);
    add("contact[email]", email ? email.value.trim() : "");
    if (kind === "customer") {
      var tags = (form.getAttribute("data-tags") || "").split(",").filter(Boolean);
      $$("[data-tag]", form).forEach(function (el) {
        var p = el.getAttribute("data-tag");
        var vals = el.matches("fieldset") ? $$("input:checked", el).map(function (i) { return i.value; }) : [el.value];
        vals.forEach(function (v) { if (v) tags.push(p + ":" + v); });
      });
      tags.push("kidrise.com.hk");
      add("contact[tags]", tags.join(","));
      var fn = $('[data-shop-field="first_name"]', form);
      if (fn && fn.value.trim()) add("contact[first_name]", fn.value.trim());
    } else {
      $$("[data-shop-field]", form).forEach(function (el) {
        if (el.value.trim()) add("contact[" + el.getAttribute("data-shop-field") + "]", el.value.trim());
      });
      add("contact[body]", text);
    }
    document.body.appendChild(f);
    f.submit();
    f.remove();
  }
  function formDone(form, isNews) {
    try { if (isNews) localStorage.setItem("kr_sub", "1"); } catch (e) {}
    var box = document.createElement("div");
    box.className = "form-done";
    box.setAttribute("role", "status");
    box.innerHTML = isNews
      ? '<b>🎉 多謝訂閱！</b><span>已喺新分頁開啟 stemtoy.com.hk 確認，如出現驗證請完成。你的工作紙合集已經準備好：</span><a class="btn btn--sun btn--sm" href="/resources/bundle/">打開工作紙合集 →</a>'
      : '<b>✅ 已收到！</b><span>已喺新分頁開啟 stemtoy.com.hk 確認頁，如出現驗證請完成即可。我們會盡快聯絡你。</span>';
    form.replaceWith(box);
    document.dispatchEvent(new CustomEvent("kr:celebrate", { detail: { el: box, opts: { count: 70 } } }));
  }

  // 已訂閱的訪客：喺訂閱表格下面直接顯示合集連結
  try {
    if (localStorage.getItem("kr_sub") === "1") {
      $$("form[data-newsletter]").forEach(function (f) {
        var p = document.createElement("p");
        p.className = "nl-sub";
        p.innerHTML = '你已訂閱 ✓ <a href="/resources/bundle/">打開工作紙合集 →</a>';
        f.parentNode.insertBefore(p, f.nextSibling);
      });
    }
  } catch (e) {}

  /* ---------- Enquiry forms → Shopify / WhatsApp / Email ---------- */
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
      var isNews = form.hasAttribute("data-newsletter");
      if (isNews) track("sign_up", { method: "newsletter", form_name: title });
      else track("generate_lead", { form_name: title, method: via });
      if (via === "shop") {
        shopSubmit(form, text);
        formDone(form, isNews);
        return;
      }
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
