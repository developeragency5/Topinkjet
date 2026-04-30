// cart-page.js — render /cart.html
(function () {
  "use strict";
  const list = document.getElementById("cart-items");
  const empty = document.getElementById("cart-empty");
  if (!list) return;

  function fmt(n) { return "$" + (Number.isFinite(n) ? n : 0).toFixed(2); }
  function safeQty(q) { return Math.max(0, Math.floor(Number(q)) || 0); }
  function safePrice(p) { const n = Number(p); return Number.isFinite(n) ? n : 0; }

  const page = document.querySelector(".cart-page");
  const summary = document.getElementById("cart-summary");

  function render() {
    const cart = window.TI.cart.read();
    const products = window.TI.products || [];
    if (!cart.length) {
      empty.style.display = "block";
      list.innerHTML = "";
      if (page) page.classList.add("is-empty");
      if (summary) summary.style.display = "none";
      updateSummary(0);
      return;
    }
    empty.style.display = "none";
    if (page) page.classList.remove("is-empty");
    if (summary) summary.style.display = "";
    list.innerHTML = cart.map((item) => {
      const p = products.find((x) => x.id === item.id);
      if (!p) return "";
      const q = safeQty(item.qty);
      const price = safePrice(p.price);
      return `
      <article class="cart-line" data-id="${p.id}">
        <a href="/product/${p.slug}.html" class="cart-line-img"><img src="/assets/products/${p.image}" alt="${p.name}"/></a>
        <div class="cart-line-body">
          <div class="cart-line-top">
            <div>
              <div class="brand">${p.brand}</div>
              <div class="name"><a href="/product/${p.slug}.html">${p.name}</a></div>
              <div class="meta">${fmt(price)} each</div>
            </div>
            <div class="price-col">${fmt(price * q)}</div>
          </div>
          <div class="cart-line-bottom">
            <div class="qty" role="group" aria-label="Quantity">
              <button type="button" data-act="dec" aria-label="Decrease quantity">−</button>
              <input type="number" min="1" value="${q}" data-act="qty" aria-label="Quantity"/>
              <button type="button" data-act="inc" aria-label="Increase quantity">+</button>
            </div>
            <button class="remove" data-act="remove" type="button">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
              Remove
            </button>
          </div>
        </div>
      </article>`;
    }).join("");
    const subtotal = cart.reduce((s, item) => {
      const p = products.find((x) => x.id === item.id);
      return p ? s + safePrice(p.price) * safeQty(item.qty) : s;
    }, 0);
    updateSummary(subtotal);
  }

  function updateSummary(subtotal) {
    const sub = Number.isFinite(subtotal) ? subtotal : 0;
    const tax = +(sub * 0.08).toFixed(2);
    const shipping = sub === 0 ? 0 : (sub >= 99 ? 0 : 9.99);
    const total = sub + tax + shipping;
    document.getElementById("cart-subtotal").textContent = fmt(sub);
    document.getElementById("cart-tax").textContent = fmt(tax);
    document.getElementById("cart-shipping").textContent = shipping === 0 && sub > 0 ? "FREE" : fmt(shipping);
    document.getElementById("cart-total").textContent = fmt(total);
  }

  list.addEventListener("click", (e) => {
    const line = e.target.closest("[data-id]");
    if (!line) return;
    const id = line.getAttribute("data-id");
    const actEl = e.target.closest("[data-act]");
    if (!actEl) return;
    const act = actEl.getAttribute("data-act");
    if (act === "remove") window.TI.cart.remove(id);
    else if (act === "inc") window.TI.cart.update(id, +1);
    else if (act === "dec") window.TI.cart.update(id, -1);
    else return;
    render();
    window.TI.updateBadges && window.TI.updateBadges();
    window.TI.renderDrawer && window.TI.renderDrawer();
  });
  list.addEventListener("change", (e) => {
    if (e.target.matches('[data-act="qty"]')) {
      const line = e.target.closest("[data-id]");
      const id = line.getAttribute("data-id");
      const v = Math.max(1, parseInt(e.target.value, 10) || 1);
      window.TI.cart.set(id, v);
      render();
      window.TI.updateBadges && window.TI.updateBadges();
      window.TI.renderDrawer && window.TI.renderDrawer();
    }
  });

  render();
})();
