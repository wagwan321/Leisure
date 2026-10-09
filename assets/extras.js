/* Finishing touches — each one small, automatic and optional:
   1. Then/now slider      2. Live "Open now" status */
(function () {
  "use strict";
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
})();
