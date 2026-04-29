// contact.js — contact form + do-not-sell form (frontend only)
(function () {
  "use strict";
  function attach(formId, msgId) {
    const form = document.getElementById(formId);
    const msg = document.getElementById(msgId);
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let valid = true;
      Array.from(form.elements).forEach((el) => {
        if (el.required && !el.value.trim()) { el.classList.add("invalid"); valid = false; }
        else el.classList.remove("invalid");
      });
      if (!valid) return;
      form.style.display = "none";
      if (msg) msg.hidden = false;
    });
  }
  attach("contact-form", "contact-msg");
  attach("do-not-sell-form", "dns-msg");
})();
