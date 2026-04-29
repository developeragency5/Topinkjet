// wishlist-page.js — render /wishlist.html
(function () {
  "use strict";
  const grid = document.getElementById("wishlist-items");
  const empty = document.getElementById("wishlist-empty");
  if (!grid) return;

  function render() {
    const wishlist = window.TI.wishlist.read();
    const products = window.TI.products || [];
    if (!wishlist.length) {
      empty.style.display = "block";
      grid.innerHTML = "";
      return;
    }
    empty.style.display = "none";
    grid.innerHTML = wishlist.map((id) => {
      const p = products.find((x) => x.id === id);
      if (!p) return "";
      return `
      <article class="product-card" data-product-id="${p.id}">
        <button class="heart-btn active" data-wishlist-toggle="${p.id}" aria-label="Remove from wishlist">
          <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-4.5-9.5-9C.5 8 3 4 6.5 4c2 0 3.5 1 5 3 1.5-2 3-3 5-3C20 4 22.5 8 21.5 12 19 16.5 12 21 12 21z"/></svg>
        </button>
        <a href="/product/${p.slug}.html" class="img-wrap"><img src="/assets/products/${p.image}" alt="${p.name}"/></a>
        <div class="body">
          <span class="brand">${p.brand}</span>
          <a class="title" href="/product/${p.slug}.html">${p.name}</a>
          <span class="price">$${p.price.toFixed(2)}</span>
          <div class="actions">
            <button class="btn btn-accent btn-sm" data-add-to-cart="${p.id}">Move to Cart</button>
            <a class="btn btn-outline btn-sm" href="/product/${p.slug}.html">Details</a>
          </div>
        </div>
      </article>`;
    }).join("");
  }

  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-wishlist-toggle]") || e.target.closest("[data-add-to-cart]")) {
      setTimeout(render, 30);
    }
  });
  render();
})();
