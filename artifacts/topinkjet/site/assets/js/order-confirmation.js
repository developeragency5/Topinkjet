// order-confirmation.js — render saved order
(function () {
  "use strict";
  const fmt = (n) => "$" + (Number.isFinite(Number(n)) ? Number(n) : 0).toFixed(2);
  let order;
  try { order = JSON.parse(localStorage.getItem("topinkjet:lastOrder") || "null"); } catch (e) { order = null; }
  if (!order) {
    document.querySelector(".confirm-card").innerHTML = `
      <h1>No recent order found</h1>
      <p>It looks like you arrived here directly. Browse <a href="/shop.html">our printers</a> to start a new order.</p>`;
    document.querySelector(".confirm-grid").style.display = "none";
    return;
  }
  document.getElementById("order-number").textContent = order.number;
  document.getElementById("confirm-name").textContent = order.contact.name;
  document.getElementById("confirm-address").innerHTML = `${order.address.street}${order.address.apt ? ", " + order.address.apt : ""}<br/>${order.address.city}, ${order.address.state} ${order.address.zip}<br/>United States`;
  document.getElementById("confirm-email").textContent = order.contact.email;

  const deliveryEl = document.getElementById("confirm-delivery");
  if (deliveryEl && order.delivery) {
    const lines = [
      "Free Standard Ground (3–5 business days)",
      order.delivery.methodLabel || "Leave at door",
    ];
    if (order.delivery.instructions) lines.push("Notes: " + order.delivery.instructions);
    if (order.delivery.smsNotify) lines.push("SMS tracking updates: yes");
    deliveryEl.innerHTML = lines.map((l) => `<span class="d-line">${l.replace(/</g, "&lt;")}</span>`).join("");
  }

  document.getElementById("confirm-items").innerHTML = order.items
    .map((i) => `<li>${i.name} × ${i.qty} — ${fmt(i.price * i.qty)}</li>`)
    .join("");
  document.getElementById("confirm-subtotal").textContent = fmt(order.subtotal);
  const shipEl = document.getElementById("confirm-shipping");
  if (shipEl) {
    shipEl.textContent = "FREE";
    shipEl.classList.add("co-free");
  }
  document.getElementById("confirm-tax").textContent = fmt(order.tax);
  document.getElementById("confirm-total").textContent = fmt(order.total);
})();
