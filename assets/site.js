/* The Leisure Club — interactions
   Everything here is progressive: without JS the page is complete and static. */
(function () {
  "use strict";
  var doc = document.documentElement;
  if (window.TLC_i18n) window.TLC_i18n.capture();
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
  function motion(method, arg) { if (window.TLC_motion) window.TLC_motion[method](arg); }
  window.TLC_beforeTranslate = function () { motion("destroy"); };
  window.TLC_afterTranslate = function () { splitWords(); motion("init"); };

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
  }
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Menu (Aman-inspired split panel) ---------- */
  var toggle = document.querySelector(".menu-toggle");
  var menu = document.getElementById("site-menu");
  var panelDefault = menu.querySelector("[data-menu-default]");
  var panelSub = menu.querySelector("[data-menu-sub]");
  var panelTitle = menu.querySelector("[data-menu-sub-title]");
  var panelList = menu.querySelector("[data-menu-sub-list]");
  function setMenu(open) {
    doc.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
    motion("pause", open);
    if (open) { var first = menu.querySelector(".menu-primary a"); if (first) first.focus(); }
    else { showPanel(null); }
  }
  function closeMenu() { if (doc.classList.contains("menu-open")) setMenu(false); }
  // desktop: hovering or focusing a section shows its pages on the right
  function showPanel(li) {
    menu.querySelectorAll(".menu-primary > li").forEach(function (x) { x.classList.toggle("is-current", x === li); });
    if (!li || !li.querySelector(".menu-sub")) { panelDefault.hidden = false; panelSub.hidden = true; return; }
    panelTitle.textContent = li.querySelector("a").textContent;
    panelList.innerHTML = "";
    li.querySelectorAll(".menu-sub a").forEach(function (a) {
      var c = a.cloneNode(true); c.className = "btn"; c.removeAttribute("data-i18n"); panelList.appendChild(c);
    });
    panelDefault.hidden = true; panelSub.hidden = false;
  }
  menu.querySelectorAll(".menu-primary > li").forEach(function (li) {
    li.addEventListener("mouseenter", function () { showPanel(li); });
    li.querySelector("a").addEventListener("focus", function () { showPanel(li); });
  });
  // mobile: chevrons open each section's pages in place
  menu.querySelectorAll(".menu-sub-toggle").forEach(function (b) {
    b.addEventListener("click", function () {
      var li = b.parentNode, open = !li.classList.contains("is-open");
      li.classList.toggle("is-open", open);
      b.setAttribute("aria-expanded", String(open));
    });
  });
  toggle.addEventListener("click", function () { setMenu(!doc.classList.contains("menu-open")); });
  menu.querySelector("[data-menu-close]").addEventListener("click", function () { setMenu(false); toggle.focus(); });
  menu.addEventListener("click", function (e) {
    if (e.target.closest("a")) closeMenu();
    else if (e.target === menu) closeMenu();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && doc.classList.contains("menu-open")) { setMenu(false); toggle.focus(); }
  });

  /* ---------- Reveals ---------- */
  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      en.target.classList.add("is-in");
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

  /* ---------- Film control (accessibility: pause the homepage film) ---------- */
  var filmBtn = document.querySelector("[data-film-toggle]");
  if (filmBtn) {
    filmBtn.addEventListener("click", function () {
      var paused = filmBtn.getAttribute("aria-pressed") !== "true";
      filmBtn.setAttribute("aria-pressed", String(paused));
      var label = filmBtn.querySelector("[data-i18n]");
      label.dataset.i18n = paused ? "hero.play" : "hero.pause";
      label.textContent = t(label.dataset.i18n, label.textContent);
      // When the real film exists: video.paused ? video.play() : video.pause();
    });
  }

  /* ---------- Inquiry forms: routed to the right team (prototype: nothing is sent) ---------- */
  function t(key, fallback) { return (window.TLC_i18n && window.TLC_i18n.t(key)) || fallback; }
  var forms = Array.prototype.slice.call(document.querySelectorAll("form[data-inquiry]"));
  function routeKey(form) {
    var sel = form.querySelector('select[name="type"]');
    var opt = sel && sel.options[sel.selectedIndex];
    return (opt && opt.dataset.route) || (sel && sel.value) || form.dataset.route || "general";
  }
  function updateRoute() {
    forms.forEach(function (form) {
      var note = form.querySelector(".route-note[data-route]");
      if (note) note.textContent = t("route." + routeKey(form), "");
    });
  }
  forms.forEach(function (form) {
    var sel = form.querySelector('select[name="type"]');
    if (sel) sel.addEventListener("change", updateRoute);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var status = form.querySelector("[data-form-status]");
      var missing = Array.prototype.filter.call(form.querySelectorAll("[required]"), function (f) { return !f.value.trim(); });
      status.hidden = false;
      if (missing.length) {
        status.textContent = t("inq.missing", "Please add your name and a phone number.");
        missing[0].focus();
        return;
      }
      status.textContent = t("inq.proto", "Prototype — nothing was sent.");
    });
  });

  // ?type=training on a link pre-selects the inquiry topic
  var qType = new URLSearchParams(location.search).get("type");
  if (qType) forms.forEach(function (form) {
    var sel = form.querySelector('select[name="type"]');
    if (sel && sel.querySelector('option[value="' + qType + '"]')) sel.value = qType;
  });

  /* ---------- Journal filters ---------- */
  document.querySelectorAll(".chips[role='group']").forEach(function (group) {
    var list = group.parentNode.querySelector("[data-journal]");
    if (!list) return;
    group.addEventListener("click", function (e) {
      var b = e.target.closest("[data-filter]"); if (!b) return;
      group.querySelectorAll("[data-filter]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      list.querySelectorAll("[data-kind]").forEach(function (item) {
        item.hidden = b.dataset.filter !== "all" && item.dataset.kind !== b.dataset.filter;
      });
    });
  });

  /* ---------- Our Story: the big year follows the chapter you're reading; the line fills ---------- */
  var legacy = document.querySelector(".legacy__list");
  if (legacy) {
    var yearEl = document.querySelector("[data-legacy-year]");
    var eras = Array.prototype.slice.call(legacy.querySelectorAll(".era"));
    var setYear = function (era) {
      var label = era.querySelector(".era__year").textContent;
      eras.forEach(function (e, i) { e.classList.toggle("is-current", e === era); e.classList.toggle("is-past", i < eras.indexOf(era)); });
      if (!yearEl || yearEl.textContent === label) return;
      yearEl.classList.add("is-changing");
      setTimeout(function () { yearEl.textContent = label; yearEl.classList.remove("is-changing"); }, 180);
    };
    if ("IntersectionObserver" in window) {
      var eraIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) setYear(en.target); });
      }, { rootMargin: "-45% 0px -50% 0px" });
      eras.forEach(function (e) { eraIO.observe(e); });
    }
    var fill = function () {
      var r = legacy.getBoundingClientRect();
      var p = Math.min(1, Math.max(0, (window.innerHeight * 0.5 - r.top) / r.height));
      legacy.style.setProperty("--legacy-p", p.toFixed(3));
    };
    window.addEventListener("scroll", fill, { passive: true }); fill();
    document.addEventListener("tlc:lang", function () { var cur = legacy.querySelector(".era.is-current") || eras[0]; yearEl.textContent = cur.querySelector(".era__year").textContent; });
  }

  /* ---------- In-page navigation: highlight the section in view ---------- */
  var subLinks = Array.prototype.slice.call(document.querySelectorAll(".subnav a[href^='#']"));
  if (subLinks.length && "IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        subLinks.forEach(function (a) {
          var on = a.getAttribute("href") === "#" + en.target.id;
          a.classList.toggle("is-active", on);
          if (on && a.scrollIntoView && a.parentNode.parentNode.scrollWidth > a.parentNode.parentNode.clientWidth) {
            a.parentNode.parentNode.scrollTo({ left: a.offsetLeft - 24, behavior: "smooth" });
          }
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    subLinks.forEach(function (a) { var el = document.querySelector(a.getAttribute("href")); if (el) spy.observe(el); });
  }

  /* ---------- Review panel ---------- */
  var review = document.querySelector("[data-review]");
  if (review) {
    var rToggle = review.querySelector(".review__toggle");
    var panel = review.querySelector(".review__panel");
    var hint = review.querySelector("[data-motion-hint]");
    var hints = {
      still: "Nothing moves. Also what visitors with “reduce motion” switched on will get.",
      quiet: "Soft fade-rise reveals and gentle hovers only — the most restrained reading of the brief.",
      expressive: "Default. Smooth scrolling, headlines rising word by word, the film framing itself as you scroll, a horizontal gallery and gentle parallax. Simple and calm."
    };
    function sync() {
      ["theme", "motion", "hero"].forEach(function (k) {
        var input = review.querySelector('input[name="' + k + '"][value="' + doc.dataset[k] + '"]');
        if (input) input.checked = true;
      });
      hint.textContent = hints[doc.dataset.motion] + (reduceMQ.matches ? " (Your device asks for reduced motion.)" : "");
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
      if (k === "motion") { doc.setAttribute("data-motion-chosen", ""); motion("refresh"); armReveals(); replayHero(); }
      if (k === "hero") { motion("refresh"); onScroll(); }
      sync();
    });
    review.querySelector("[data-copy-link]").addEventListener("click", function (e) {
      var u = new URL(location.href);
      u.hash = "";
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
  motion("refresh");
  armReveals();
  onScroll();
  requestAnimationFrame(function () { hero && hero.classList.add("is-ready"); });
})();
