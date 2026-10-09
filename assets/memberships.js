/* Memberships — who's joining × duration price switcher, and plan pre-selection for the inquiry form.
   Prices live in each card's data-price (staff-editable; moves to the CMS later). */
(function () {
  "use strict";
  var who = 0, dur = "month";
  function t(k, f) { return (window.TLC_i18n && window.TLC_i18n.t(k)) || f; }
  var per = { month: ["ms.per.month", "/ month"], season: ["ms.per.season", "/ season"], year: ["ms.per.year", "/ year"] };

  function render() {
    document.querySelectorAll("[data-plan-card]").forEach(function (card) {
      var el = card.querySelector("[data-price]");
      var data = JSON.parse(el.dataset.price);
      var row = data[dur];
      var perEl = card.querySelector("[data-per]");
      var note = card.querySelector("[data-na-note]");
      if (row) {
        el.textContent = "$" + row[who].toLocaleString("en-US");
        el.removeAttribute("data-na");
        perEl.textContent = t(per[dur][0], per[dur][1]);
        note.hidden = true;
        card.style.opacity = "";
      } else {
        el.textContent = "—";
        el.setAttribute("data-na", "");
        perEl.textContent = "";
        note.hidden = false;
        card.style.opacity = ".72";
      }
    });
  }

  function bind(attr, set) {
    var buttons = document.querySelectorAll("[" + attr + "]");
    buttons.forEach(function (b) {
      b.addEventListener("click", function () {
        buttons.forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        set(b.getAttribute(attr));
        render();
      });
    });
  }
  bind("data-who", function (v) { who = parseInt(v, 10); });
  bind("data-dur", function (v) { dur = v; });

  // "Request information" on a plan pre-selects it in the form
  var select = document.getElementById("ms-plan");
  document.querySelectorAll("a[data-plan]").forEach(function (a) {
    a.addEventListener("click", function () {
      if (select) { select.value = a.dataset.plan; select.dispatchEvent(new Event("change")); }
    });
  });

  document.addEventListener("tlc:lang", render);
  render();
})();
