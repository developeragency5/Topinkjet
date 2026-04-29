// product.js — gallery thumbnail + qty stepper for product detail pages
(function () {
  "use strict";
  const main = document.getElementById("main-product-image");
  document.querySelectorAll(".thumb").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".thumb").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      if (main) main.src = btn.getAttribute("data-img");
    });
  });

  const qty = document.getElementById("qty");
  document.querySelectorAll("[data-qty]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!qty) return;
      const delta = parseInt(btn.getAttribute("data-qty"), 10);
      const next = Math.max(1, (parseInt(qty.value, 10) || 1) + delta);
      qty.value = String(next);
    });
  });
})();
