/* Videos: load and play only while on screen. Silent, looping, paused in "Still" motion
   and by the hero Pause button. Without JavaScript the poster image shows instead. */
(function () {
  "use strict";
  var doc = document.documentElement;
  var videos = Array.prototype.slice.call(document.querySelectorAll("video[data-lazyvideo], video[data-hero-video]"));
  if (!videos.length) return;
  var mobile = window.matchMedia("(max-width: 699px)");
  var visible = new Map();
  var heroPaused = false;

  function allowed() { return doc.dataset.motion !== "still"; }
  function source(v) {
    if (v.hasAttribute("data-hero-video")) return mobile.matches && v.dataset.srcMobile ? v.dataset.srcMobile : v.dataset.srcDesktop;
    return v.dataset.src;
  }
  function sync(v) {
    var wantPlay = visible.get(v) && allowed() && !(v.hasAttribute("data-hero-video") && heroPaused);
    if (wantPlay) {
      var src = source(v);
      if (v.getAttribute("src") !== src) { v.setAttribute("src", src); v.load(); }
      var p = v.play(); if (p && p.catch) p.catch(function () {});
    } else if (!v.paused) {
      v.pause();
    }
  }
  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { visible.set(en.target, en.isIntersecting); sync(en.target); });
  }, { rootMargin: "200px 0px" }) : null;
  videos.forEach(function (v) { if (io) io.observe(v); else { visible.set(v, true); sync(v); } });

  new MutationObserver(function () { videos.forEach(sync); }).observe(doc, { attributes: true, attributeFilter: ["data-motion"] });
  document.addEventListener("tlc:film", function (e) { heroPaused = !!e.detail.paused; videos.forEach(sync); });
  mobile.addEventListener && mobile.addEventListener("change", function () {
    videos.forEach(function (v) { if (v.hasAttribute("data-hero-video")) { v.removeAttribute("src"); sync(v); } });
  });
})();
