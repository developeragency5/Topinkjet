// Cart logic — uses localStorage. Exposes window.TI.cart helpers used by main.js.
window.TI = window.TI || {};
const CART_KEY = "ti_cart_v1";
const SHIPPING_FREE_THRESHOLD = 99;
const SHIPPING_RATES = { standard: 9.99, expedited: 19.99, express: 34.99 };
const TAX_RATE = 0.08;

function read() {
  try {
    const raw = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((i) => i && typeof i === "object" && typeof i.id === "string")
      .map((i) => ({
        ...i,
        qty: Math.max(0, Math.floor(Number(i.qty)) || 0),
        price: Number.isFinite(Number(i.price)) ? Number(i.price) : 0,
      }))
      .filter((i) => i.qty > 0);
  } catch (e) { return []; }
}
function write(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  document.dispatchEvent(new CustomEvent("ti:cart-changed"));
}

function resolveProduct(productOrId) {
  if (productOrId && typeof productOrId === "object") return productOrId;
  const list = (window.TI && window.TI.products) || [];
  return list.find((p) => p.id === productOrId) || null;
}

window.TI.cart = {
  list() { return read(); },
  read() { return read(); },
  count() {
    return read().reduce((s, i) => s + (Number(i.qty) || 0), 0);
  },
  subtotal() {
    return read().reduce((s, i) => s + (Number(i.qty) || 0) * (Number(i.price) || 0), 0);
  },
  shipping(method = "standard") {
    if (this.subtotal() === 0) return 0;
    if (method === "standard" && this.subtotal() >= SHIPPING_FREE_THRESHOLD) return 0;
    return SHIPPING_RATES[method] ?? SHIPPING_RATES.standard;
  },
  tax() {
    return Math.round(this.subtotal() * TAX_RATE * 100) / 100;
  },
  total(method = "standard") {
    return Math.round((this.subtotal() + this.shipping(method) + this.tax()) * 100) / 100;
  },
  add(productOrId, qty = 1) {
    const product = resolveProduct(productOrId);
    if (!product) return;
    const safeQty = Math.max(1, Math.floor(Number(qty)) || 1);
    const items = read();
    const existing = items.find((i) => i.id === product.id);
    if (existing) existing.qty = (Number(existing.qty) || 0) + safeQty;
    else items.push({
      id: product.id,
      slug: product.slug,
      name: product.name,
      image: product.image,
      price: Number(product.price) || 0,
      brand: product.brand,
      qty: safeQty,
    });
    write(items);
  },
  setQty(id, qty) {
    const safeQty = Math.max(0, Math.floor(Number(qty)) || 0);
    let items = read();
    if (safeQty <= 0) items = items.filter((i) => i.id !== id);
    else {
      const it = items.find((i) => i.id === id);
      if (it) it.qty = safeQty;
    }
    write(items);
  },
  set(id, qty) { this.setQty(id, qty); },
  update(id, delta) {
    const it = read().find((i) => i.id === id);
    const next = (it ? it.qty : 0) + delta;
    this.setQty(id, next);
  },
  remove(id) {
    write(read().filter((i) => i.id !== id));
  },
  clear() { write([]); },
  has(id) { return read().some((i) => i.id === id); },
  rates: SHIPPING_RATES,
  freeThreshold: SHIPPING_FREE_THRESHOLD,
  taxRate: TAX_RATE,
};
