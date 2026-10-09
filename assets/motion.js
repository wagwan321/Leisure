/* The Leisure Club — scroll motion (the "Expressive" level)
   Patterns studied from the brief's references (§19):
   - Equinox   smooth inertial scroll, framed film, bold statements
   - Aman      slow film, horizontal story rows, quiet parallax
   - Six Senses  statement text that comes alive as you read
   - Technogym   performance media that expands to fill the screen
   Runs only when html[data-motion="expressive"] and GSAP is available; otherwise
   the CSS reveals in site.css (Quiet) or nothing at all (Still) apply. */
(function () {
  "use strict";
  var doc = document.documentElement;
  var ctx = null, mm = null, lenis = null;
  var claimed = [], splitEls = [], cleanups = [];

  function enabled() {
    return doc.dataset.motion === "expressive" && window.gsap && window.ScrollTrigger;
  }

  /* Elements animated here are taken out of the CSS reveal system so the two never fight */
  function claim(el) {
    if (el.hasAttribute("data-reveal")) { el.removeAttribute("data-reveal"); claimed.push(el); }
    el.classList.add("is-in");
  }
  function release() {
    claimed.forEach(function (el) { el.setAttribute("data-reveal", ""); el.classList.add("is-in"); });
    claimed = [];
  }

  /* Split text into masked words, keeping inline markup such as <em> */
  function splitWords(el) {
    el.dataset.splitOrig = el.innerHTML;
    var words = [];
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            var mask = document.createElement("span"), inner = document.createElement("span");
            mask.className = "mw"; inner.textContent = part;
            mask.appendChild(inner); frag.appendChild(mask); words.push(inner);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1) {
          walk(n);
        }
      });
    })(el);
    splitEls.push(el);
    return words;
  }
  function unsplit() {
    splitEls.forEach(function (el) {
      if (el.dataset.splitOrig != null) { el.innerHTML = el.dataset.splitOrig; delete el.dataset.splitOrig; }
    });
    splitEls = [];
  }

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function gutter() { var w = $(".wrap"); return w ? parseFloat(getComputedStyle(w).paddingLeft) || 24 : 24; }

  /* ---------- Scenes ---------- */

  // Hero — slow settle on load, then the film frames itself as you scroll away (Equinox)
  function hero() {
    var h = $(".hero"); if (!h) return;
    var media = $(".hero__media", h), content = $(".hero__content", h);
    gsap.fromTo(media, { scale: 1.12 }, { scale: 1, duration: 2.8, ease: "power2.out" });
    if (doc.dataset.hero === "bleed") {
      var g = gutter();
      gsap.timeline({ scrollTrigger: { trigger: h, start: "top top", end: "bottom top", scrub: true } })
        .fromTo(media, { clipPath: "inset(0px 0px 0px 0px round 0px)" },
          { clipPath: "inset(0px " + g + "px " + g * 2 + "px " + g + "px round 16px)", ease: "none" }, 0)
        .to(content, { yPercent: -18, opacity: 0, ease: "none" }, 0);
    } else {
      gsap.fromTo(media, { clipPath: "inset(0px 0px 0px 0px round 2px)" },
        { clipPath: "inset(6% 0px 0px 0px round 2px)", ease: "none",
          scrollTrigger: { trigger: media, start: "top 20%", end: "bottom top", scrub: true } });
    }
  }

  // Section headlines rise word by word from behind a mask
  function headlines() {
    $$("main .h2, main .page-title, .footer__brand .h3").forEach(function (h) {
      claim(h);
      var words = splitWords(h);
      gsap.from(words, {
        yPercent: 115, duration: 1.25, ease: "expo.out", stagger: 0.06,
        scrollTrigger: { trigger: h, start: "top 88%", once: true }
      });
    });
    $$("main .eyebrow").forEach(function (e) {
      if (e.closest(".hero")) return;
      claim(e);
      gsap.from(e, { opacity: 0, x: doc.dir === "rtl" ? 24 : -24, duration: 1, ease: "expo.out",
        scrollTrigger: { trigger: e, start: "top 90%", once: true } });
    });
  }

  // Interior page hero — the opening image settles, then drifts as you scroll on
  function pageHero() {
    var media = $(".page-hero__media .ph"); if (!media) return;
    var wrap = media.parentNode; claim(wrap);
    gsap.fromTo(media, { scale: 1.08, opacity: 0 }, { scale: 1, opacity: 1, duration: 2, ease: "power3.out", delay: 0.2 });
    gsap.to(media, { "--zoom": 1.12, ease: "none",
      scrollTrigger: { trigger: wrap, start: "top 60%", end: "bottom top", scrub: true } });
    $$(".page-hero__aside > *, .crumbs").forEach(function (el, i) {
      gsap.from(el, { y: 24, opacity: 0, duration: 1.1, ease: "expo.out", delay: 0.35 + i * 0.08 });
    });
  }

  // Any [data-stagger] group: children arrive one after another
  function staggers() {
    $$("[data-stagger]").forEach(function (group) {
      if (group.classList.contains("plans")) return; // memberships() handles plan cards
      var kids = Array.prototype.slice.call(group.children).filter(function (k) { return !k.matches(".sr-only"); });
      kids.forEach(claim);
      gsap.from(kids, { y: 70, opacity: 0, duration: 1.15, ease: "expo.out", stagger: 0.09,
        scrollTrigger: { trigger: group, start: "top 86%", once: true } });
    });
  }

  // Statement — words light up as you read down the page (Six Senses / Equinox)
  function statements() {
    $$("[data-scrub-words]").forEach(function (p) {
      claim(p);
      p.classList.add("is-scrub");
      var words = splitWords(p);
      gsap.fromTo(words, { opacity: 0.14 }, {
        opacity: 1, stagger: 0.1, ease: "none",
        scrollTrigger: { trigger: p, start: "top 82%", end: "bottom 50%", scrub: true }
      });
    });
  }

  // Images drift at their own pace (Aman)
  function parallax() {
    $$("[data-parallax]").forEach(function (el) {
      var s = parseFloat(el.dataset.parallax) || 0.1;
      gsap.fromTo(el, { yPercent: s * 100 }, {
        yPercent: -s * 100, ease: "none",
        scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true }
      });
    });
  }

  // Count-ups for the heritage facts
  function facts() {
    $$(".facts [data-count]").forEach(function (el) {
      var to = parseInt(el.dataset.count, 10), obj = { v: 0 };
      gsap.to(obj, { v: to, duration: 1.6, ease: "power3.out",
        onUpdate: function () { el.textContent = Math.round(obj.v); },
        scrollTrigger: { trigger: el, start: "top 90%", once: true } });
    });
  }

  // Performance Center — the film grows to full width as it arrives (Technogym)
  function performance() {
    var film = $("[data-expand]"); if (!film) return;
    gsap.fromTo(film, { scale: 0.74, borderRadius: 28 }, {
      scale: 1, borderRadius: 2, ease: "none",
      scrollTrigger: { trigger: film, start: "top 95%", end: "top 22%", scrub: true }
    });
    var cols = $$("#performance .access__col");
    if (!cols.length) return;
    cols.forEach(claim);
    gsap.from(cols, { y: 60, opacity: 0, duration: 1.1, ease: "expo.out", stagger: 0.12,
      scrollTrigger: { trigger: ".access", start: "top 85%", once: true } });
  }

  // Memberships — cards arrive in sequence, then their inclusions tick in
  function memberships() {
    var cards = $$(".plan"); if (!cards.length) return;
    cards.forEach(claim);
    gsap.from(cards, { y: 90, opacity: 0, duration: 1.2, ease: "expo.out", stagger: 0.12,
      scrollTrigger: { trigger: ".plans", start: "top 85%", once: true } });
    cards.forEach(function (c) {
      gsap.from($$(".plan__incl li", c), { opacity: 0, x: doc.dir === "rtl" ? 16 : -16, duration: 0.6, stagger: 0.06, delay: 0.45,
        scrollTrigger: { trigger: c, start: "top 85%", once: true } });
    });
  }

  // Community — club rows slide in like a list being written
  function community() {
    var rows = $$(".club"); if (!rows.length) return;
    rows.forEach(claim);
    gsap.from(rows, { x: doc.dir === "rtl" ? 50 : -50, opacity: 0, duration: 1, ease: "expo.out", stagger: 0.1,
      scrollTrigger: { trigger: ".clubs", start: "top 85%", once: true } });
  }

  // Leisure Island — the lagoon opens out to full width, tiles rise in
  function island() {
    var s = $("main > .island:not(.page-hero)"); if (!s) return;
    gsap.fromTo(s, { clipPath: "inset(5% 4% 0% 4% round 36px)" }, {
      clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "none",
      scrollTrigger: { trigger: s, start: "top 95%", end: "top 15%", scrub: true }
    });
    var tiles = $$(".it", s);
    if (!tiles.length) return;
    tiles.forEach(claim);
    var st = { trigger: ".island-tiles", start: "top 82%", once: true };
    gsap.from(tiles, { y: 60, opacity: 0, duration: 1.1, ease: "expo.out", stagger: 0.08, scrollTrigger: st });
    var season = $(".season", s);
    if (season) gsap.from(season, { y: 20, opacity: 0, duration: 0.9, ease: "expo.out",
      scrollTrigger: { trigger: season, start: "top 90%", once: true } });
  }

  // Thin red reading line under the header
  function progress() {
    var bar = $(".progress"); if (!bar) return;
    gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });
  }

  // Explore Our World — horizontal gallery pinned in place (desktop only, Aman / Six Senses)
  function horizontal() {
    var sec = $(".explore"), track = $(".explore__track"), bar = $(".explore__bar i");
    if (!sec || !track) return;
    var rtl = doc.dir === "rtl";
    sec.classList.add("is-horizontal");
    var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
    var tween = gsap.to(track, {
      x: function () { return (rtl ? 1 : -1) * dist(); }, ease: "none",
      scrollTrigger: {
        trigger: sec, start: "top top", end: function () { return "+=" + dist(); },
        pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1,
        onUpdate: function (self) { if (bar) bar.style.transform = "scaleX(" + self.progress.toFixed(3) + ")"; }
      }
    });
    if (!rtl) {
      $$(".gw__media .ph", sec).forEach(function (ph) {
        // drift the image layer only (the ::before today, the <img> later) so labels stay put
        gsap.fromTo(ph, { "--drift": "7%", "--zoom": 1.16 }, { "--drift": "-7%", "--zoom": 1.16, ease: "none",
          scrollTrigger: { trigger: ph.parentNode, containerAnimation: tween, start: "left right", end: "right left", scrub: true } });
      });
    }
    return function () {
      sec.classList.remove("is-horizontal");
      gsap.set(track, { clearProps: "x" });
      if (bar) bar.style.transform = "";
    };
  }

  /* ---------- Smooth scroll (Lenis — the same approach Equinox uses) ---------- */
  function raf(time) { if (lenis) lenis.raf(time * 1000); }
  function onAnchor(e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || !lenis) return;
    var id = a.getAttribute("href");
    var target = id.length > 1 ? document.querySelector(id) : null;
    if (id.length > 1 && !target) return;
    e.preventDefault();
    lenis.scrollTo(target && target.id !== "top" ? target : 0, { offset: -72, duration: 1.4 });
    if (history.replaceState) history.replaceState(null, "", id);
  }
  function startLenis() {
    if (!window.Lenis || lenis) return;
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    document.addEventListener("click", onAnchor);
  }
  function stopLenis() {
    if (!lenis) return;
    gsap.ticker.remove(raf);
    document.removeEventListener("click", onAnchor);
    lenis.destroy();
    lenis = null;
  }

  /* ---------- Lifecycle ---------- */
  function init() {
    if (ctx || !enabled()) return;
    gsap.registerPlugin(ScrollTrigger);
    startLenis();
    ctx = gsap.context(function () {
      if ($(".hero")) hero();
      pageHero(); headlines(); statements(); parallax(); facts(); staggers();
      performance(); memberships(); community(); island(); progress();
    });
    mm = gsap.matchMedia();
    mm.add("(min-width: 1000px)", horizontal);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  }
  function destroy() {
    if (mm) { mm.revert(); mm = null; }
    if (ctx) { ctx.revert(); ctx = null; }
    cleanups.forEach(function (fn) { fn(); }); cleanups = [];
    unsplit();
    release();
    stopLenis();
  }

  window.TLC_motion = {
    init: init,
    destroy: destroy,
    refresh: function () { destroy(); init(); },
    pause: function (on) { if (lenis) { on ? lenis.stop() : lenis.start(); } }
  };
})();
