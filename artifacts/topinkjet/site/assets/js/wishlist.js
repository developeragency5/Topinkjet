// Wishlist logic — uses localStorage. Stored as array of product references.
window.TI = window.TI || {};
const WISHLIST_KEY = "ti_wishlist_v1";

function read() {
  try { return JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]"); }
  catch (e) { return []; }
}
function write(items) {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
  document.dispatchEvent(new CustomEvent("ti:wishlist-changed"));
}

window.TI.wishlist = {
  list() { return read(); },
  count() { return read().length; },
  has(id) { return read().some((i) => i.id === id); },
  toggle(product) {
    const items = read();
    const idx = items.findIndex((i) => i.id === product.id);
    if (idx >= 0) items.splice(idx, 1);
    else items.push({
      id: product.id, slug: product.slug, name: product.name,
      image: product.image, price: product.price, brand: product.brand,
    });
    write(items);
    return idx < 0; // true if added
  },
  remove(id) { write(read().filter((i) => i.id !== id)); },
  clear() { write([]); },
};
