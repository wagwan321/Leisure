/* Page signatures: each page has its own interactive piece.
   - The Club: two halves (Indoor / Leisure Island) that open on hover, tap or focus
   - Fitness: "this week at the club" board with day tabs, and the HYROX track that lights up as you scroll
   - Community: medal cards that tilt toward the pointer
   Pictures are never scaled, shifted or clipped by scrolling; only frames, lines and text move. */
(function () {
  "use strict";
  var still = function () { return document.documentElement.dataset.motion === "still"; };
  function t(k, f) { var v = window.TLC_i18n && window.TLC_i18n.t(k); return v != null ? v : f; }

  // ---------- The Club: two halves ----------
  document.querySelectorAll("[data-duo]").forEach(function (duo) {
    var halves = duo.querySelectorAll(".duo__half");
    function open(h) { halves.forEach(function (x) { x.classList.toggle("is-open", x === h); }); }
    var hover = window.matchMedia("(hover: hover) and (min-width: 900px)");
    halves.forEach(function (h) {
      h.addEventListener("mouseenter", function () { if (hover.matches) open(h); });
      h.addEventListener("focusin", function () { open(h); });
      h.addEventListener("click", function (e) { if (!h.classList.contains("is-open")) { e.preventDefault(); open(h); } });
    });
  });

  // ---------- Fitness: this week at the club ----------
  var board = document.querySelector("[data-today]");
  if (board && window.TLC_SCHEDULE) {
    var DAYS = ["mon", "tue", "wed", "thu", "fri", "sat"];
    var EN = { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat" };
    var tabs = board.querySelector(".today__tabs"), list = board.querySelector(".today__list");
    var now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Beirut" }));
    var todayKey = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][now.getDay()];
    var current = DAYS.indexOf(todayKey) >= 0 ? todayKey : "mon";
    var mins = now.getHours() * 60 + now.getMinutes();
    function lang() { return (window.TLC_i18n && window.TLC_i18n.current) || "en"; }
    function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
    function items(day) {
      var out = [];
      window.TLC_SCHEDULE.classes.forEach(function (c) {
        c.sessions.forEach(function (s) { if (s[0] === day) out.push({ c: c, time: s[1], ages: s[2] }); });
      });
      return out.sort(function (a, b) { return a.time.localeCompare(b.time); });
    }
    function drawTabs() {
      tabs.innerHTML = DAYS.map(function (d) {
        var label = t("sch.d." + d, EN[d]);
        if (label.length > 4 && lang() === "en") label = EN[d];
        return '<button type="button" role="tab" data-day="' + d + '" aria-selected="' + (d === current) + '">' + esc(label) + (d === todayKey ? '<i aria-hidden="true"></i>' : "") + "</button>";
      }).join("");
    }
    function draw() {
      var rows = items(current), nextDone = false;
      list.innerHTML = rows.map(function (it, i) {
        var who = it.c.group === "kids" ? t("sch.kids", "Kids") + (it.ages ? " · " + it.ages : "") : t("sch.adults", "Adults");
        var hm = it.time.split(":"), m = +hm[0] * 60 + +hm[1];
        var next = !nextDone && current === todayKey && m >= mins; if (next) nextDone = true;
        return '<li class="today__row c-' + it.c.facility + (it.c.group === "kids" ? " is-kids" : "") + (next ? " is-next" : "") + '" style="--n:' + i + '">' +
          '<time dir="ltr">' + it.time + "</time><b>" + esc(it.c.name[lang()] || it.c.name.en) + "</b><span>" + esc(who) + "</span>" +
          (next ? '<em>' + esc(t("fp.next", "Next up")) + "</em>" : "") + "</li>";
      }).join("");
      list.classList.remove("is-in"); void list.offsetWidth; list.classList.add("is-in");
    }
    tabs.addEventListener("click", function (e) {
      var b = e.target.closest("[data-day]"); if (!b) return;
      current = b.dataset.day; drawTabs(); draw();
    });
    document.addEventListener("tlc:lang", function () { drawTabs(); draw(); });
    drawTabs(); draw();
  }

  // ---------- Fitness: the HYROX track fills as you scroll ----------
  var track = document.querySelector("[data-track]");
  if (track) {
    var fill = track.querySelector(".track__fill"), sts = track.querySelectorAll(".track__st"), ticking = false;
    function update() {
      ticking = false;
      var r = track.getBoundingClientRect(), vh = window.innerHeight;
      var p = still() ? 1 : Math.max(0, Math.min(1, (vh * 0.85 - r.top) / (vh * 0.6)));
      fill.style.transform = "scaleX(" + p.toFixed(3) + ")";
      sts.forEach(function (s, i) { s.classList.toggle("is-on", p >= (i + 0.5) / sts.length); });
    }
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  // ---------- Aquatics: the opening photo is water you can touch (WebGL ripples) ----------
  var rip = document.querySelector("[data-ripple]");
  if (rip) {
    var hint = rip.parentNode.querySelector(".ripple__hint"), $r = null, timer = null;
    function drop() {
      if (!$r || document.hidden) return;
      var w = rip.clientWidth, h = rip.clientHeight;
      $r.ripples("drop", Math.random() * w, Math.random() * h, 18 + Math.random() * 14, 0.05 + Math.random() * 0.05);
    }
    function start() {
      if ($r || still() || !window.jQuery || !window.jQuery.fn.ripples) return;
      try {
        $r = window.jQuery(rip);
        $r.ripples({ resolution: 384, dropRadius: 22, perturbance: 0.035, interactive: true });
        timer = setInterval(drop, 2600); setTimeout(drop, 600);
      } catch (e) { $r = null; rip.parentNode.classList.add("no-ripple"); }
    }
    function stop() {
      if (!$r) return;
      clearInterval(timer); try { $r.ripples("destroy"); } catch (e) {}
      $r = null; rip.style.backgroundImage = rip.style.backgroundImage;
    }
    rip.addEventListener("pointermove", function () { if (hint) hint.classList.add("is-gone"); }, { once: true });
    new MutationObserver(function () { still() ? stop() : start(); }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-motion"] });
    if (document.readyState === "complete") start(); else window.addEventListener("load", start);
  }

  // ---------- Hospitality & Events: the occasion in the title keeps changing ----------
  var rot = document.querySelector("[data-rotate]");
  if (rot) {
    var words = rot.children, wi = 0;
    setInterval(function () {
      if (still() || document.hidden) return;
      words[wi].classList.remove("is-on"); words[wi].classList.add("is-off");
      var prev = words[wi]; setTimeout(function () { prev.classList.remove("is-off"); }, 700);
      wi = (wi + 1) % words.length; words[wi].classList.add("is-on");
    }, 2400);
  }

  // ---------- Hospitality & Events: venue list, the picture follows the name ----------
  document.querySelectorAll("[data-menuboard]").forEach(function (mb) {
    var items = mb.querySelectorAll(".menuboard__item"), layers = mb.querySelectorAll(".menuboard__layer");
    function act(i) {
      items.forEach(function (x, k) { x.classList.toggle("is-active", k === i); });
      layers.forEach(function (x, k) { x.classList.toggle("is-active", k === i); });
    }
    items.forEach(function (it, i) {
      it.addEventListener("mouseenter", function () { act(i); });
      it.addEventListener("focus", function () { act(i); });
      it.addEventListener("click", function () { act(i); });
    });
  });

  // ---------- Hospitality & Events: plan your event, writes the WhatsApp message ----------
  var planner = document.querySelector("[data-planner]");
  if (planner) {
    var MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    var MEN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var mBox = planner.querySelector("[data-months]");
    var nowM = new Date().getMonth();
    var st = { occ: "wedding", month: (nowM + 2) % 12, guests: "30–100" };
    function mName(i) { return t("evp.m." + MONTHS[i], MEN[i]); }
    function drawMonths() {
      var h = "";
      for (var k = 0; k < 12; k++) {
        var i = (nowM + k) % 12;
        h += '<button type="button" role="radio" aria-checked="' + (i === st.month) + '" data-month="' + i + '">' + mName(i) + "</button>";
      }
      mBox.innerHTML = h;
    }
    function occLabel() { var b = planner.querySelector('[data-occ="' + st.occ + '"]'); return b ? b.textContent.trim() : st.occ; }
    function out() {
      planner.querySelector("[data-out-occ]").textContent = occLabel();
      planner.querySelector("[data-out-month]").textContent = mName(st.month);
      planner.querySelector("[data-out-guests]").textContent = st.guests + " " + t("evp.guests", "guests");
      var msg = t("evp.msg", "Hello, I would like to plan a {occ} at The Leisure Club around {month}, for about {guests} guests.")
        .replace("{occ}", occLabel().toLowerCase()).replace("{month}", mName(st.month)).replace("{guests}", st.guests);
      planner.querySelector("[data-out-link]").href = "https://wa.me/9613478200?text=" + encodeURIComponent(msg);
      var card = planner.querySelector(".planner__card"); card.classList.remove("is-bump"); void card.offsetWidth; card.classList.add("is-bump");
    }
    planner.addEventListener("click", function (e) {
      var b = e.target.closest("button[role=radio]"); if (!b) return;
      var group = b.parentNode;
      group.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-checked", String(x === b)); });
      if (b.dataset.occ) st.occ = b.dataset.occ;
      if (b.dataset.month) st.month = +b.dataset.month;
      if (b.dataset.guests) st.guests = b.dataset.guests;
      out();
    });
    document.querySelectorAll("[data-plan-occ]").forEach(function (a) {
      a.addEventListener("click", function () {
        var b = planner.querySelector('[data-occ="' + a.dataset.planOcc + '"]'); if (b) b.click();
      });
    });
    document.addEventListener("tlc:lang", function () { drawMonths(); out(); });
    drawMonths(); out();
  }

  // ---------- Community: medal cards tilt toward the pointer ----------
  document.querySelectorAll("[data-tilt] > *").forEach(function (card) {
    card.addEventListener("pointermove", function (e) {
      if (still() || e.pointerType !== "mouse") return;
      var r = card.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      card.style.setProperty("--ry", (x * 10).toFixed(2) + "deg");
      card.style.setProperty("--rx", (-y * 10).toFixed(2) + "deg");
    });
    card.addEventListener("pointerleave", function () { card.style.setProperty("--ry", "0deg"); card.style.setProperty("--rx", "0deg"); });
  });
})();
