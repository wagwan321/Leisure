/* Finishing touches — each one small, automatic and optional:
   1. Then/now slider      2. Live "Open now" status      3. Custom cursor (desktop only) */
(function () {
  "use strict";
  var doc = document.documentElement;
  function t(k, f) { return (window.TLC_i18n && window.TLC_i18n.t(k)) || f; }

  /* ---------- 1. Then/now slider ---------- */
  document.querySelectorAll("[data-compare]").forEach(function (el) {
    var input = el.querySelector("input[type=range]");
    var set = function () { el.style.setProperty("--pos", input.value + "%"); };
    input.addEventListener("input", set);
    set();
  });

  /* ---------- 2. Live status from assets/data/club.js ---------- */
  var club = window.TLC_CLUB;
  var DAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  function nowInClub() {
    var parts = {};
    new Intl.DateTimeFormat("en-GB", { timeZone: club.timezone, weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false, year: "numeric", month: "2-digit", day: "2-digit" })
      .formatToParts(new Date()).forEach(function (p) { parts[p.type] = p.value; });
    var day = DAYS.indexOf(parts.weekday.slice(0, 3).toLowerCase());
    return { day: day, minutes: parseInt(parts.hour, 10) % 24 * 60 + parseInt(parts.minute, 10), date: parts.year + "-" + parts.month + "-" + parts.day };
  }
  function mins(hhmm) { var p = hhmm.split(":"); return +p[0] * 60 + +p[1]; }
  function indoorText() {
    var n = nowInClub(), today = club.indoor[DAYS[n.day]];
    if (today && n.minutes >= mins(today[0]) && n.minutes < mins(today[1])) {
      return { open: true, text: t("live.open", "Open now") + " · " + t("live.until", "until") + " " + today[1] };
    }
    if (today && n.minutes < mins(today[0])) {
      return { open: false, text: t("live.closed", "Closed") + " · " + t("live.opensat", "opens at") + " " + today[0] };
    }
    for (var i = 1; i <= 7; i++) {
      var d = (n.day + i) % 7, h = club.indoor[DAYS[d]];
      if (h) {
        var when = i === 1 ? t("live.tomorrow", "tomorrow") : t("live.d." + DAYS[d], DAYS[d]);
        return { open: false, text: t("live.closed", "Closed") + " · " + t("live.opens", "opens") + " " + when + " " + h[0] };
      }
    }
    return { open: false, text: t("live.closed", "Closed") };
  }
  function islandText() {
    var s = club.island; if (!s || !s.opens) return null;
    var n = nowInClub();
    var days = Math.round((Date.parse(s.opens) - Date.parse(n.date)) / 864e5);
    if (days > 0) return t("live.islandin", "Opens in") + " " + days + " " + t(days === 1 ? "live.day" : "live.days", days === 1 ? "day" : "days");
    if (!s.closes || n.date <= s.closes) {
      var m = n.minutes, open = m >= mins(s.hours[0]) && m < mins(s.hours[1]);
      return open ? t("live.open", "Open now") + " · " + t("live.until", "until") + " " + s.hours[1] : t("live.closed", "Closed") + " · " + t("live.opensat", "opens at") + " " + s.hours[0];
    }
    return null;
  }
  function renderLive() {
    if (!club) return;
    var indoor = indoorText();
    document.querySelectorAll('[data-live="indoor"]').forEach(function (el) {
      el.classList.toggle("is-open", indoor.open);
      var target = el.querySelector("[data-live-text]") || el;
      target.textContent = indoor.text;
    });
    var island = islandText();
    if (island) document.querySelectorAll('[data-live="island"]').forEach(function (el) { el.textContent = island; });
  }
  renderLive();
  setInterval(renderLive, 60000);
  document.addEventListener("tlc:lang", renderLive);

  /* ---------- 3. Custom cursor: a small red dot that says "View" or "Drag" ---------- */
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  var cursor = document.createElement("div");
  cursor.className = "cursor"; cursor.setAttribute("aria-hidden", "true");
  cursor.innerHTML = '<span class="cursor__label"></span>';
  document.body.appendChild(cursor);
  var label = cursor.firstChild;
  var x = -100, y = -100, cx = -100, cy = -100, shown = false;
  var TARGETS = [
    ["[data-compare]", "cur.drag", "Drag"],
    [".gw, .it, .story, .card:has(> .ph), .gallery > .ph, .era .ph", "cur.view", "View"]
  ];
  document.addEventListener("mousemove", function (e) {
    x = e.clientX; y = e.clientY;
    if (!shown) { cx = x; cy = y; shown = true; }
    var mode = "", text = "";
    for (var i = 0; i < TARGETS.length; i++) {
      if (e.target.closest && e.target.closest(TARGETS[i][0])) { mode = "label"; text = t(TARGETS[i][1], TARGETS[i][2]); break; }
    }
    if (!mode && e.target.closest && e.target.closest("a, button, label, select, input, summary")) mode = "link";
    cursor.dataset.mode = mode;
    if (text) label.textContent = text;
  }, { passive: true });
  document.addEventListener("mouseout", function (e) { if (!e.relatedTarget) cursor.dataset.mode = "hidden"; });
  (function loop() {
    var still = doc.dataset.motion === "still";
    doc.classList.toggle("has-cursor", !still);
    cx += (x - cx) * (still ? 1 : 0.2); cy += (y - cy) * (still ? 1 : 0.2);
    cursor.style.transform = "translate3d(" + cx.toFixed(1) + "px," + cy.toFixed(1) + "px,0)";
    requestAnimationFrame(loop);
  })();
})();
