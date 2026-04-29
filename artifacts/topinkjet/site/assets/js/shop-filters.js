// shop-filters.js — client-side filter + sort for /shop.html and category pages.
(function () {
  "use strict";
  const grid = document.getElementById("shop-grid");
  if (!grid) return;
  const sort = document.getElementById("sort");
  const countEl = document.getElementById("shop-count");
  const clear = document.getElementById("filter-clear");
  const filters = Array.from(document.querySelectorAll(".filter"));
  const cards = Array.from(grid.querySelectorAll(".product-card"));

  function priceMatch(value, range) {
    const [min, max] = range.split("-").map(Number);
    return value >= min && value <= max;
  }

  function apply() {
    const checked = {};
    filters.forEach((f) => {
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
    sortCards();
  }

  function sortCards() {
    if (!sort) return;
    const mode = sort.value;
    const live = cards.filter((c) => c.style.display !== "none");
    live.sort((a, b) => {
      if (mode === "price-asc") return parseFloat(a.dataset.price) - parseFloat(b.dataset.price);
      if (mode === "price-desc") return parseFloat(b.dataset.price) - parseFloat(a.dataset.price);
      if (mode === "name") return a.dataset.name.localeCompare(b.dataset.name);
      return 0;
    });
    live.forEach((c) => grid.appendChild(c));
  }

  filters.forEach((f) => f.addEventListener("change", apply));
  if (sort) sort.addEventListener("change", sortCards);
  if (clear) clear.addEventListener("click", () => {
    filters.forEach((f) => (f.checked = false));
    apply();
  });
})();
