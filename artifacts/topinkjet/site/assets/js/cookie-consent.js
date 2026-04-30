// cookie-consent.js — banner + manage-preferences modal
// Wires Google Consent Mode v2 + Microsoft UET pageLoad gating.
(function () {
  "use strict";
  const KEY = "topinkjet:cookie-prefs";
  const banner = document.getElementById("cookie-banner");
  const modal = document.getElementById("cookie-modal");
  if (!banner || !modal) return;

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { return null; }
  }

  function pushConsent(prefs) {
    // Google Consent Mode v2 update
    try {
      if (typeof window.gtag === "function") {
        window.gtag("consent", "update", {
          ad_storage: prefs.marketing ? "granted" : "denied",
          ad_user_data: prefs.marketing ? "granted" : "denied",
          ad_personalization: prefs.marketing ? "granted" : "denied",
          analytics_storage: prefs.analytics ? "granted" : "denied",
          functionality_storage: prefs.functional ? "granted" : "denied",
          personalization_storage: prefs.functional ? "granted" : "denied",
          security_storage: "granted",
        });
      }
    } catch (e) { /* swallow */ }

    // Microsoft UET pageLoad — fire only after marketing consent.
    try {
      if (prefs.marketing && window._uetq && !window.__uetPageLoadFired) {
        window._uetq.push("pageLoad");
        window.__uetPageLoadFired = true;
      }
    } catch (e) { /* swallow */ }

    // Surface a custom event so any future scripts can react.
    try {
      window.dispatchEvent(new CustomEvent("topinkjet:consent", { detail: prefs }));
    } catch (e) { /* swallow */ }
  }

  function save(prefs) {
    const full = { necessary: true, ...prefs, ts: Date.now() };
    localStorage.setItem(KEY, JSON.stringify(full));
    banner.hidden = true;
    modal.hidden = true;
    pushConsent(full);
  }

  // On page load, replay stored prefs so consent state is in sync each visit.
  const stored = load();
  if (!stored) {
    setTimeout(() => { banner.hidden = false; }, 600);
  } else {
    pushConsent(stored);
  }

  document.getElementById("cookie-accept").addEventListener("click", () => {
    save({ functional: true, analytics: true, marketing: true });
  });
  const rejectBtn = document.getElementById("cookie-reject");
  if (rejectBtn) {
    rejectBtn.addEventListener("click", () => {
      save({ functional: false, analytics: false, marketing: false });
    });
  }
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
      functional: document.getElementById("pref-functional").checked,
      analytics: document.getElementById("pref-analytics").checked,
      marketing: document.getElementById("pref-marketing").checked,
    });
  });
  document.getElementById("cookie-modal-accept-all").addEventListener("click", () => {
    save({ functional: true, analytics: true, marketing: true });
  });
  const modalReject = document.getElementById("cookie-modal-reject-all");
  if (modalReject) {
    modalReject.addEventListener("click", () => {
      save({ functional: false, analytics: false, marketing: false });
    });
  }

  modal.addEventListener("click", (e) => { if (e.target === modal) modal.hidden = true; });
})();
