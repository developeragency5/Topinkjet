// checkout.js — 5-step checkout flow controller.
(function () {
  "use strict";
  const form = document.getElementById("checkout-form");
  if (!form) return;
  const products = () => window.TI.products || [];
  const cart = () => (window.TI.cart && window.TI.cart.read()) || [];
  const fmt = (n) => "$" + n.toFixed(2);

  let currentStep = 1;
  function showStep(n) {
    currentStep = n;
    document.querySelectorAll(".checkout-step").forEach((el) => {
      el.classList.toggle("active", parseInt(el.dataset.step, 10) === n);
    });
    document.querySelectorAll(".progress-step").forEach((el) => {
      const s = parseInt(el.dataset.step, 10);
      el.classList.toggle("active", s === n);
      el.classList.toggle("done", s < n);
    });
    if (n === 5) populateReview();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ----- step navigation -----
  document.querySelectorAll("[data-next]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const next = parseInt(btn.getAttribute("data-next"), 10);
      if (validateStep(currentStep)) showStep(next);
    });
  });
  document.querySelectorAll("[data-prev]").forEach((btn) => {
    btn.addEventListener("click", () => {
      showStep(parseInt(btn.getAttribute("data-prev"), 10));
    });
  });
  document.querySelectorAll("[data-edit]").forEach((a) => {
    a.addEventListener("click", (e) => { e.preventDefault(); showStep(parseInt(a.getAttribute("data-edit"), 10)); });
  });

  // ----- validation -----
  function validateStep(step) {
    if (step === 1) {
      const required = ["email", "fullName", "phone"];
      return checkRequired(required);
    }
    if (step === 2) {
      const fields = readForm();
      const status = document.getElementById("address-status");
      const result = window.TI.avs.verify({ street: fields.street, city: fields.city, state: fields.state, zip: fields.zip });
      if (!result.valid) {
        status.className = "address-status show error";
        status.innerHTML = "<strong>We can't verify that address:</strong><ul style=\"margin:8px 0 0 18px\">" + result.errors.map((e) => `<li>${e}</li>`).join("") + "</ul>";
        return false;
      }
      status.className = "address-status show success";
      status.textContent = "✓ Address verified.";
      return true;
    }
    if (step === 3) {
      return !!form.querySelector('input[name="shipping"]:checked');
    }
    if (step === 4) {
      const fields = readForm();
      const errors = [];
      if (!fields.cardName) errors.push("Name on card is required.");
      const digits = (fields.cardNumber || "").replace(/\D/g, "");
      if (digits.length < 13 || !luhn(digits)) errors.push("Enter a valid card number.");
      if (!/^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(fields.cardExpiry || "")) errors.push("Expiry must be MM/YY.");
      else if (!futureExp(fields.cardExpiry)) errors.push("Card is expired.");
      if (!/^[0-9]{3,4}$/.test(fields.cardCvv || "")) errors.push("CVV must be 3 or 4 digits.");
      if (!/^[0-9]{5}(-[0-9]{4})?$/.test(fields.billingZip || "")) errors.push("Billing ZIP must be 5 digits.");
      if (errors.length) {
        alert(errors.join("\n"));
        return false;
      }
      return true;
    }
    return true;
  }

  function checkRequired(names) {
    const missing = [];
    names.forEach((n) => {
      const el = form.elements[n];
      if (!el || !el.value.trim()) {
        missing.push(n);
        el && el.classList.add("invalid");
      } else el.classList.remove("invalid");
    });
    if (missing.length) {
      alert("Please complete required fields.");
      return false;
    }
    return true;
  }

  function luhn(num) {
    let sum = 0; let alt = false;
    for (let i = num.length - 1; i >= 0; i--) {
      let d = parseInt(num.charAt(i), 10);
      if (alt) { d *= 2; if (d > 9) d -= 9; }
      sum += d; alt = !alt;
    }
    return sum % 10 === 0;
  }
  function futureExp(s) {
    const [mm, yy] = s.split("/").map((x) => parseInt(x, 10));
    const now = new Date();
    const expDate = new Date(2000 + yy, mm, 0, 23, 59, 59);
    return expDate >= now;
  }

  // Card brand detection
  const cardInput = form.elements["cardNumber"];
  const brandEl = document.getElementById("card-brand");
  if (cardInput && brandEl) {
    cardInput.addEventListener("input", () => {
      const v = cardInput.value.replace(/\D/g, "");
      const groups = v.match(/.{1,4}/g);
      cardInput.value = groups ? groups.join(" ") : "";
      let b = "CARD";
      if (/^4/.test(v)) b = "VISA";
      else if (/^(5[1-5]|2[2-7])/.test(v)) b = "MC";
      else if (/^3[47]/.test(v)) b = "AMEX";
      else if (/^6(011|5)/.test(v)) b = "DISC";
      brandEl.textContent = b;
    });
  }
  const expInput = form.elements["cardExpiry"];
  if (expInput) {
    expInput.addEventListener("input", () => {
      let v = expInput.value.replace(/\D/g, "").slice(0, 4);
      if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2);
      expInput.value = v;
    });
  }

  // Shipping option
  document.querySelectorAll(".shipping-option").forEach((opt) => {
    opt.addEventListener("click", () => {
      document.querySelectorAll(".shipping-option").forEach((o) => o.classList.remove("selected"));
      opt.classList.add("selected");
      const radio = opt.querySelector("input");
      if (radio) radio.checked = true;
      updateSummary();
    });
  });
  form.addEventListener("change", updateSummary);

  function readForm() {
    const data = {};
    Array.from(form.elements).forEach((el) => {
      if (!el.name) return;
      if (el.type === "checkbox") data[el.name] = el.checked;
      else if (el.type === "radio") { if (el.checked) data[el.name] = el.value; }
      else data[el.name] = el.value;
    });
    return data;
  }

  function getShippingCost(method, subtotal) {
    if (method === "expedited") return 19.99;
    if (method === "express") return 34.99;
    return subtotal >= 99 ? 0 : 9.99;
  }

  function updateSummary() {
    const list = document.getElementById("checkout-items");
    if (!list) return;
    const c = cart();
    const ps = products();
    let subtotal = 0;
    list.innerHTML = c.map((item) => {
      const p = ps.find((x) => x.id === item.id);
      if (!p) return "";
      subtotal += p.price * item.qty;
      return `
      <div class="co-line">
        <img src="/assets/products/${p.image}" alt="${p.name}"/>
        <div>
          <div class="name">${p.name}</div>
          <div class="meta">Qty ${item.qty}</div>
        </div>
        <div>${fmt(p.price * item.qty)}</div>
      </div>`;
    }).join("");
    const data = readForm();
    const shipping = getShippingCost(data.shipping || "standard", subtotal);
    const tax = +(subtotal * 0.08).toFixed(2);
    const total = subtotal + shipping + tax;
    document.getElementById("co-subtotal").textContent = fmt(subtotal);
    document.getElementById("co-shipping").textContent = shipping === 0 && subtotal > 0 ? "FREE" : fmt(shipping);
    document.getElementById("co-tax").textContent = fmt(tax);
    document.getElementById("co-total").textContent = fmt(total);
  }

  function populateReview() {
    const d = readForm();
    document.getElementById("rev-contact").innerHTML = `${d.fullName || ""}<br/>${d.email || ""}<br/>${d.phone || ""}`;
    document.getElementById("rev-address").innerHTML = `${d.street || ""}${d.apt ? ", " + d.apt : ""}<br/>${d.city || ""}, ${d.state || ""} ${d.zip || ""}<br/>United States`;
    const shipText = { standard: "Standard (3–5 business days)", expedited: "Expedited (2 business days)", express: "Express (1 business day)" };
    document.getElementById("rev-shipping").textContent = shipText[d.shipping || "standard"];
    const last4 = (d.cardNumber || "").replace(/\D/g, "").slice(-4);
    document.getElementById("rev-payment").innerHTML = `Card ending in <strong>•••• ${last4}</strong><br/>Billing ZIP: ${d.billingZip || ""}`;
    const list = document.getElementById("rev-items");
    const ps = products();
    list.innerHTML = cart().map((item) => {
      const p = ps.find((x) => x.id === item.id);
      return p ? `<li>${p.name} — Qty ${item.qty} — ${fmt(p.price * item.qty)}</li>` : "";
    }).join("");
  }

  // Place order
  document.getElementById("place-order").addEventListener("click", () => {
    const d = readForm();
    const c = cart();
    if (!c.length) { alert("Your cart is empty."); return; }
    const ps = products();
    let subtotal = 0;
    const items = c.map((item) => {
      const p = ps.find((x) => x.id === item.id);
      if (!p) return null;
      subtotal += p.price * item.qty;
      return { id: p.id, slug: p.slug, name: p.name, price: p.price, qty: item.qty, image: p.image };
    }).filter(Boolean);
    const shipping = getShippingCost(d.shipping || "standard", subtotal);
    const tax = +(subtotal * 0.08).toFixed(2);
    const total = subtotal + shipping + tax;
    const orderNum = "TI-" + Math.random().toString(36).slice(2, 10).toUpperCase();
    const order = {
      number: orderNum,
      date: new Date().toISOString(),
      contact: { name: d.fullName, email: d.email, phone: d.phone },
      address: { street: d.street, apt: d.apt, city: d.city, state: d.state, zip: d.zip, country: "United States" },
      shippingMethod: d.shipping || "standard",
      shipping, subtotal, tax, total,
      items,
    };
    localStorage.setItem("topinkjet:lastOrder", JSON.stringify(order));
    // Append to history
    try {
      const hist = JSON.parse(localStorage.getItem("topinkjet:orders") || "[]");
      hist.unshift(order);
      localStorage.setItem("topinkjet:orders", JSON.stringify(hist.slice(0, 50)));
    } catch (e) { /* ignore */ }
    // Clear cart
    localStorage.setItem("topinkjet:cart", JSON.stringify([]));
    window.location.href = "/order-confirmation.html";
  });

  // Init
  updateSummary();
})();
