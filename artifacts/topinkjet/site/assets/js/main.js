// main.js — header/search/menu/cart-drawer/newsletter/add-to-cart
(function () {
  "use strict";

  // ----- Sticky header shadow on scroll -----
  const siteHeader = document.querySelector(".site-header");
  if (siteHeader) {
    const onScroll = () => {
      siteHeader.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // ----- Mobile menu -----
  const menuToggle = document.getElementById("menu-toggle");
  const mainNav = document.querySelector(".main-nav");
  if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", () => mainNav.classList.toggle("open"));
  }

  // ----- Search overlay -----
  const searchToggle = document.getElementById("search-toggle");
  const searchOverlay = document.getElementById("search-overlay");
  const searchInput = document.getElementById("search-input");
  const searchResults = document.getElementById("search-results");

  function openSearch() {
    if (!searchOverlay) return;
    searchOverlay.classList.add("open");
    setTimeout(() => searchInput && searchInput.focus(), 50);
  }
  function closeSearch() { searchOverlay && searchOverlay.classList.remove("open"); }
  if (searchToggle) searchToggle.addEventListener("click", openSearch);
  if (searchOverlay) {
    searchOverlay.addEventListener("click", (e) => { if (e.target === searchOverlay) closeSearch(); });
  }
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const q = searchInput.value.trim().toLowerCase();
      const products = (window.TI && window.TI.products) || [];
      if (!q) { searchResults.innerHTML = ""; return; }
      const hits = products.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        (p.shortDescription || "").toLowerCase().includes(q)
      ).slice(0, 8);
      searchResults.innerHTML = hits.length
        ? hits.map((p) => `<a href="/product/${p.slug}.html"><img src="/assets/products/${p.image}" alt="${p.name}"/><div><div style="font-weight:600">${p.name}</div><div style="color:#6b7280;font-size:.82rem">$${p.price.toFixed(2)}</div></div></a>`).join("")
        : `<p style="color:#6b7280;padding:8px">No results for &ldquo;${q}&rdquo;.</p>`;
    });
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeSearch();
      window.TI && window.TI.cart && window.TI.cart.closeDrawer && window.TI.cart.closeDrawer();
    }
  });

  // ----- Cart drawer -----
  const drawer = document.getElementById("cart-drawer");
  const overlay = document.getElementById("overlay");
  const drawerClose = document.getElementById("cart-drawer-close");
  const drawerContinue = document.getElementById("drawer-continue");

  function closeDrawer() {
    drawer && drawer.classList.remove("open");
    overlay && overlay.classList.remove("open");
    drawer && drawer.setAttribute("aria-hidden", "true");
  }
  function openDrawer() {
    drawer && drawer.classList.add("open");
    overlay && overlay.classList.add("open");
    drawer && drawer.setAttribute("aria-hidden", "false");
  }
  if (drawerClose) drawerClose.addEventListener("click", closeDrawer);
  if (overlay) overlay.addEventListener("click", closeDrawer);
  if (drawerContinue) drawerContinue.addEventListener("click", closeDrawer);

  window.TI = window.TI || {};
  window.TI.openDrawer = openDrawer;
  window.TI.closeDrawer = closeDrawer;

  function renderDrawer() {
    if (!drawer) return;
    const cart = window.TI.cart && window.TI.cart.read ? window.TI.cart.read() : [];
    const body = document.getElementById("cart-drawer-body");
    const sub = document.getElementById("drawer-subtotal");
    const cnt = document.getElementById("drawer-count");
    if (!body) return;
    if (!cart.length) {
      body.innerHTML = '<p class="drawer-empty">Your cart is empty.</p>';
      if (sub) sub.textContent = "$0.00";
      if (cnt) cnt.textContent = "0";
      return;
    }
    const products = (window.TI && window.TI.products) || [];
    let subtotal = 0;
    let totalItems = 0;
    body.innerHTML = cart.map((item) => {
      const p = products.find((x) => x.id === item.id);
      if (!p) return "";
      subtotal += p.price * item.qty;
      totalItems += item.qty;
      return `
        <div class="drawer-line">
          <img src="/assets/products/${p.image}" alt="${p.name}"/>
          <div>
            <div class="name">${p.name}</div>
            <div class="meta">Qty ${item.qty}</div>
          </div>
          <div class="price">$${(p.price * item.qty).toFixed(2)}</div>
        </div>`;
    }).join("");
    if (sub) sub.textContent = "$" + subtotal.toFixed(2);
    if (cnt) cnt.textContent = String(totalItems);
  }
  window.TI.renderDrawer = renderDrawer;

  function updateBadges() {
    const cart = window.TI.cart && window.TI.cart.read ? window.TI.cart.read() : [];
    const wishlist = window.TI.wishlist && window.TI.wishlist.read ? window.TI.wishlist.read() : [];
    const cartCount = cart.reduce((s, i) => s + i.qty, 0);
    const cb = document.getElementById("cart-badge");
    const wb = document.getElementById("wishlist-badge");
    if (cb) { cb.textContent = String(cartCount); cb.dataset.count = String(cartCount); }
    if (wb) { wb.textContent = String(wishlist.length); wb.dataset.count = String(wishlist.length); }
  }
  window.TI.updateBadges = updateBadges;

  // ----- Add to cart hooks (delegated) -----
  document.addEventListener("click", (e) => {
    const addBtn = e.target.closest("[data-add-to-cart]");
    if (addBtn) {
      e.preventDefault();
      const id = addBtn.getAttribute("data-add-to-cart");
      const qtyInputId = addBtn.getAttribute("data-qty-source");
      const qtyInput = qtyInputId ? document.getElementById(qtyInputId) : null;
      const qty = qtyInput ? Math.max(1, parseInt(qtyInput.value, 10) || 1) : 1;
      window.TI.cart.add(id, qty);
      updateBadges();
      renderDrawer();
      openDrawer();
      return;
    }
    const wishBtn = e.target.closest("[data-wishlist-toggle]");
    if (wishBtn) {
      e.preventDefault();
      const id = wishBtn.getAttribute("data-wishlist-toggle");
      const added = window.TI.wishlist.toggle(id);
      wishBtn.classList.toggle("active", added);
      updateBadges();
      return;
    }
  });

  function paintWishlistButtons() {
    const wishlist = (window.TI.wishlist && window.TI.wishlist.read()) || [];
    document.querySelectorAll("[data-wishlist-toggle]").forEach((btn) => {
      const id = btn.getAttribute("data-wishlist-toggle");
      btn.classList.toggle("active", wishlist.includes(id));
    });
  }
  window.TI.paintWishlistButtons = paintWishlistButtons;

  // ----- User name in header -----
  try {
    const user = JSON.parse(localStorage.getItem("topinkjet:user") || "null");
    const label = document.getElementById("user-name-label");
    if (user && label) label.textContent = user.name ? user.name.split(" ")[0] : "Account";
  } catch (e) { /* ignore */ }

  // ----- Initial paint -----
  function init() {
    updateBadges();
    paintWishlistButtons();
    renderDrawer();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
