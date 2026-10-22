/* Memberships and the interactive pieces around them.
   - Solo / Duo / Family switch updates every price (data-price = [solo, duo, family], affiliation 2027 flyer).
   - "What's included" opens the details of that card only.
   - Beyond Membership rows open one at a time.
   - Book your event: the photo panel under the pointer (or tapped / focused) opens.
   - Reviews: a slow moving wall of quotes, stars filling in when seen.
   - "Request information" on a card pre-selects that plan in the form. */
(function () {
  "use strict";
  var who = 0;
  var still = function () { return document.documentElement.dataset.motion === "still"; };

  function render(flash) {
    document.querySelectorAll("[data-price]").forEach(function (el) {
      var row = JSON.parse(el.dataset.price);
      el.textContent = "$" + row[who].toLocaleString("en-US");
      if (flash) { el.removeAttribute("data-flash"); void el.offsetWidth; el.setAttribute("data-flash", ""); }
    });
  }
  var whoButtons = document.querySelectorAll("[data-who]");
  whoButtons.forEach(function (b) {
    b.addEventListener("click", function () {
      who = parseInt(b.dataset.who, 10);
      whoButtons.forEach(function (x) { x.setAttribute("aria-pressed", String(x.dataset.who === b.dataset.who)); });
      render(true);
    });
  });

  // What's included: this card only
  document.querySelectorAll(".mopen").forEach(function (btn) {
    var panel = document.getElementById(btn.getAttribute("aria-controls"));
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") !== "true";
      btn.setAttribute("aria-expanded", String(open));
      if (panel) panel.classList.toggle("is-open", open);
    });
  });

  // Beyond Membership rows: one open at a time
  document.querySelectorAll("[data-svc]").forEach(function (list) {
    var items = list.querySelectorAll(".svc__item");
    items.forEach(function (item) {
      item.querySelector(".svc__head").addEventListener("click", function () {
        var wasOpen = item.classList.contains("is-open");
        items.forEach(function (x) { x.classList.remove("is-open"); x.querySelector(".svc__head").setAttribute("aria-expanded", "false"); });
        if (!wasOpen) { item.classList.add("is-open"); item.querySelector(".svc__head").setAttribute("aria-expanded", "true"); }
      });
    });
  });

  // Beyond Membership: cards stack as you scroll; each one's figures count up when it arrives,
  // and a card darkens as the next one slides over it
  document.querySelectorAll("[data-stack]").forEach(function (stack) {
    var cards = Array.prototype.slice.call(stack.querySelectorAll(".stack__card"));
    function count(card) {
      card.querySelectorAll("[data-num]").forEach(function (el) {
        var to = parseFloat(el.dataset.num), t0 = null;
        if (still() || to < 5) { el.textContent = to; return; }
        function step(ts) {
          if (!t0) t0 = ts;
          var k = Math.min(1, (ts - t0) / 1100);
          el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
          if (k < 1) requestAnimationFrame(step);
        }
        el.textContent = "0"; requestAnimationFrame(step);
      });
    }
    if ("IntersectionObserver" in window) {
      var seen = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          e.target.classList.add("is-in"); count(e.target); seen.unobserve(e.target);
        });
      }, { threshold: 0.35 });
      cards.forEach(function (c) { seen.observe(c); });
    } else { cards.forEach(function (c) { c.classList.add("is-in"); }); }
    var ticking = false;
    function cover() {
      ticking = false;
      cards.forEach(function (c, i) {
        var next = cards[i + 1]; if (!next) return;
        var a = c.getBoundingClientRect(), b = next.getBoundingClientRect();
        var k = Math.max(0, Math.min(1, 1 - (b.top - a.top) / a.height));
        c.style.setProperty("--cover", k.toFixed(3));
      });
    }
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(cover); } }, { passive: true });
    cover();
  });

  // Book your event panels
  document.querySelectorAll("[data-evx]").forEach(function (wrap) {
    var panels = wrap.querySelectorAll(".evx__p");
    function activate(p) { panels.forEach(function (x) { x.classList.toggle("is-active", x === p); }); }
    var hover = window.matchMedia("(hover: hover) and (min-width: 800px)");
    panels.forEach(function (p) {
      p.addEventListener("mouseenter", function () { if (hover.matches) activate(p); });
      p.addEventListener("click", function () { activate(p); });
      p.addEventListener("focus", function () { activate(p); });
      p.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activate(p); } });
    });
  });

  // Reviews wall: duplicate the quotes so the row loops seamlessly, and add a second row going the other way
  document.querySelectorAll("[data-qwall]").forEach(function (wall) {
    var row = wall.querySelector(".qrow"); if (!row) return;
    var cards = Array.prototype.slice.call(row.children);
    function clone(list, into) {
      list.forEach(function (c) { var k = c.cloneNode(true); k.setAttribute("aria-hidden", "true"); into.appendChild(k); });
    }
    clone(cards, row); clone(cards, row); clone(cards, row);  // 4 copies: the row is twice the loop length
    var row2 = document.createElement("div");
    row2.className = "qrow qrow--b"; row2.setAttribute("aria-hidden", "true");
    var rev = cards.slice().reverse();
    clone(rev, row2); clone(rev, row2); clone(rev, row2); clone(rev, row2);
    wall.appendChild(row2);
  });

  // things that animate once when they come into view
  function countUp(el) {
    var to = parseFloat(el.dataset.countto), t0 = null;
    if (still()) { el.textContent = to.toFixed(1); return; }
    function step(ts) {
      if (!t0) t0 = ts;
      var k = Math.min(1, (ts - t0) / 1400), v = to * (1 - Math.pow(1 - k, 3));
      el.textContent = v.toFixed(1);
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var watch = document.querySelectorAll("[data-bubble], #reviews, .rating");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        el.classList.add(el.hasAttribute("data-bubble") ? "is-in" : "is-seen");
        el.querySelectorAll("[data-countto]").forEach(countUp);
        io.unobserve(el);
      });
    }, { threshold: 0.3 });
    watch.forEach(function (el) { io.observe(el); });
  } else {
    watch.forEach(function (el) { el.classList.add("is-in", "is-seen"); });
  }

  var select = document.getElementById("ms-plan");
  // a membership page sends ?plan=… so the form opens with that plan chosen
  var wanted = new URLSearchParams(location.search).get("plan");
  if (select && wanted && select.querySelector('option[value="' + wanted + '"]')) { select.value = wanted; select.dispatchEvent(new Event("change")); }
  document.querySelectorAll("a[data-plan]").forEach(function (a) {
    a.addEventListener("click", function () {
      if (select) { select.value = a.dataset.plan; select.dispatchEvent(new Event("change")); }
    });
  });

  render(false);
})();
