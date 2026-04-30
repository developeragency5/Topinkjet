// Products data — loaded via fetch from /data/products.json on pages that need
// the full catalog client-side (search, suggestions, listing filters).
// Note: every product also exists statically in the HTML so crawlers see it
// without running this script.
window.TI = window.TI || {};

window.TI.loadProducts = async function () {
  if (window.TI._products) return window.TI._products;
  const res = await fetch("/data/products.json");
  const data = await res.json();
  window.TI._products = data;
  return data;
};

window.TI.findProduct = function (slug) {
  return (window.TI._products || []).find((p) => p.slug === slug);
};

window.TI.formatPrice = function (n) {
  return "$" + Number(n).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

window.TI.productCardHTML = function (p, opts = {}) {
  const inWishlist = window.TI.wishlist && window.TI.wishlist.has
    ? window.TI.wishlist.has(p.id)
    : false;
  return `
    <article class="product-card" data-product-id="${p.id}">
      <button class="heart-btn ${inWishlist ? "active" : ""}" data-wishlist-toggle="${p.id}" aria-label="Add ${p.name} to wishlist">
        <svg viewBox="0 0 24 24" fill="${inWishlist ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-4.5-9.5-9C.5 8 3 4 6.5 4c2 0 3.5 1 5 3 1.5-2 3-3 5-3C20 4 22.5 8 21.5 12 19 16.5 12 21 12 21z"/></svg>
      </button>
      <a href="/product/${p.slug}.html" class="img-wrap">
        <img src="/assets/products/${p.image}" alt="${p.name}" loading="lazy" width="400" height="300"/>
      </a>
      <div class="body">
        <span class="brand">${p.brand}</span>
        <a class="title" href="/product/${p.slug}.html">${p.name}</a>
        <span class="price">${window.TI.formatPrice(p.price)}</span>
        <div class="actions">
          <button class="btn btn-accent btn-sm" data-add-to-cart="${p.id}">Add to Cart</button>
          <a class="btn btn-outline btn-sm" href="/product/${p.slug}.html">Details</a>
        </div>
      </div>
    </article>
  `;
};
