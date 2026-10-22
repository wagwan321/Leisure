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

  // ---------- Aquatics: lane lines draw across when they come into view ----------
  var lanes = document.querySelectorAll(".lane");
  if (lanes.length) {
    if ("IntersectionObserver" in window) {
      var lio = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); lio.unobserve(e.target); } });
      }, { threshold: 0.6 });
      lanes.forEach(function (l) { lio.observe(l); });
    } else { lanes.forEach(function (l) { l.classList.add("is-in"); }); }
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
