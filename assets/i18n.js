/* The Leisure Club — languages: English (source), العربية (RTL), Français.
   English is read from the page itself; AR / FR come from assets/lang/*.js
   (DRAFT translations for native review). Keys map to data-i18n / data-i18n-html. */
(function () {
  "use strict";

  var dicts = { en: {}, ar: {}, fr: {} };
  var captured = false;

  // language files call TLC_add({ ar: {...}, fr: {...}, en: {...extra keys not on the page} })
  window.TLC_add = function (pack) {
    Object.keys(pack).forEach(function (lang) {
      if (!dicts[lang]) dicts[lang] = {};
      Object.keys(pack[lang]).forEach(function (k) { dicts[lang][k] = pack[lang][k]; });
    });
  };

  // English source text is captured from the page before anything changes it
  function capture() {
    if (captured) return;
    captured = true;
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var k = el.dataset.i18n;
      if (!(k in dicts.en) || dicts.en[k] === undefined) dicts.en[k] = el.textContent.trim();
    });
    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      var k = el.dataset.i18nHtml;
      if (!(k in dicts.en)) dicts.en[k] = el.innerHTML.trim();
    });
    document.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
      el.dataset.i18nAttr.split(";").forEach(function (pair) {
        var p = pair.split(":"), attr = p[0], k = p[1];
        if (attr && k && !(k in dicts.en)) dicts.en[k] = el.getAttribute(attr);
      });
    });
    dicts.en.__title = document.title;
  }

  var api = {
    current: "en",
    capture: capture,
    t: function (key) {
      capture();
      var d = dicts[api.current] || dicts.en;
      return d[key] != null ? d[key] : dicts.en[key];
    },
    apply: function (lang) {
      capture();
      if (!dicts[lang]) lang = "en";
      if (window.TLC_beforeTranslate) window.TLC_beforeTranslate();
      api.current = lang;
      var html = document.documentElement;
      html.lang = lang;
      html.dir = lang === "ar" ? "rtl" : "ltr";
      document.querySelectorAll("[data-i18n]").forEach(function (el) {
        var v = api.t(el.dataset.i18n); if (v != null) el.textContent = v;
      });
      document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
        var v = api.t(el.dataset.i18nHtml); if (v != null) el.innerHTML = v;
      });
      document.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
        el.dataset.i18nAttr.split(";").forEach(function (pair) {
          var p = pair.split(":"); var v = p[1] && api.t(p[1]); if (v != null) el.setAttribute(p[0], v);
        });
      });
      var title = lang === "en" ? dicts.en.__title : dicts[lang]["page.title"];
      if (title) document.title = title;
      if (window.TLC_afterTranslate) window.TLC_afterTranslate();
      document.dispatchEvent(new CustomEvent("tlc:lang", { detail: lang }));
    }
  };
  window.TLC_i18n = api;
})();
