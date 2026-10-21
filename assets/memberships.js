/* Memberships: the Solo / Duo / Family switch updates every price on the page.
   Prices live in each price's data-price as [solo, duo, family] (from the affiliation 2027 flyer).
   Also: review bubbles and the Book your event ring appear as they come into view,
   and "Request information" on a card pre-selects that plan in the form. */
(function () {
  "use strict";
  var who = 0;

  function render(flash) {
    document.querySelectorAll("[data-price]").forEach(function (el) {
      var row = JSON.parse(el.dataset.price);
      el.textContent = "$" + row[who].toLocaleString("en-US");
      if (flash) { el.removeAttribute("data-flash"); void el.offsetWidth; el.setAttribute("data-flash", ""); }
    });
  }

  var buttons = document.querySelectorAll("[data-who]");
  buttons.forEach(function (b) {
    b.addEventListener("click", function () {
      who = parseInt(b.dataset.who, 10);
      buttons.forEach(function (x) { x.setAttribute("aria-pressed", String(x.dataset.who === b.dataset.who)); });
      render(true);
    });
  });

  var select = document.getElementById("ms-plan");
  document.querySelectorAll("a[data-plan]").forEach(function (a) {
    a.addEventListener("click", function () {
      if (select) { select.value = a.dataset.plan; select.dispatchEvent(new Event("change")); }
    });
  });

  // bubbles and the event ring come in once, when seen
  var show = document.querySelectorAll("[data-bubble], [data-ring]");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add(e.target.hasAttribute("data-ring") ? "is-spin" : "is-in");
        io.unobserve(e.target);
      });
    }, { threshold: 0.4 });
    show.forEach(function (el) { io.observe(el); });
  } else {
    show.forEach(function (el) { el.classList.add("is-in", "is-spin"); });
  }

  render(false);
})();
