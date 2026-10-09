/* Weekly schedule — filters by activity, age group, facility and day (brief §15).
   Reads window.TLC_SCHEDULE (assets/data/schedule.js). */
(function () {
  "use strict";
  var data = window.TLC_SCHEDULE;
  var root = document.querySelector("[data-schedule]");
  if (!data || !root) return;

  var DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  var week = root.querySelector("[data-week]");
  var count = root.querySelector("[data-count]");
  var f = {
    activity: root.querySelector("#f-activity"),
    group: root.querySelector("#f-group"),
    facility: root.querySelector("#f-facility"),
    day: root.querySelector("#f-day")
  };

  function lang() { return (window.TLC_i18n && window.TLC_i18n.current) || "en"; }
  function t(k, fb) { return (window.TLC_i18n && window.TLC_i18n.t(k)) || fb; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  // activity options, de-duplicated by English name
  function fillActivities() {
    var current = f.activity.value || "all";
    var seen = {}, opts = ['<option value="all">' + esc(t("sch.f.allact", "All activities")) + "</option>"];
    data.classes.forEach(function (c) {
      var key = c.name.en;
      if (seen[key]) return; seen[key] = 1;
      opts.push('<option value="' + esc(key) + '">' + esc(c.name[lang()] || c.name.en) + "</option>");
    });
    f.activity.innerHTML = opts.join("");
    f.activity.value = current;
  }

  function render() {
    var a = f.activity.value, g = f.group.value, fac = f.facility.value, d = f.day.value;
    var byDay = {}; DAYS.forEach(function (x) { byDay[x] = []; });
    var total = 0;
    data.classes.forEach(function (c) {
      if (a !== "all" && c.name.en !== a) return;
      if (g !== "all" && c.group !== g) return;
      if (fac !== "all" && c.facility !== fac) return;
      c.sessions.forEach(function (s) {
        if (d !== "all" && s[0] !== d) return;
        byDay[s[0]].push({ c: c, time: s[1], ages: s[2] });
        total++;
      });
    });
    var days = d === "all" ? DAYS : [d];
    week.innerHTML = days.map(function (day) {
      var items = byDay[day].sort(function (x, y) { return x.time.localeCompare(y.time); });
      var body = items.length ? items.map(function (it) {
        var who = it.c.group === "kids"
          ? t("sch.kids", "Kids") + (it.ages ? " · " + t("sch.ages", "ages") + " " + it.ages : "")
          : t("sch.adults", "Adults");
        return '<div class="slot c-' + it.c.facility + '">' +
          '<time dir="ltr">' + it.time + "</time>" +
          "<b>" + esc(it.c.name[lang()] || it.c.name.en) + "</b>" +
          "<small>" + esc(who) + " · " + esc(t("sch.fac." + it.c.facility, it.c.facility)) + "</small>" +
          "<small>" + esc(t("sch.coach", "Coach to be confirmed")) + "</small>" +
          "</div>";
      }).join("") : '<p class="day__empty">' + esc(t("sch.none", "No classes")) + "</p>";
      return '<div class="day"><h3>' + esc(t("sch.d." + day, day)) + "</h3>" + body + "</div>";
    }).join("");
    week.style.gridTemplateColumns = d === "all" ? "" : "1fr";
    var key = total === 1 ? "sch.session" : (total >= 3 && total <= 10 ? "sch.sessions.few" : "sch.sessions");
    count.textContent = total + " " + t(key, total === 1 ? "session this week" : "sessions this week");
  }

  // deep links: ?facility=performance, ?group=kids, #kids
  var q = new URLSearchParams(location.search);
  ["facility", "group", "day"].forEach(function (k) { if (q.get(k) && f[k].querySelector('option[value="' + q.get(k) + '"]')) f[k].value = q.get(k); });
  if (location.hash === "#kids") f.group.value = "kids";

  Object.keys(f).forEach(function (k) { f[k].addEventListener("change", render); });
  root.querySelector("[data-reset]").addEventListener("click", function () {
    Object.keys(f).forEach(function (k) { f[k].value = "all"; });
    render();
  });
  document.addEventListener("tlc:lang", function () { fillActivities(); render(); });
  fillActivities();
  render();
})();
