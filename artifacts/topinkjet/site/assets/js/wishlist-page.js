// wishlist-page.js — render /wishlist.html
(function () {
  "use strict";
  const grid = document.getElementById("wishlist-items");
  const empty = document.getElementById("wishlist-empty");
  if (!grid) return;

  function fmt(n) {
    return "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // Use the wishlist's stored snapshot (image/name/price/brand/slug) so we
  // don't depend on the catalog being loaded for rendering or removal.
  function render() {
    const items = (window.TI.wishlist && window.TI.wishlist.list && window.TI.wishlist.list()) || [];
    if (!items.length) {
      if (empty) empty.style.display = "";
      grid.innerHTML = "";
      grid.style.display = "none";
      return;
    }
    if (empty) empty.style.display = "none";
    grid.style.display = "";
    grid.innerHTML = items.map((p) => `
      <article class="product-card" data-product-id="${p.id}">
        <button class="heart-btn active" data-wishlist-toggle="${p.id}" aria-label="Remove ${p.name} from wishlist" title="Remove from wishlist">
          <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 21s-7-4.5-9.5-9C.5 8 3 4 6.5 4c2 0 3.5 1 5 3 1.5-2 3-3 5-3C20 4 22.5 8 21.5 12 19 16.5 12 21 12 21z"/></svg>
        </button>
        <a href="/product/${p.slug}.html" class="img-wrap"><img src="/assets/products/${p.image}" alt="${p.name}" loading="lazy" width="400" height="300"/></a>
        <div class="body">
          <span class="brand">${p.brand || "HP"}</span>
          <a class="title" href="/product/${p.slug}.html">${p.name}</a>
          <span class="price">${fmt(p.price)}</span>
          <div class="actions">
            <button class="btn btn-accent btn-sm" data-add-to-cart="${p.id}">Add to Cart</button>
            <a class="btn btn-outline btn-sm" href="/product/${p.slug}.html">Details</a>
          </div>
        </div>
      </article>`).join("");
  }

  // Re-render after any wishlist or cart click and on storage events from
  // other tabs. Uses the custom event dispatched by wishlist.js write().
  document.addEventListener("ti:wishlist-changed", render);
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-wishlist-toggle]") || e.target.closest("[data-add-to-cart]")) {
      setTimeout(render, 30);
    }
  });
  window.addEventListener("storage", (e) => {
    if (e.key === "ti_wishlist_v1") render();
  });
  render();
})();
