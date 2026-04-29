// checkout.js — 5-step checkout flow controller with inline blur validation.
(function () {
  "use strict";
  const form = document.getElementById("checkout-form");
  if (!form) return;
  const products = () => window.TI.products || [];
  const cart = () => (window.TI.cart && window.TI.cart.read()) || [];
  const fmt = (n) => "$" + n.toFixed(2);

  // ----- Step navigation -----
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
    a.addEventListener("click", (e) => {
      e.preventDefault();
      showStep(parseInt(a.getAttribute("data-edit"), 10));
    });
  });

  // ----- Field-level validators -----
  function luhn(num) {
    let sum = 0;
    let alt = false;
    for (let i = num.length - 1; i >= 0; i--) {
      let d = parseInt(num.charAt(i), 10);
      if (alt) {
        d *= 2;
        if (d > 9) d -= 9;
      }
      sum += d;
      alt = !alt;
    }
    return sum % 10 === 0;
  }

  function detectBrand(digits) {
    if (/^4/.test(digits)) return "VISA";
    if (/^(5[1-5]|2[2-7])/.test(digits)) return "MC";
    if (/^3[47]/.test(digits)) return "AMEX";
    if (/^6(011|5)/.test(digits)) return "DISC";
    return "CARD";
  }

  function expectedCardLength(brand) {
    if (brand === "AMEX") return [15];
    return [16];
  }

  function futureExp(s) {
    const m = /^(0[1-9]|1[0-2])\/([0-9]{2})$/.exec(s);
    if (!m) return false;
    const mm = parseInt(m[1], 10);
    const yy = parseInt(m[2], 10);
    const expDate = new Date(2000 + yy, mm, 0, 23, 59, 59);
    return expDate >= new Date();
  }

  const VALIDATORS = {
    email(v) {
      if (!v) return "Email is required.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return "Enter a valid email address.";
      return "";
    },
    name(v) {
      if (!v) return "This field is required.";
      if (v.trim().length < 2) return "Please enter your full name.";
      return "";
    },
    phone(v) {
      const digits = (v || "").replace(/\D/g, "");
      if (!digits) return "Phone is required.";
      if (digits.length !== 10) return "US phone must be 10 digits.";
      return "";
    },
    street(v) {
      if (!v || v.trim().length < 4) return "Street address is required.";
      if (!/[0-9]/.test(v) || !/[A-Za-z]/.test(v)) return "Include both a number and a street name.";
      return "";
    },
    city(v) {
      if (!v || v.trim().length < 2) return "City is required.";
      if (!/^[A-Za-z\s\-\.']+$/.test(v)) return "City contains invalid characters.";
      return "";
    },
    state(v) {
      if (!v) return "Please select a state.";
      return "";
    },
    zip(v) {
      const t = (v || "").trim();
      if (!t) return "ZIP is required.";
      if (!/^[0-9]{5}(-[0-9]{4})?$/.test(t)) return "ZIP must be 5 digits (or ZIP+4).";
      return "";
    },
    cardNumber(v) {
      const digits = (v || "").replace(/\D/g, "");
      if (!digits) return "Card number is required.";
      if (digits.length < 13 || digits.length > 19) return "Card number length is invalid.";
      const brand = detectBrand(digits);
      const ok = expectedCardLength(brand);
      if (!ok.includes(digits.length) && brand !== "CARD")
        return `${brand === "AMEX" ? "AMEX" : "Card"} must be ${ok.join(" or ")} digits.`;
      if (!luhn(digits)) return "Card number is invalid.";
      return "";
    },
    cardExpiry(v) {
      if (!v) return "Expiry is required.";
      if (!/^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(v)) return "Use MM/YY format.";
      if (!futureExp(v)) return "Card is expired.";
      return "";
    },
    cardCvv(v) {
      if (!v) return "CVV is required.";
      if (!/^[0-9]{3,4}$/.test(v)) return "CVV must be 3 or 4 digits.";
      return "";
    },
  };

  // ----- Live formatters / length restrictions -----
  function setupFormatters() {
    const phone = form.elements["phone"];
    if (phone) {
      phone.addEventListener("input", () => {
        let d = phone.value.replace(/\D/g, "").slice(0, 10);
        let out = "";
        if (d.length > 0) out = "(" + d.slice(0, 3);
        if (d.length >= 4) out += ") " + d.slice(3, 6);
        if (d.length >= 7) out += "-" + d.slice(6, 10);
        phone.value = out;
      });
    }

    ["zip", "billingZip"].forEach((name) => {
      const el = form.elements[name];
      if (!el) return;
      el.addEventListener("input", () => {
        let d = el.value.replace(/\D/g, "").slice(0, 9);
        if (d.length > 5) d = d.slice(0, 5) + "-" + d.slice(5);
        el.value = d;
      });
    });

    const card = form.elements["cardNumber"];
    const brandEl = document.getElementById("card-brand");
    if (card) {
      card.addEventListener("input", () => {
        let d = card.value.replace(/\D/g, "").slice(0, 19);
        const brand = detectBrand(d);
        if (brand === "AMEX") {
          d = d.slice(0, 15);
          card.value = (d.match(/(.{1,4})(.{1,6})?(.{1,5})?/) || [d])
            .slice(1)
            .filter(Boolean)
            .join(" ");
        } else {
          d = d.slice(0, 16);
          card.value = (d.match(/.{1,4}/g) || []).join(" ");
        }
        if (brandEl) brandEl.textContent = brand;
      });
    }

    const exp = form.elements["cardExpiry"];
    if (exp) {
      exp.addEventListener("input", () => {
        let d = exp.value.replace(/\D/g, "").slice(0, 4);
        if (d.length >= 3) d = d.slice(0, 2) + "/" + d.slice(2);
        exp.value = d;
      });
    }

    const cvv = form.elements["cardCvv"];
    if (cvv) {
      cvv.addEventListener("input", () => {
        cvv.value = cvv.value.replace(/\D/g, "").slice(0, 4);
      });
    }
  }
  setupFormatters();

  // ----- Inline blur validation -----
  function showError(field, msg) {
    const name = field.name;
    const errEl = form.querySelector(`[data-error-for="${name}"]`);
    if (errEl) errEl.textContent = msg || "";
    field.classList.toggle("invalid", !!msg);
    field.setAttribute("aria-invalid", msg ? "true" : "false");
  }
  function validateField(field) {
    const kind = field.getAttribute("data-validate");
    if (!kind || !VALIDATORS[kind]) return true;
    const msg = VALIDATORS[kind](field.value);
    showError(field, msg);
    return !msg;
  }
  form.querySelectorAll("[data-validate]").forEach((field) => {
    field.addEventListener("blur", () => validateField(field));
    field.addEventListener("input", () => {
      // Clear error as the user fixes it; don't show new errors until next blur.
      if (field.classList.contains("invalid")) {
        const kind = field.getAttribute("data-validate");
        if (kind && VALIDATORS[kind] && !VALIDATORS[kind](field.value)) showError(field, "");
      }
    });
  });

  // ----- Step validation -----
  function validateFieldsInStep(step) {
    const stepEl = document.querySelector(`.checkout-step[data-step="${step}"]`);
    if (!stepEl) return true;
    let allOk = true;
    let firstBad = null;
    stepEl.querySelectorAll("[data-validate]").forEach((field) => {
      if (!validateField(field)) {
        allOk = false;
        if (!firstBad) firstBad = field;
      }
    });
    if (firstBad) firstBad.focus();
    return allOk;
  }

  function validateStep(step) {
    if (step === 1) return validateFieldsInStep(1);
    if (step === 2) {
      if (!validateFieldsInStep(2)) return false;
      const data = readForm();
      const result = window.TI.avs.verify({
        street: data.street,
        city: data.city,
        state: data.state,
        zip: data.zip,
      });
      const status = document.getElementById("address-status");
      if (!result.valid) {
        status.className = "address-status show error";
        status.innerHTML =
          "<strong>We can't verify that address:</strong><ul style=\"margin:8px 0 0 18px\">" +
          result.errors.map((e) => `<li>${e}</li>`).join("") +
          "</ul>";
        return false;
      }
      status.className = "address-status show success";
      status.textContent = "✓ Address verified.";
      return true;
    }
    if (step === 3) return !!form.querySelector('input[name="shipping"]:checked');
    if (step === 4) return validateFieldsInStep(4);
    return true;
  }

  // ----- Shipping option selection -----
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

  // ----- Form helpers -----
  function readForm() {
    const data = {};
    Array.from(form.elements).forEach((el) => {
      if (!el.name) return;
      if (el.type === "checkbox") data[el.name] = el.checked;
      else if (el.type === "radio") {
        if (el.checked) data[el.name] = el.value;
      } else data[el.name] = el.value;
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
    list.innerHTML = c
      .map((item) => {
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
      })
      .join("");
    const data = readForm();
    const shipping = getShippingCost(data.shipping || "standard", subtotal);
    const tax = +(subtotal * 0.08).toFixed(2);
    const total = subtotal + shipping + tax;
    document.getElementById("co-subtotal").textContent = fmt(subtotal);
    document.getElementById("co-shipping").textContent =
      shipping === 0 && subtotal > 0 ? "FREE" : fmt(shipping);
    document.getElementById("co-tax").textContent = fmt(tax);
    document.getElementById("co-total").textContent = fmt(total);
  }

  // Render lines of plain-text content separated by <br>; safe against XSS
  // because every interpolated value is inserted via textContent.
  function renderLines(targetEl, lines) {
    targetEl.innerHTML = "";
    lines.forEach((line, i) => {
      if (i > 0) targetEl.appendChild(document.createElement("br"));
      if (Array.isArray(line)) {
        // Each segment is either a string (textNode) or { strong: "..." }
        line.forEach((seg) => {
          if (typeof seg === "string") {
            targetEl.appendChild(document.createTextNode(seg));
          } else if (seg && typeof seg.strong === "string") {
            const s = document.createElement("strong");
            s.textContent = seg.strong;
            targetEl.appendChild(s);
          }
        });
      } else {
        targetEl.appendChild(document.createTextNode(String(line)));
      }
    });
  }

  function populateReview() {
    const d = readForm();
    renderLines(document.getElementById("rev-contact"), [
      d.fullName || "",
      d.email || "",
      d.phone || "",
    ]);
    renderLines(document.getElementById("rev-address"), [
      (d.street || "") + (d.apt ? ", " + d.apt : ""),
      `${d.city || ""}, ${d.state || ""} ${d.zip || ""}`,
      "United States",
    ]);
    const shipText = {
      standard: "Standard (3–5 business days)",
      expedited: "Expedited (2 business days)",
      express: "Express (1 business day)",
    };
    document.getElementById("rev-shipping").textContent = shipText[d.shipping || "standard"];
    const digits = (d.cardNumber || "").replace(/\D/g, "");
    const last4 = digits.slice(-4);
    const brand = detectBrand(digits);
    renderLines(document.getElementById("rev-payment"), [
      [`${brand} ending in `, { strong: `•••• ${last4}` }],
      `Billing ZIP: ${d.billingZip || ""}`,
    ]);
    const list = document.getElementById("rev-items");
    list.innerHTML = "";
    const ps = products();
    cart().forEach((item) => {
      const p = ps.find((x) => x.id === item.id);
      if (!p) return;
      const li = document.createElement("li");
      li.textContent = `${p.name} — Qty ${item.qty} — ${fmt(p.price * item.qty)}`;
      list.appendChild(li);
    });
  }

  // ----- Place order -----
  document.getElementById("place-order").addEventListener("click", () => {
    const d = readForm();
    const c = cart();
    if (!c.length) {
      alert("Your cart is empty.");
      return;
    }
    // Final guard: re-validate every step before writing the order, in case
    // the user reached step 5 with stale fields (e.g. via deep link / back button).
    for (const step of [1, 2, 4]) {
      if (!validateStep(step)) {
        showStep(step);
        return;
      }
    }
    if (!form.querySelector('input[name="shipping"]:checked')) {
      showStep(3);
      return;
    }
    const ps = products();
    let subtotal = 0;
    const items = c
      .map((item) => {
        const p = ps.find((x) => x.id === item.id);
        if (!p) return null;
        subtotal += p.price * item.qty;
        return { id: p.id, slug: p.slug, name: p.name, price: p.price, qty: item.qty, image: p.image };
      })
      .filter(Boolean);
    const shipping = getShippingCost(d.shipping || "standard", subtotal);
    const tax = +(subtotal * 0.08).toFixed(2);
    const total = subtotal + shipping + tax;
    const orderNum = "TI-" + Math.random().toString(36).slice(2, 10).toUpperCase();
    const order = {
      number: orderNum,
      date: new Date().toISOString(),
      contact: { name: d.fullName, email: d.email, phone: d.phone },
      address: {
        street: d.street,
        apt: d.apt,
        city: d.city,
        state: d.state,
        zip: d.zip,
        country: "United States",
      },
      shippingMethod: d.shipping || "standard",
      shipping,
      subtotal,
      tax,
      total,
      items,
    };
    localStorage.setItem("topinkjet:lastOrder", JSON.stringify(order));
    try {
      const hist = JSON.parse(localStorage.getItem("topinkjet:orders") || "[]");
      hist.unshift(order);
      localStorage.setItem("topinkjet:orders", JSON.stringify(hist.slice(0, 50)));
    } catch (e) {
      /* ignore */
    }
    // Clear cart through the cart API so other listeners (badge, drawer) update.
    if (window.TI.cart && typeof window.TI.cart.clear === "function") {
      window.TI.cart.clear();
    } else {
      localStorage.setItem("ti_cart_v1", JSON.stringify([]));
    }
    window.location.href = "/order-confirmation.html";
  });

  // Init
  updateSummary();
})();
