/* The Leisure Club — interactions
   Everything here is progressive: without JS the page is complete and static. */
(function () {
  "use strict";
  var doc = document.documentElement;
  var reduceMQ = window.matchMedia("(prefers-reduced-motion: reduce)");

  function store(patch) {
    try {
      var s = JSON.parse(localStorage.getItem("tlc-review") || "{}");
      Object.keys(patch).forEach(function (k) { s[k] = patch[k]; });
      localStorage.setItem("tlc-review", JSON.stringify(s));
    } catch (e) { /* storage unavailable — options still work for this visit */ }
  }

  /* ---------- Hero headline: split into words for the expressive reveal ---------- */
  function splitWords() {
    document.querySelectorAll("[data-split]").forEach(function (el) {
      var text = el.textContent.trim();
      el.setAttribute("aria-label", text);
      el.innerHTML = text.split(/\s+/).map(function (w, i) {
        return '<span class="split-word" aria-hidden="true"><span style="--w:' + i + '">' + w + "</span></span>";
      }).join(" ");
    });
  }
  window.TLC_afterTranslate = splitWords;

  /* ---------- Language ---------- */
  function setLang(lang) {
    if (window.TLC_i18n) window.TLC_i18n.apply(lang);
    document.querySelectorAll("[data-lang]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.lang === lang));
    });
    store({ lang: lang });
    updateRoute();
  }
  document.querySelectorAll("[data-lang]").forEach(function (b) {
    b.addEventListener("click", function () { setLang(b.dataset.lang); });
  });

  /* ---------- Header: solid after scroll, hides on scroll-down (not in Still) ---------- */
  var header = document.querySelector(".site-header");
  var hero = document.querySelector(".hero");
  var mobileCta = document.querySelector(".mobile-cta");
  var lastY = window.scrollY;
  function onScroll() {
    var y = window.scrollY;
    var heroEnd = hero ? hero.offsetHeight - 80 : 200;
    header.classList.toggle("is-scrolled", y > 40);
    var hide = doc.dataset.motion !== "still" && y > heroEnd && y > lastY + 4 && !doc.classList.contains("menu-open");
    if (hide) header.classList.add("is-hidden");
    else if (y < lastY - 4 || y < heroEnd) header.classList.remove("is-hidden");
    if (mobileCta) mobileCta.classList.toggle("is-visible", y > heroEnd * 0.6);
    lastY = y;
    parallax(y);
  }

  /* ---------- Parallax (expressive only, gentle) ---------- */
  var heroMedia = document.querySelector(".hero__media");
  function parallax(y) {
    if (!heroMedia) return;
    if (doc.dataset.motion === "expressive" && doc.dataset.hero === "bleed" && y < window.innerHeight * 1.2) {
      heroMedia.style.transform = "translate3d(0," + (y * 0.25).toFixed(1) + "px,0)";
    } else {
      heroMedia.style.transform = "";
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector(".menu-toggle");
  var menu = document.getElementById("mobile-menu");
  function closeMenu() {
    doc.classList.remove("menu-open");
    toggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }
  toggle.addEventListener("click", function () {
    var open = !doc.classList.contains("menu-open");
    doc.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
    if (open) { var first = menu.querySelector("a"); if (first) first.focus(); }
  });
  menu.addEventListener("click", function (e) { if (e.target.closest("a")) closeMenu(); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && doc.classList.contains("menu-open")) { closeMenu(); toggle.focus(); }
  });

  /* ---------- Reveals ---------- */
  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      en.target.classList.add("is-in");
      if (en.target.querySelector("[data-count]") || en.target.matches("[data-count]")) countUp(en.target);
      io.unobserve(en.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }) : null;

  function armReveals() {
    document.querySelectorAll("[data-reveal]").forEach(function (el) {
      if (doc.dataset.motion === "still" || !io) { el.classList.add("is-in"); return; }
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0 && el.classList.contains("is-in")) return;
      el.classList.remove("is-in");
      io.observe(el);
    });
  }

  /* ---------- Count-up (expressive only) ---------- */
  function countUp(scope) {
    if (doc.dataset.motion !== "expressive") return;
    scope.querySelectorAll("[data-count]").forEach(function (el) {
      var to = parseInt(el.dataset.count, 10), t0 = null, dur = 1400;
      function step(t) {
        if (!t0) t0 = t;
        var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(to * e);
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  /* ---------- Film control (accessibility: pause the homepage film) ---------- */
  var filmBtn = document.querySelector("[data-film-toggle]");
  if (filmBtn) {
    filmBtn.addEventListener("click", function () {
      var paused = filmBtn.getAttribute("aria-pressed") !== "true";
      filmBtn.setAttribute("aria-pressed", String(paused));
      var label = filmBtn.querySelector("[data-i18n]");
      label.dataset.i18n = paused ? "hero.play" : "hero.pause";
      if (window.TLC_i18n) window.TLC_i18n.apply(window.TLC_i18n.current);
      // When the real film exists: video.paused ? video.play() : video.pause();
    });
  }

  /* ---------- Inquiry routing (prototype: nothing is sent) ---------- */
  var form = document.querySelector("[data-inquiry]");
  var routeEl = document.querySelector("[data-route]");
  function t(key, fallback) { return (window.TLC_i18n && window.TLC_i18n.t(key)) || fallback; }
  function updateRoute() {
    if (!form || !routeEl) return;
    var v = form.type.value;
    routeEl.textContent = t("route." + v, "");
  }
  if (form) {
    form.type.addEventListener("change", updateRoute);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var status = form.querySelector("[data-form-status]");
      if (!form.name.value.trim() || !form.phone.value.trim()) {
        status.hidden = false;
        status.textContent = t("inq.missing", "Please add your name and a phone number.");
        (form.name.value.trim() ? form.phone : form.name).focus();
        return;
      }
      status.hidden = false;
      status.textContent = t("inq.proto", "Prototype — nothing was sent.");
    });
  }

  /* ---------- Review panel ---------- */
  var review = document.querySelector("[data-review]");
  if (review) {
    var rToggle = review.querySelector(".review__toggle");
    var panel = review.querySelector(".review__panel");
    var hint = review.querySelector("[data-motion-hint]");
    var hints = {
      still: "Nothing moves. Also what visitors with “reduce motion” switched on will get.",
      quiet: "Recommended. Soft fade-rise reveals and gentle hovers — restrained, per the brief.",
      expressive: "Word-by-word headline, image curtains, light parallax, count-ups and a slow ticker. Still calm, but more presence."
    };
    function sync() {
      ["theme", "motion", "hero"].forEach(function (k) {
        var input = review.querySelector('input[name="' + k + '"][value="' + doc.dataset[k] + '"]');
        if (input) input.checked = true;
      });
      hint.textContent = hints[doc.dataset.motion] + (reduceMQ.matches ? " (Your device asks for reduced motion.)" : "");
      document.querySelector('meta[name="theme-color"]').setAttribute("content", doc.dataset.theme === "graphite" ? "#111111" : "#F6F5F2");
    }
    rToggle.addEventListener("click", function () {
      var open = panel.hidden;
      panel.hidden = !open;
      rToggle.setAttribute("aria-expanded", String(open));
    });
    review.addEventListener("change", function (e) {
      var k = e.target.name, v = e.target.value, patch = {};
      doc.dataset[k] = v;
      patch[k] = v; store(patch);
      if (k === "motion") { doc.setAttribute("data-motion-chosen", ""); armReveals(); replayHero(); }
      if (k === "hero") onScroll();
      sync();
    });
    review.querySelector("[data-copy-link]").addEventListener("click", function (e) {
      var u = new URL(location.href);
      u.hash = "";
      u.searchParams.set("theme", doc.dataset.theme);
      u.searchParams.set("motion", doc.dataset.motion);
      u.searchParams.set("hero", doc.dataset.hero);
      if (window.TLC_i18n && window.TLC_i18n.current !== "en") u.searchParams.set("lang", window.TLC_i18n.current);
      var btn = e.currentTarget;
      var done = function () { btn.textContent = "Link copied"; setTimeout(function () { btn.textContent = "Copy share link"; }, 1800); };
      if (navigator.clipboard) navigator.clipboard.writeText(u.toString()).then(done, function () { prompt("Copy this link:", u.toString()); });
      else prompt("Copy this link:", u.toString());
    });
    sync();
  }

  function replayHero() {
    if (!hero) return;
    hero.classList.remove("is-ready");
    void hero.offsetWidth;
    hero.classList.add("is-ready");
  }

  /* ---------- Init ---------- */
  var q = new URLSearchParams(location.search), saved = {};
  try { saved = JSON.parse(localStorage.getItem("tlc-review") || "{}"); } catch (e) {}
  var lang = q.get("lang") || saved.lang || "en";
  if (lang !== "en") setLang(lang); else { splitWords(); updateRoute(); }
  armReveals();
  onScroll();
  requestAnimationFrame(function () { hero && hero.classList.add("is-ready"); });
})();
