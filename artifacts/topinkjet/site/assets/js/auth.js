// auth.js — real auth client for the TopInkjet API server.
// Replaces the old localStorage-only "auth" with credentialed fetch
// calls against API_BASE (Express + Postgres on Render).
(function () {
  "use strict";

  // ---------- Config ----------
  // API base URL is injected by build-pages.mjs as a global so the same
  // built site can point at different backends (dev vs prod).
  const API_BASE = (function () {
    const v = window.__TOPINKJET_API_BASE_URL;
    if (typeof v === "string" && v.length > 0) return v.replace(/\/$/, "");
    return "/api";
  })();

  // Tiny local cache of the last-known user, only used to remove the
  // "Sign In / Sign Up" buttons before the network roundtrip completes
  // so the header doesn't flicker. The server is always the source of truth.
  const CACHE_KEY = "topinkjet:auth:cache:v1";
  const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

  function readCache() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return null;
      if (typeof parsed.savedAt !== "number") return null;
      if (Date.now() - parsed.savedAt > CACHE_TTL_MS) return null;
      return parsed.user || null;
    } catch (e) {
      return null;
    }
  }
  function writeCache(user) {
    try {
      if (!user) {
        localStorage.removeItem(CACHE_KEY);
        return;
      }
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ user, savedAt: Date.now() }),
      );
    } catch (e) {
      // ignore quota / disabled storage
    }
  }

  // ---------- API client ----------
  async function api(path, options) {
    const opts = options || {};
    const headers = Object.assign(
      { Accept: "application/json" },
      opts.headers || {},
    );
    if (opts.body !== undefined && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    let res;
    try {
      res = await fetch(API_BASE + path, {
        method: opts.method || "GET",
        credentials: "include",
        headers,
        body: opts.body,
      });
    } catch (err) {
      return {
        ok: false,
        status: 0,
        body: { error: "Network error. Please check your connection." },
      };
    }

    let body = null;
    if (res.status !== 204) {
      try {
        body = await res.json();
      } catch (e) {
        body = null;
      }
    }
    return { ok: res.ok, status: res.status, body };
  }

  async function signUp(payload) {
    const r = await api("/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (r.ok && r.body && r.body.user) writeCache(r.body.user);
    return r;
  }

  async function signIn(payload) {
    const r = await api("/auth/signin", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (r.ok && r.body && r.body.user) writeCache(r.body.user);
    return r;
  }

  async function signOut() {
    const r = await api("/auth/signout", { method: "POST" });
    writeCache(null);
    return r;
  }

  async function getMe() {
    const r = await api("/auth/me");
    if (r.ok && r.body && r.body.user) {
      writeCache(r.body.user);
    } else if (r.status === 401) {
      writeCache(null);
    }
    return r;
  }

  // ---------- Helpers ----------
  function setFormError(form, message) {
    let el = form.querySelector(".auth-form-error");
    if (!el) {
      el = document.createElement("p");
      el.className = "auth-form-error";
      el.setAttribute("role", "alert");
      el.style.color = "#c2273a";
      el.style.marginTop = "0.5rem";
      el.style.fontSize = "0.95rem";
      form.insertBefore(el, form.firstChild);
    }
    el.textContent = message || "";
    el.hidden = !message;
  }

  function setSubmitting(form, submitting, defaultLabel) {
    const btn = form.querySelector('button[type="submit"]');
    if (!btn) return;
    if (submitting) {
      btn.dataset.originalLabel = btn.textContent || defaultLabel;
      btn.disabled = true;
      btn.textContent = "Please wait…";
    } else {
      btn.disabled = false;
      btn.textContent = btn.dataset.originalLabel || defaultLabel;
    }
  }

  function describeError(result, fallback) {
    if (!result) return fallback;
    if (result.body && typeof result.body.error === "string") {
      return result.body.error;
    }
    if (result.status === 0) {
      return "Couldn't reach the server. Please try again.";
    }
    return fallback;
  }

  function redirectAfterAuth() {
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next");
    if (next && next.startsWith("/") && !next.startsWith("//")) {
      window.location.href = next;
      return;
    }
    window.location.href = "/account/dashboard.html";
  }

  // ---------- Header logged-in state ----------
  function applyHeaderState(user) {
    const group = document.querySelector(".header-auth-group");
    if (!group) return;
    if (user) {
      const displayName = user.name && user.name.trim().length > 0
        ? user.name.trim()
        : user.email;
      const initial = (displayName.charAt(0) || "?").toUpperCase();
      group.innerHTML =
        '<a class="header-auth-btn header-account" href="/account/dashboard.html" aria-label="My account">' +
        '<span class="header-account-avatar" aria-hidden="true">' +
        initial.replace(/[<>&"]/g, "") +
        '</span>' +
        '<span class="header-account-label">My Account</span>' +
        '</a>' +
        '<button type="button" class="header-auth-btn header-signout" id="header-signout-btn">Sign Out</button>';
      const btn = document.getElementById("header-signout-btn");
      if (btn) {
        btn.addEventListener("click", async function () {
          btn.disabled = true;
          await signOut();
          window.location.href = "/";
        });
      }
    } else {
      group.innerHTML =
        '<a class="header-auth-btn header-signin" href="/account/sign-in.html">Sign In</a>' +
        '<a class="header-auth-btn header-signup" href="/account/sign-up.html">Sign Up</a>';
    }
  }

  async function refreshHeaderFromServer() {
    const r = await getMe();
    if (r.ok && r.body && r.body.user) {
      applyHeaderState(r.body.user);
    } else {
      applyHeaderState(null);
    }
  }

  // ---------- Page wiring ----------
  function wireSignInForm() {
    const form = document.getElementById("signin-form");
    if (!form) return;
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      setFormError(form, "");
      const data = new FormData(form);
      const email = String(data.get("email") || "").trim();
      const password = String(data.get("password") || "");
      if (!email || !password) {
        setFormError(form, "Please enter your email and password.");
        return;
      }
      setSubmitting(form, true, "Sign In");
      const result = await signIn({ email, password });
      if (result.ok) {
        redirectAfterAuth();
      } else {
        setSubmitting(form, false, "Sign In");
        setFormError(
          form,
          describeError(result, "Sign-in failed. Please try again."),
        );
      }
    });
  }

  function wireSignUpForm() {
    const form = document.getElementById("signup-form");
    if (!form) return;
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      setFormError(form, "");
      const data = new FormData(form);
      const name = String(data.get("name") || "").trim();
      const email = String(data.get("email") || "").trim();
      const password = String(data.get("password") || "");
      if (!email.includes("@")) {
        setFormError(form, "Please enter a valid email address.");
        return;
      }
      if (password.length < 8) {
        setFormError(form, "Password must be at least 8 characters.");
        return;
      }
      setSubmitting(form, true, "Create Account");
      const result = await signUp({
        email,
        password,
        name: name || undefined,
      });
      if (result.ok) {
        redirectAfterAuth();
      } else {
        setSubmitting(form, false, "Create Account");
        setFormError(
          form,
          describeError(
            result,
            "We couldn't create your account. Please try again.",
          ),
        );
      }
    });
  }

  function renderOrderHistoryFromLocalStorage(container) {
    let orders = [];
    try {
      orders = JSON.parse(localStorage.getItem("topinkjet:orders") || "[]");
    } catch (e) {
      orders = [];
    }
    if (!orders.length) {
      container.innerHTML =
        '<p>No orders yet. <a href="/shop.html">Start shopping →</a></p>';
      return;
    }
    const fmt = function (n) {
      return "$" + Number(n).toFixed(2);
    };
    container.innerHTML = orders
      .map(function (o) {
        const date = new Date(o.date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
        return (
          '<article class="cart-line">' +
          "<div></div>" +
          "<div>" +
          '<div class="name">Order ' +
          o.number +
          "</div>" +
          '<div class="meta">' +
          date +
          " · " +
          o.items.length +
          " item" +
          (o.items.length === 1 ? "" : "s") +
          "</div>" +
          '<div class="meta">Ship to: ' +
          o.address.city +
          ", " +
          o.address.state +
          " " +
          o.address.zip +
          "</div>" +
          "</div>" +
          '<div class="price-col">' +
          fmt(o.total) +
          "</div>" +
          "</article>"
        );
      })
      .join("");
  }

  async function wireDashboardPage() {
    const signedInEl = document.getElementById("dashboard-signed-in");
    if (!signedInEl) return; // not the dashboard page
    const notSignedInEl = document.getElementById("dashboard-not-signed-in");
    const dashName = document.getElementById("dash-name");
    const dashEmail = document.getElementById("dash-email");
    const signoutBtn = document.getElementById("signout-btn");
    const orderHistory = document.getElementById("order-history");

    // Optimistic render from cache so signed-in users don't see the
    // "you're not signed in" prompt for a split second.
    const cached = readCache();
    if (cached) {
      notSignedInEl.hidden = true;
      signedInEl.hidden = false;
      dashName.textContent = cached.name || cached.email;
      dashEmail.textContent = cached.email;
    }

    const result = await getMe();
    if (result.ok && result.body && result.body.user) {
      const user = result.body.user;
      notSignedInEl.hidden = true;
      signedInEl.hidden = false;
      dashName.textContent = user.name || user.email;
      dashEmail.textContent = user.email;
      if (orderHistory) renderOrderHistoryFromLocalStorage(orderHistory);
    } else {
      notSignedInEl.hidden = false;
      signedInEl.hidden = true;
    }

    if (signoutBtn) {
      signoutBtn.addEventListener("click", async function () {
        signoutBtn.disabled = true;
        signoutBtn.textContent = "Signing out…";
        await signOut();
        window.location.href = "/";
      });
    }
  }

  // ---------- Bootstrap ----------
  // Apply cached state immediately to avoid a flash of "Sign In / Sign Up"
  // for already-signed-in users.
  const cachedUser = readCache();
  if (cachedUser) applyHeaderState(cachedUser);

  function init() {
    refreshHeaderFromServer();
    wireSignInForm();
    wireSignUpForm();
    wireDashboardPage();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Public API
  window.TopInkjetAuth = {
    signUp: signUp,
    signIn: signIn,
    signOut: signOut,
    getMe: getMe,
    apiBase: API_BASE,
  };
})();
