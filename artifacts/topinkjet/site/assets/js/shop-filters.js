// shop-filters.js — client-side filter + sort for /shop.html and category pages.
(function () {
  "use strict";
  const grid = document.getElementById("shop-grid");
  if (!grid) return;
  const countEl = document.getElementById("shop-count");
  const clear = document.getElementById("filter-clear");
  const filters = Array.from(document.querySelectorAll(".filter"));
  const cards = Array.from(grid.querySelectorAll(".product-card"));

  function priceMatch(value, range) {
    const [min, max] = range.split("-").map(Number);
    return value >= min && value <= max;
  }

  function syncChipState(f) {
    const chip = f.closest(".filter-chip");
    if (chip) chip.classList.toggle("is-checked", f.checked);
  }

  function apply() {
    const checked = {};
    filters.forEach((f) => {
      syncChipState(f);
      if (!f.checked) return;
      const key = f.dataset.key;
      (checked[key] = checked[key] || []).push(f.value);
    });
    let visible = 0;
    cards.forEach((card) => {
      let show = true;
      if (checked.category && !checked.category.includes(card.dataset.category)) show = false;
      if (checked.brand && !checked.brand.includes(card.dataset.brand)) show = false;
      if (checked.price && !checked.price.some((r) => priceMatch(parseFloat(card.dataset.price), r))) show = false;
      card.style.display = show ? "" : "none";
      if (show) visible++;
    });
    if (countEl) countEl.textContent = visible + " product" + (visible === 1 ? "" : "s");
  }

  filters.forEach((f) => f.addEventListener("change", apply));
  if (clear) clear.addEventListener("click", () => {
    filters.forEach((f) => (f.checked = false));
    apply();
  });
})();
