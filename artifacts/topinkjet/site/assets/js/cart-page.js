// cart-page.js — render /cart.html
(function () {
  "use strict";
  const list = document.getElementById("cart-items");
  const empty = document.getElementById("cart-empty");
  if (!list) return;

  function fmt(n) { return "$" + n.toFixed(2); }

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
      return `
      <article class="cart-line" data-id="${p.id}">
        <img src="/assets/products/${p.image}" alt="${p.name}"/>
        <div>
          <div class="name"><a href="/product/${p.slug}.html">${p.name}</a></div>
          <div class="meta">${p.brand} · ${fmt(p.price)} each</div>
          <div class="qty">
            <button type="button" data-act="dec" aria-label="Decrease">−</button>
            <input type="number" min="1" value="${item.qty}" data-act="qty"/>
            <button type="button" data-act="inc" aria-label="Increase">+</button>
            <button class="remove" data-act="remove">Remove</button>
          </div>
        </div>
        <div class="price-col">${fmt(p.price * item.qty)}</div>
      </article>`;
    }).join("");
    const subtotal = cart.reduce((s, item) => {
      const p = products.find((x) => x.id === item.id);
      return p ? s + p.price * item.qty : s;
    }, 0);
    updateSummary(subtotal);
  }

  function updateSummary(subtotal) {
    const tax = +(subtotal * 0.08).toFixed(2);
    const shipping = subtotal === 0 ? 0 : (subtotal >= 99 ? 0 : 9.99);
    const total = subtotal + tax + shipping;
    document.getElementById("cart-subtotal").textContent = fmt(subtotal);
    document.getElementById("cart-tax").textContent = fmt(tax);
    document.getElementById("cart-shipping").textContent = shipping === 0 && subtotal > 0 ? "FREE" : fmt(shipping);
    document.getElementById("cart-total").textContent = fmt(total);
  }

  list.addEventListener("click", (e) => {
    const line = e.target.closest("[data-id]");
    if (!line) return;
    const id = line.getAttribute("data-id");
    const act = e.target.getAttribute("data-act");
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
