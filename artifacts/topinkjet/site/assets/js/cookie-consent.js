// cookie-consent.js — banner + manage-preferences modal
(function () {
  "use strict";
  const KEY = "topinkjet:cookie-prefs";
  const banner = document.getElementById("cookie-banner");
  const modal = document.getElementById("cookie-modal");
  if (!banner || !modal) return;

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { return null; }
  }
  function save(prefs) {
    localStorage.setItem(KEY, JSON.stringify({ ...prefs, ts: Date.now() }));
    banner.hidden = true;
    modal.hidden = true;
  }

  if (!load()) {
    setTimeout(() => { banner.hidden = false; }, 600);
  }

  document.getElementById("cookie-accept").addEventListener("click", () => {
    save({ necessary: true, functional: true, analytics: true, marketing: true });
  });
  document.getElementById("cookie-necessary").addEventListener("click", () => {
    save({ necessary: true, functional: false, analytics: false, marketing: false });
  });
  document.getElementById("cookie-manage").addEventListener("click", () => {
    const prev = load() || {};
    document.getElementById("pref-functional").checked = !!prev.functional;
    document.getElementById("pref-analytics").checked = !!prev.analytics;
    document.getElementById("pref-marketing").checked = !!prev.marketing;
    modal.hidden = false;
  });
  document.getElementById("cookie-modal-close").addEventListener("click", () => { modal.hidden = true; });
  document.getElementById("cookie-modal-save").addEventListener("click", () => {
    save({
      necessary: true,
      functional: document.getElementById("pref-functional").checked,
      analytics: document.getElementById("pref-analytics").checked,
      marketing: document.getElementById("pref-marketing").checked,
    });
  });
  document.getElementById("cookie-modal-accept-all").addEventListener("click", () => {
    save({ necessary: true, functional: true, analytics: true, marketing: true });
  });

  modal.addEventListener("click", (e) => { if (e.target === modal) modal.hidden = true; });
})();
