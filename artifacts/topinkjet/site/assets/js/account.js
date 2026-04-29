// account.js — sign in, sign up, dashboard
(function () {
  "use strict";
  const KEY = "topinkjet:user";
  const fmt = (n) => "$" + n.toFixed(2);

  function setUser(user) { localStorage.setItem(KEY, JSON.stringify(user)); }
  function getUser() { try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { return null; } }

  // Sign-in form
  const signin = document.getElementById("signin-form");
  if (signin) {
    signin.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(signin);
      const email = (data.get("email") || "").toString();
      if (!email.includes("@")) { alert("Please enter a valid email."); return; }
      // Frontend-only "sign in"
      const existing = getUser();
      const user = existing && existing.email === email ? existing : { email, name: email.split("@")[0] };
      setUser(user);
      window.location.href = "/account/dashboard.html";
    });
  }

  const signup = document.getElementById("signup-form");
  if (signup) {
    signup.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(signup);
      const name = (data.get("name") || "").toString();
      const email = (data.get("email") || "").toString();
      const password = (data.get("password") || "").toString();
      if (!name || !email.includes("@") || password.length < 8) {
        alert("Please complete all fields. Password must be at least 8 characters.");
        return;
      }
      setUser({ name, email, createdAt: new Date().toISOString() });
      window.location.href = "/account/dashboard.html";
    });
  }

  // Dashboard
  if (document.getElementById("dashboard-signed-in")) {
    const user = getUser();
    const nin = document.getElementById("dashboard-not-signed-in");
    const sin = document.getElementById("dashboard-signed-in");
    if (user) {
      nin.hidden = true;
      sin.hidden = false;
      document.getElementById("dash-name").textContent = user.name || user.email;
      document.getElementById("dash-email").textContent = user.email;
      let orders = [];
      try { orders = JSON.parse(localStorage.getItem("topinkjet:orders") || "[]"); } catch (e) { orders = []; }
      const ohist = document.getElementById("order-history");
      if (!orders.length) {
        ohist.innerHTML = '<p>No orders yet. <a href="/shop.html">Start shopping →</a></p>';
      } else {
        ohist.innerHTML = orders.map((o) => `
          <article class="cart-line">
            <div></div>
            <div>
              <div class="name">Order ${o.number}</div>
              <div class="meta">${new Date(o.date).toLocaleDateString("en-US", { year:"numeric", month:"short", day:"numeric" })} · ${o.items.length} item${o.items.length===1?"":"s"}</div>
              <div class="meta">Ship to: ${o.address.city}, ${o.address.state} ${o.address.zip}</div>
            </div>
            <div class="price-col">${fmt(o.total)}</div>
          </article>`).join("");
      }
      document.getElementById("signout-btn").addEventListener("click", () => {
        localStorage.removeItem(KEY);
        window.location.reload();
      });
    } else {
      nin.hidden = false;
      sin.hidden = true;
    }
  }
})();
