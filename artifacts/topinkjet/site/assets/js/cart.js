// Cart logic — uses localStorage. Exposes window.TI.cart helpers used by main.js.
window.TI = window.TI || {};
const CART_KEY = "ti_cart_v1";
const SHIPPING_FREE_THRESHOLD = 99;
const SHIPPING_RATES = { standard: 9.99, expedited: 19.99, express: 34.99 };
const TAX_RATE = 0.08;

function read() {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); }
  catch (e) { return []; }
}
function write(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  document.dispatchEvent(new CustomEvent("ti:cart-changed"));
}

window.TI.cart = {
  list() { return read(); },
  count() {
    return read().reduce((s, i) => s + i.qty, 0);
  },
  subtotal() {
    return read().reduce((s, i) => s + i.qty * i.price, 0);
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
  add(product, qty = 1) {
    const items = read();
    const existing = items.find((i) => i.id === product.id);
    if (existing) existing.qty += qty;
    else items.push({
      id: product.id,
      slug: product.slug,
      name: product.name,
      image: product.image,
      price: product.price,
      brand: product.brand,
      qty,
    });
    write(items);
  },
  setQty(id, qty) {
    let items = read();
    if (qty <= 0) items = items.filter((i) => i.id !== id);
    else {
      const it = items.find((i) => i.id === id);
      if (it) it.qty = qty;
    }
    write(items);
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
