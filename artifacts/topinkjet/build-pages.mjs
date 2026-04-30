// HTML page generation for TopInkjet. Called from build-site.mjs.
// Every visible string and every internal link is in the raw HTML output.

const SITE_URL = "https://topinkjet.com";
const ASSET_VERSION = String(Math.floor(Date.now() / 1000));
// API base URL for the backend (Express on Render). Defaults to "/api"
// so local dev (which proxies /api → api-server via the Replit gateway) just works.
// In CI we set API_BASE_URL=https://topinkjet-api.onrender.com/api before building.
const API_BASE_URL = process.env.API_BASE_URL || "/api";
const BIZ = {
  name: "TopInkjet",
  tagline: "If you can dream it, we can print it.",
  email: "support@topinkjet.com",
  phone: "(833) 555-0188",
  address: {
    street: "1450 Innovation Way, Suite 220",
    city: "Austin",
    state: "TX",
    zip: "78758",
    country: "United States",
  },
  hours: "Mon–Fri 9:00 AM – 6:00 PM CT",
};

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
function money(n) {
  return "$" + Number(n).toLocaleString("en-US", {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  });
}

// ---------- Header / Footer / Shell ----------
function header(active = "") {
  const links = [
    ["/", "Home", "home"],
    ["/shop.html", "Shop", "shop"],
    ["/category-office-inkjet.html", "Office Inkjet", "office"],
    ["/category-home-inkjet.html", "Home Inkjet", "home-cat"],
    ["/about.html", "About", "about"],
    ["/contact.html", "Contact", "contact"],
  ];
  return `
<header class="site-header">
  <div class="container header-inner">
    <a class="brand-link" href="/" aria-label="TopInkjet home">
      <img src="/assets/img/logo.svg" alt="TopInkjet logo" width="160" height="36"/>
    </a>
    <nav class="main-nav" aria-label="Primary">
      ${links.map(([h, t, k]) => `<a href="${h}"${k===active?' class="active"':""}>${t}</a>`).join("")}
    </nav>
    <div class="header-icons">
      <button class="icon-btn" id="search-toggle" aria-label="Search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
      </button>
      <a class="icon-btn" href="/wishlist.html" aria-label="Wishlist">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-4.5-9.5-9C.5 8 3 4 6.5 4c2 0 3.5 1 5 3 1.5-2 3-3 5-3C20 4 22.5 8 21.5 12 19 16.5 12 21 12 21z"/></svg>
        <span class="cart-badge" id="wishlist-badge" data-count="0">0</span>
      </a>
      <a class="icon-btn" href="/cart.html" aria-label="Cart">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 4h2l3 12h11l3-9H7"/><circle cx="9" cy="20" r="1.6"/><circle cx="18" cy="20" r="1.6"/></svg>
        <span class="cart-badge" id="cart-badge" data-count="0">0</span>
      </a>
      <span class="header-auth-group">
        <a class="header-auth-btn header-signin" href="/account/sign-in.html">Sign In</a>
        <a class="header-auth-btn header-signup" href="/account/sign-up.html">Sign Up</a>
      </span>
      <button class="menu-toggle icon-btn" id="menu-toggle" aria-label="Open menu">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
      </button>
    </div>
  </div>
</header>

<div class="search-overlay" id="search-overlay" role="dialog" aria-modal="true" aria-label="Search">
  <div class="search-box">
    <input type="search" id="search-input" placeholder="Search printers, brands, models…" autocomplete="off"/>
    <div class="search-results" id="search-results" aria-live="polite"></div>
  </div>
</div>
`;
}

function footer() {
  return `
<footer class="site-footer">
  <div class="container footer-grid">
    <div class="footer-brand-col">
      <a class="brand-link" href="/" aria-label="TopInkjet home"><img src="/assets/img/logo-light.svg" alt="TopInkjet" width="160" height="36"/></a>
      <p class="footer-tagline">Premium inkjet printers for US homes and offices. Browse our curated HP lineup to find the model that fits the way you work, study, and create.</p>
      <p class="footer-contact">
        ${esc(BIZ.address.street)}<br/>
        ${esc(BIZ.address.city)}, ${esc(BIZ.address.state)} ${esc(BIZ.address.zip)}<br/>
        <a href="tel:${BIZ.phone.replace(/[^0-9+]/g,'')}">${BIZ.phone}</a><br/>
        <a href="mailto:${BIZ.email}">${BIZ.email}</a>
      </p>
    </div>
    <div>
      <h4>Shop</h4>
      <ul>
        <li><a href="/category-office-inkjet.html">Office Inkjet Printers</a></li>
        <li><a href="/category-home-inkjet.html">Home Inkjet Printers</a></li>
        <li><a href="/shop.html">All Products</a></li>
      </ul>
    </div>
    <div>
      <h4>Help</h4>
      <ul>
        <li><a href="/contact.html">Contact Us</a></li>
        <li><a href="/faq.html">FAQ</a></li>
        <li><a href="/shipping-policy.html">Shipping Policy</a></li>
        <li><a href="/return-policy.html">Return Policy</a></li>
        <li><a href="/refund-policy.html">Refund Policy</a></li>
      </ul>
    </div>
    <div>
      <h4>Legal</h4>
      <ul>
        <li><a href="/about.html">About TopInkjet</a></li>
        <li><a href="/privacy-policy.html">Privacy Policy</a></li>
        <li><a href="/terms-of-service.html">Terms of Service</a></li>
        <li><a href="/cookie-policy.html">Cookie Policy</a></li>
        <li><a href="/do-not-sell-my-personal-info.html">Do Not Sell My Personal Info</a></li>
        <li><a href="/accessibility.html">Accessibility</a></li>
        <li><a href="/disclaimer.html">Disclaimer</a></li>
      </ul>
    </div>
  </div>
  <div class="footer-bottom container">
    <p class="copyright">&copy; ${new Date().getFullYear()} TopInkjet. All rights reserved.</p>
    <p class="disclaimer"><strong>Disclaimer:</strong> TopInkjet is an independent reseller and is not affiliated with, endorsed by, or sponsored by HP Inc. HP, DeskJet, OfficeJet, ScanJet, ENVY, Smart Tank, HP+, and HP Wolf Security are trademarks of HP Inc. All other product names and trademarks are the property of their respective owners. Prices and availability are subject to change without notice. Shipping within the United States only — see <a href="/shipping-policy.html">Shipping Policy</a> for transit times. <a href="/disclaimer.html">Read full disclaimer</a>.</p>
  </div>
</footer>

<aside class="cart-drawer" id="cart-drawer" aria-hidden="true" aria-label="Shopping cart">
  <div class="drawer-head">
    <h3>Added to Cart</h3>
    <button class="icon-btn" id="cart-drawer-close" aria-label="Close">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg>
    </button>
  </div>
  <div class="drawer-body" id="cart-drawer-body"></div>
  <div class="drawer-foot">
    <div class="drawer-totals">
      <span>Subtotal (<span id="drawer-count">0</span> items)</span>
      <strong id="drawer-subtotal">$0.00</strong>
    </div>
    <a href="/checkout.html" class="btn btn-accent btn-block btn-lg">Checkout</a>
    <button class="btn btn-outline btn-block" id="drawer-continue">Continue Shopping</button>
    <a href="/cart.html" class="btn btn-ghost btn-block">View Full Cart</a>
  </div>
</aside>
<div class="overlay" id="overlay"></div>

<div class="cookie-banner" id="cookie-banner" hidden>
  <div class="cookie-inner">
    <p>We use cookies to enhance your browsing experience and analyze site traffic. With your consent, we also load third-party advertising and conversion-tracking tags to measure ad performance and deliver relevant ads. Read our <a href="/privacy-policy.html">Privacy Policy</a> and <a href="/cookie-policy.html">Cookie Policy</a> for full details on advertising and analytics tracking.</p>
    <div class="cookie-actions">
      <button class="btn btn-outline" id="cookie-necessary">Necessary Only</button>
      <button class="btn btn-soft" id="cookie-manage">Manage Preferences</button>
      <button class="btn btn-accent" id="cookie-accept">Accept All</button>
    </div>
  </div>
</div>

<div class="modal" id="cookie-modal" hidden>
  <div class="modal-card">
    <header class="modal-head">
      <h3>Cookie Preferences</h3>
      <button class="icon-btn" id="cookie-modal-close" aria-label="Close">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg>
      </button>
    </header>
    <div class="modal-body">
      <p>Choose which cookie categories TopInkjet may use. You can change your choice anytime by clearing your browser storage and reloading the site.</p>
      <label class="toggle-row">
        <span><strong>Strictly Necessary</strong><br/><small>Required for sign-in, cart, and checkout. Always on.</small></span>
        <input type="checkbox" checked disabled/>
      </label>
      <label class="toggle-row">
        <span><strong>Functional</strong><br/><small>Remembers your preferences such as wishlist and recent views.</small></span>
        <input type="checkbox" id="pref-functional"/>
      </label>
      <label class="toggle-row">
        <span><strong>Performance / Analytics</strong><br/><small>Helps us measure performance and improve the site.</small></span>
        <input type="checkbox" id="pref-analytics"/>
      </label>
      <label class="toggle-row">
        <span><strong>Marketing / Advertising</strong><br/><small>Used to make ads more relevant. Off by default.</small></span>
        <input type="checkbox" id="pref-marketing"/>
      </label>
    </div>
    <footer class="modal-foot">
      <button class="btn btn-outline" id="cookie-modal-save">Save Preferences</button>
      <button class="btn btn-accent" id="cookie-modal-accept-all">Accept All</button>
    </footer>
  </div>
</div>
`;
}

function shell({ title, description, canonical, body, extraCss = "", extraJs = "", jsonld = "", active = "", ogImage = "/assets/img/logo.svg" }) {
  const fullCanonical = SITE_URL + canonical;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<meta name="theme-color" content="#5b3df5"/>
<link rel="canonical" href="${esc(fullCanonical)}"/>
<link rel="icon" type="image/svg+xml" href="/assets/img/favicon.svg"/>
<meta property="og:title" content="${esc(title)}"/>
<meta property="og:description" content="${esc(description)}"/>
<meta property="og:type" content="website"/>
<meta property="og:url" content="${esc(fullCanonical)}"/>
<meta property="og:image" content="${SITE_URL}${ogImage}"/>
<meta property="og:site_name" content="TopInkjet"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${esc(title)}"/>
<meta name="twitter:description" content="${esc(description)}"/>
<meta name="twitter:image" content="${SITE_URL}${ogImage}"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="/assets/css/styles.css?v=${ASSET_VERSION}"/>
${extraCss}
${jsonld}
<script>window.__TOPINKJET_API_BASE_URL=${JSON.stringify(API_BASE_URL)};</script>
</head>
<body>
${header(active)}
<main id="main">
${body}
</main>
${footer()}
<script src="/assets/js/catalog.js?v=3" defer></script>
<script src="/assets/js/products.js" defer></script>
<script src="/assets/js/cart.js?v=3" defer></script>
<script src="/assets/js/wishlist.js?v=4" defer></script>
<script src="/assets/js/cookie-consent.js" defer></script>
<script src="/assets/js/main.js?v=3" defer></script>
<script src="/assets/js/auth.js?v=${ASSET_VERSION}" defer></script>
${extraJs}
</body>
</html>`;
}

// ---------- Reusable widgets ----------
function productCard(p) {
  return `
  <article class="product-card" data-product-id="${esc(p.id)}" data-brand="${esc(p.brand)}" data-price="${p.price}" data-category="${p.category}" data-name="${esc(p.name)}">
    <button class="heart-btn" data-wishlist-toggle="${esc(p.id)}" aria-label="Add ${esc(p.name)} to wishlist">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-4.5-9.5-9C.5 8 3 4 6.5 4c2 0 3.5 1 5 3 1.5-2 3-3 5-3C20 4 22.5 8 21.5 12 19 16.5 12 21 12 21z"/></svg>
    </button>
    <a href="/product/${p.slug}.html" class="img-wrap">
      <img src="/assets/products/${esc(p.thumb || p.image)}" alt="${esc(p.name)}" loading="lazy" decoding="async" width="400" height="300"/>
    </a>
    <div class="body">
      <span class="brand">${esc(p.brand)}</span>
      <a class="title" href="/product/${p.slug}.html">${esc(p.name)}</a>
      <span class="price">${money(p.price)}</span>
      <div class="actions">
        <button class="btn btn-accent btn-sm" data-add-to-cart="${esc(p.id)}">Add to Cart</button>
        <a class="btn btn-outline btn-sm" href="/product/${p.slug}.html">Details</a>
      </div>
    </div>
  </article>`;
}

function breadcrumbs(items) {
  return `
  <nav class="breadcrumbs" aria-label="Breadcrumb">
    <ol>${items.map((i, idx) =>
      idx === items.length - 1
        ? `<li aria-current="page">${esc(i.label)}</li>`
        : `<li><a href="${i.href}">${esc(i.label)}</a></li>`
    ).join('<li class="sep" aria-hidden="true">/</li>')}</ol>
  </nav>`;
}

function breadcrumbJsonLd(items) {
  const list = items.map((i, idx) => ({
    "@type": "ListItem",
    "position": idx + 1,
    "name": i.label,
    "item": i.href ? SITE_URL + i.href : undefined,
  }));
  return `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": list,
  })}</script>`;
}

// ---------- Pages ----------
function pageHome(products) {
  const featured = products.slice(0, 8);
  const office = products.find((p) => p.category === "office-inkjet");
  const home = products.find((p) => p.category === "home-inkjet");
  // Use the flagship 9135e as the hero photo (real product image, not abstract art)
  const heroProduct =
    products.find((p) => p.slug === "hp-officejet-pro-9135e") ||
    products.find((p) => p.slug === "hp-officejet-pro-9125e") ||
    office;
  const orgJsonLd = `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": BIZ.name,
    "url": SITE_URL,
    "logo": SITE_URL + "/assets/img/logo.svg",
    "contactPoint": [{
      "@type": "ContactPoint",
      "telephone": BIZ.phone,
      "contactType": "customer support",
      "areaServed": "US",
      "availableLanguage": ["English"],
    }],
    "address": {
      "@type": "PostalAddress",
      "streetAddress": BIZ.address.street,
      "addressLocality": BIZ.address.city,
      "addressRegion": BIZ.address.state,
      "postalCode": BIZ.address.zip,
      "addressCountry": "US",
    },
    "sameAs": [
      "https://www.facebook.com/topinkjet",
      "https://www.instagram.com/topinkjet",
      "https://x.com/topinkjet",
    ],
  })}</script>`;

  const websiteJsonLd = `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": BIZ.name,
    "url": SITE_URL,
    "potentialAction": {
      "@type": "SearchAction",
      "target": SITE_URL + "/shop.html?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  })}</script>`;

  const body = `
<section class="hero">
  <div class="container hero-grid">
    <div>
      <span class="eyebrow">The Smarter Way to Buy a Printer</span>
      <h1>If You Can Dream It, We Can Print It.</h1>
      <p class="lead">Powerful office printers. Smart home companions. Built for speed, designed for life — one click is all it takes.</p>
      <div class="hero-ctas">
        <a class="btn btn-accent btn-lg" href="/category-office-inkjet.html">Shop Office Printers</a>
        <a class="btn btn-outline btn-lg" href="/category-home-inkjet.html">Shop Home Printers</a>
      </div>
      <div class="hero-mini">
        <span class="mini-pill"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 7.5h11v9h-11z"/><path d="M13.5 10.5h4l4 4v2h-8z"/><circle cx="6.5" cy="18" r="1.8"/><circle cx="17.5" cy="18" r="1.8"/></svg><span class="mp-text">Free US shipping <strong>on&nbsp;every&nbsp;order</strong></span></span>
        <span class="mini-pill"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 13a8 8 0 1 0 2.4-5.7"/><path d="M3 4v5h5"/></svg><span class="mp-text"><strong>30-day</strong> easy returns</span></span>
        <span class="mini-pill"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg><span class="mp-text"><strong>Secure</strong> US&nbsp;checkout</span></span>
      </div>
    </div>
    <div class="hero-art">
      <img src="/assets/products/${esc(heroProduct.image)}" alt="${esc(heroProduct.name)}" loading="eager" decoding="async" fetchpriority="high" width="640" height="520"/>
    </div>
  </div>
</section>

<section class="section section-tight">
  <div class="container trust-strip">
    <div class="trust-card"><div class="ti"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7h13l5 5v5h-3"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg></div><h3>Free US Shipping</h3><p>Standard ground free on every order.</p></div>
    <div class="trust-card"><div class="ti"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 1 3 6.7"/><path d="M3 21v-6h6"/></svg></div><h3>30-Day Returns</h3><p>Hassle-free return window.</p></div>
    <div class="trust-card"><div class="ti"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 2 2.6 5.3 5.9.9-4.3 4.2 1 5.9L12 15.5 6.8 18.3l1-5.9L3.5 8.2l5.9-.9z"/></svg></div><h3>Focused Catalog</h3><p>A tight HP inkjet lineup.</p></div>
    <div class="trust-card"><div class="ti"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="11" width="16" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg></div><h3>Secure Checkout</h3><p>256-bit encrypted payments.</p></div>
  </div>
</section>

<section class="section" id="categories">
  <div class="container">
    <div class="section-head">
      <h2>Pick Your Printer Category</h2>
      <p class="lead">Whether you're outfitting a busy team or a busy household, we've curated a focused lineup so you can choose with confidence.</p>
    </div>
    <div class="cat-grid">
      <a class="cat-card office" href="/category-office-inkjet.html">
        <div class="cat-text">
          <span class="eyebrow">Office</span>
          <h3>Office Inkjet Printers</h3>
          <p>Reliable, fast, all-in-one inkjets for small and mid-size offices. Auto-duplex, mobile fax, and high-yield options.</p>
          <span class="btn btn-accent">Shop Office</span>
        </div>
        <div class="cat-img-wrap"><img src="/assets/products/${esc(office.thumb || office.image)}" alt="${esc(office.name)}" loading="lazy" decoding="async" width="400" height="300"/></div>
      </a>
      <a class="cat-card home" href="/category-home-inkjet.html">
        <div class="cat-text">
          <span class="eyebrow">Home</span>
          <h3>Home Inkjet Printers</h3>
          <p>Compact, quiet, photo-capable printers for homework, hobbies, and hybrid work. Stylish designs that print stunning color.</p>
          <span class="btn btn-accent">Shop Home</span>
        </div>
        <div class="cat-img-wrap"><img src="/assets/products/${esc(home.thumb || home.image)}" alt="${esc(home.name)}" loading="lazy" decoding="async" width="400" height="300"/></div>
      </a>
    </div>
  </div>
</section>

<section class="section section-featured">
  <div class="container">
    <div class="section-head"><span class="eyebrow">Featured</span><h2>Featured Printers</h2><p class="lead">A handpicked selection of best-in-class inkjets across both categories.</p></div>
    <div class="product-grid">
      ${featured.map(productCard).join("")}
    </div>
    <div style="text-align:center; margin-top:36px"><a class="btn btn-outline btn-lg" href="/shop.html">See All Printers</a></div>
  </div>
</section>

<section class="section section-cream" id="buying-guide">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">Buying Guide</span>
      <h2>Find the Right Inkjet in 30 Seconds</h2>
      <p class="lead">Pick by how much you actually print each month. Three honest tiers — no spec-sheet fatigue.</p>
    </div>
    <div class="why-grid">
      <div class="why-card">
        <div class="ti">1</div>
        <h3>Light · Under 100 pgs/mo</h3>
        <p>Homework, forms, the occasional photo. Start with the <a href="/product/hp-deskjet-2855e.html">HP DeskJet 2855e</a> — compact, friendly, and wallet-light.</p>
      </div>
      <div class="why-card">
        <div class="ti">2</div>
        <h3>Mixed · 100–500 pgs/mo</h3>
        <p>Hybrid work, family scans, color projects. The <a href="/product/hp-officejet-pro-8125e.html">OfficeJet Pro 8125e</a> or <a href="/product/hp-envy-inspire-7255e.html">ENVY Inspire 7255e</a> hit the sweet spot.</p>
      </div>
      <div class="why-card">
        <div class="ti">3</div>
        <h3>Heavy · 500+ pgs/mo</h3>
        <p>High-volume offices and busy households. Refillable tanks like the <a href="/product/hp-smart-tank-7301.html">HP Smart Tank 7301</a> drop cost-per-page to pennies.</p>
      </div>
    </div>
    <div style="text-align:center; margin-top:32px"><a class="btn btn-outline" href="/shop.html">Browse All 22 Models</a></div>
  </div>
</section>

<section class="kw-block alt">
  <div class="container">
    <h2>Office &amp; Home Inkjets, Carefully Curated</h2>
    <p>Every printer in our lineup is a current-generation HP inkjet — DeskJet, ENVY, OfficeJet Pro, or Smart Tank — chosen for the way real US homes and offices actually print today. Auto-duplex, mobile printing from the HP Smart app, and wireless setup come standard across the catalog. Step up the range and you add a 35-sheet automatic document feeder, mobile fax, and refillable ink tanks that last up to two years.</p>
    <p>Browse the focused <a href="/category-office-inkjet.html">Office Inkjet collection</a> for desk-side workhorses, or the <a href="/category-home-inkjet.html">Home Inkjet collection</a> for compact, photo-friendly all-in-ones. Either way you get the same TopInkjet experience: free US shipping on every order, 30-day returns, and US-based customer support.</p>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-head"><span class="eyebrow">How It Works</span><h2>Shopping TopInkjet, Step by Step</h2><p class="lead">A clean, four-step path from picking a printer to printing your first page.</p></div>
    <ol class="how-grid">
      <li class="how-card">
        <div class="how-num">01</div>
        <h3>Pick Your Tier</h3>
        <p>Use the buying guide to match a printer to how much you actually print each month — light, mixed, or heavy.</p>
      </li>
      <li class="how-card">
        <div class="how-num">02</div>
        <h3>Order Securely</h3>
        <p>Guest checkout, no required account. PCI-compliant 256-bit encrypted payments with all major US cards and digital wallets.</p>
      </li>
      <li class="how-card">
        <div class="how-num">03</div>
        <h3>Tracked US Shipping</h3>
        <p>We pack your order and email UPS or FedEx tracking as soon as your printer leaves our US warehouse.</p>
      </li>
      <li class="how-card">
        <div class="how-num">04</div>
        <h3>Print with Confidence</h3>
        <p>Set up in minutes with the HP Smart app, backed by the full manufacturer warranty and our 30-day return window.</p>
      </li>
    </ol>
  </div>
</section>

<section class="section">
  <div class="container narrow">
    <div class="section-head"><h2>Frequently Asked Questions</h2><p class="lead">Quick answers to the most common questions before you buy.</p></div>
    <div class="faq-list">
      <details><summary>Do you ship internationally?</summary><p>TopInkjet ships within the United States only at this time. We deliver to all 50 states, Washington D.C., and APO/FPO/DPO addresses.</p></details>
      <details><summary>How long does shipping take?</summary><p>Standard ground shipping arrives in 3–5 business days, free on every order. Transit time begins once your order has been packed and handed to the carrier — typically within 1–2 business days of order placement.</p></details>
      <details><summary>Is shipping really free?</summary><p>Yes — every order ships free via Standard Ground shipping anywhere in the United States, including all 50 states, Washington D.C., US territories, and APO/FPO/DPO addresses. There are no hidden surcharges, no minimum spend, and no membership required. Transit times to Alaska, Hawaii, US territories, and APO/FPO/DPO are typically extended — see our <a href="/shipping-policy.html">Shipping Policy</a> for details.</p></details>
      <details><summary>Can I return a printer if it's not right?</summary><p>Absolutely. Every printer we sell carries a 30-day return window from the date of delivery. The product must be in resalable condition with original packaging. See the <a href="/return-policy.html">Return Policy</a> for details.</p></details>
      <details><summary>Do I need an account to check out?</summary><p>No. Guest checkout is the default and we never force you to create an account. Creating an account is optional and only saves your shipping address for next time.</p></details>
    </div>
  </div>
</section>

`;
  return shell({
    title: "TopInkjet — Office & Home Inkjet Printers, Free US Shipping",
    description: "Premium HP inkjet printers for US homes and offices. Focused catalog, free US shipping on every order, 30-day returns, and US-based customer support.",
    canonical: "/",
    body,
    active: "home",
    jsonld: orgJsonLd + websiteJsonLd,
  });
}

function pageShop(products) {
  const brands = [...new Set(products.map((p) => p.brand))];
  const body = `
${breadcrumbs([{ label: "Home", href: "/" }, { label: "Shop" }])}
<section class="section">
  <div class="container">
    <header class="page-head">
      <h1>All Printers</h1>
      <p class="lead">Browse our complete inkjet lineup — ${products.length} models across office and home categories.</p>
    </header>
    <div class="shop-filterbar" aria-label="Filters">
      <div class="filter-group">
        <span class="filter-label">Type</span>
        <label class="filter-chip"><input type="checkbox" class="filter" data-key="category" value="office-inkjet"/><span>Office</span></label>
        <label class="filter-chip"><input type="checkbox" class="filter" data-key="category" value="home-inkjet"/><span>Home</span></label>
      </div>
      <div class="filter-group">
        <span class="filter-label">Price</span>
        <label class="filter-chip"><input type="checkbox" class="filter" data-key="price" value="0-150"/><span>Under $150</span></label>
        <label class="filter-chip"><input type="checkbox" class="filter" data-key="price" value="150-250"/><span>$150 – $250</span></label>
        <label class="filter-chip"><input type="checkbox" class="filter" data-key="price" value="250-350"/><span>$250 – $350</span></label>
        <label class="filter-chip"><input type="checkbox" class="filter" data-key="price" value="350-9999"/><span>$350+</span></label>
      </div>
      <button class="btn btn-ghost btn-sm filter-clear-btn" id="filter-clear" type="button">Clear</button>
    </div>
    <div class="shop-toolbar">
      <span id="shop-count">${products.length} products</span>
    </div>
    <div class="product-grid" id="shop-grid">
      ${products.map(productCard).join("")}
    </div>
  </div>
</section>

<section class="kw-block alt">
  <div class="container">
    <h2>How to Choose the Right Inkjet Printer</h2>
    <p>Picking an inkjet printer is mostly a question of how much you actually print each month and what kind of work you do. For light home printing — homework, forms, the occasional photo — an entry-level <a href="/product/hp-deskjet-2827e.html">HP DeskJet 2827e</a> or <a href="/product/hp-deskjet-2855e.html">DeskJet 2855e</a> is usually plenty. They're compact, friendly, and cost less than a tank of gas.</p>
    <p>For mixed home-office work — call it 100 to 500 pages a month — step up to an <a href="/product/hp-officejet-pro-8125e.html">OfficeJet Pro 8125e</a> for documents or an <a href="/product/hp-envy-inspire-7255e.html">ENVY Inspire 7255e</a> for photo-heavy households. You get a 35-page automatic document feeder, automatic two-sided printing, and a 250-sheet input tray, so you spend a lot less time at the printer.</p>
    <p>If you print constantly — invoices, contracts, school packets, or a small business — a refillable <a href="/category-home-inkjet.html">HP Smart Tank</a> drops your cost per page to pennies, and an OfficeJet Pro 9000-series like the <a href="/product/hp-officejet-pro-9125e.html">9125e</a> or <a href="/product/hp-officejet-pro-9135e.html">9135e</a> brings business-grade speed and Gigabit Ethernet into the mix. Need full A3 / 11×17 inch tabloid output? The <a href="/product/hp-officejet-pro-9730e-wide-format.html">OfficeJet Pro 9730e</a> is the only printer in our lineup that handles wide-format work.</p>
    <h2>Inkjet vs. Laser: Why Inkjet Still Wins for Most US Households &amp; Offices</h2>
    <p>Modern inkjets — especially HP's current OfficeJet Pro and Smart Tank lines — match or beat color lasers on speed, blow them away on color and photo quality, draw far less power, run quieter, and almost always cost less to buy and run. Unless you genuinely print thousands of black-and-white text pages a week, inkjet is the smarter choice in 2026.</p>
    <h2>Why Buy from TopInkjet?</h2>
    <p>We carry a tight, intentional catalog — 22 current-generation HP inkjets across two clear categories. Every order ships free via Standard Ground inside the United States, every printer carries a 30-day return window, and our US-based support team is one email away. There's no membership, no hidden fee at checkout, and no upsell on shipping. Just a focused selection of printers we'd recommend to a friend.</p>
  </div>
</section>
`;
  return shell({
    title: "Shop All Inkjet Printers — Office & Home | TopInkjet",
    description: `Shop ${products.length} HP inkjet printers for US offices and homes — DeskJet, ENVY, OfficeJet Pro, and Smart Tank. Free US shipping on every order, 30-day returns, US-based support.`,
    canonical: "/shop.html",
    active: "shop",
    body,
    jsonld: breadcrumbJsonLd([{ label: "Home", href: "/" }, { label: "Shop", href: "/shop.html" }]),
    extraJs: `<script src="/assets/js/shop-filters.js" defer></script>`,
  });
}

function pageCategory(products, category) {
  const isOffice = category === "office-inkjet";
  const list = products.filter((p) => p.category === category);
  const title = isOffice ? "Office Inkjet Printers" : "Home Inkjet Printers";
  const intro = isOffice
    ? `Reliable, productive inkjet printers built for small and mid-size offices. Every model features wireless setup, mobile printing, and the kind of paper capacity that keeps your team out of the supply closet. Whether you need a compact desk-side all-in-one or a full wide-format MFP, the right office printer is here.`
    : `Compact, quiet, beautiful printers built for the way modern households actually live and work. From homework and recipes to photo projects and small-business work-from-home, our home inkjet lineup is curated to match every budget and every space.`;
  const body = `
${breadcrumbs([{ label: "Home", href: "/" }, { label: title }])}
<section class="section">
  <div class="container">
    <header class="page-head">
      <span class="eyebrow">${isOffice ? "Office Series" : "Home Series"}</span>
      <h1>${title}</h1>
      <p class="lead">${intro}</p>
    </header>
    <div class="shop-toolbar">
      <span id="shop-count">${list.length} products</span>
    </div>
    <div class="product-grid" id="shop-grid">
      ${list.map(productCard).join("")}
    </div>
  </div>
</section>

<section class="section section-soft">
  <div class="container narrow">
    <h2>About ${title}</h2>
    ${isOffice
      ? `<p>An inkjet printer for the office isn't a single thing — it's a category that ranges from a compact 17-inch all-in-one for a private office to a wide-format wireless MFP for an entire department. Our office lineup is built around the HP OfficeJet and OfficeJet Pro families, which together cover virtually every small-business workload.</p>
         <p>If you're outfitting a home office, the <a href="/product/hp-officejet-8015e.html">8015e</a> or <a href="/product/hp-officejet-pro-8125e.html">8125e</a> hit the value sweet spot. For a small office that needs serious throughput and Gigabit Ethernet, look at the <a href="/product/hp-officejet-pro-9125e.html">9125e</a> or <a href="/product/hp-officejet-pro-9135e.html">9135e</a>. And when full A3/tabloid output is required, the <a href="/product/hp-officejet-pro-9730e-wide-format.html">OfficeJet Pro 9730e</a> is the clear winner.</p>`
      : `<p>The home inkjet category covers everything from a $90 single-user DeskJet that handles homework and forms, to a refillable Smart Tank that prints 6,000 pages on a single set of refills. Our home lineup is built around three HP families — DeskJet for value, ENVY (and ENVY Inspire) for design and photos, and Smart Tank for ultra-low cost per page.</p>
         <p>If you print rarely, start with the <a href="/product/hp-deskjet-2827e.html">DeskJet 2827e</a>. If photos and crafts are central, look at the <a href="/product/hp-envy-inspire-7255e.html">ENVY Inspire 7255e</a>. And if you print constantly and want to forget about cartridges, the <a href="/product/hp-smart-tank-7301.html">Smart Tank 7301</a> is the long-term winner.</p>`}
  </div>
</section>
`;
  return shell({
    title: `${title} — Free US Shipping on All ${list.length} Models | TopInkjet`,
    description: `Shop ${list.length} ${title.toLowerCase()} ${isOffice ? "for small and mid-size US offices — DeskJet, OfficeJet Pro, and wide-format options" : "for US homes — DeskJet, ENVY, ENVY Inspire, and refillable Smart Tank options"}. Free US shipping on every order, 30-day returns, and US-based support.`,
    canonical: `/category-${category}.html`,
    active: isOffice ? "office" : "home-cat",
    body,
    jsonld: breadcrumbJsonLd([
      { label: "Home", href: "/" },
      { label: title, href: `/category-${category}.html` },
    ]),
    extraJs: `<script src="/assets/js/shop-filters.js" defer></script>`,
  });
}

// ---------- product page helpers ----------
function inferProductFamily(p) {
  const s = p.slug;
  if (/officejet-pro-9730|9730/.test(s)) return "wide-format-ojp";
  if (/officejet-pro-91|9110|9125|9135/.test(s)) return "ojp-9000";
  if (/officejet-pro-81|8125|8135|8139/.test(s)) return "ojp-8000";
  if (/officejet-80|8015/.test(s)) return "oj-8000";
  if (/smart-tank/.test(s)) return "smart-tank";
  if (/envy-inspire/.test(s)) return "envy-inspire";
  if (/envy/.test(s)) return "envy";
  if (/deskjet/.test(s)) return "deskjet";
  return p.category === "office-inkjet" ? "ojp-8000" : "deskjet";
}

function inferAudience(p) {
  const fam = inferProductFamily(p);
  switch (fam) {
    case "wide-format-ojp":
      return "architects, real-estate teams, education staff, and finance departments who need full A3 / 11×17 inch tabloid output without the footprint or running costs of a wide-format laser printer";
    case "ojp-9000":
      return "demanding small offices that print, scan, copy, and share documents across a team — including those who need Gigabit Ethernet, color touchscreen workflows, and PCL/PostScript drivers for managed environments";
    case "ojp-8000":
      return "growing home offices and small teams that print every day and want a true workhorse all-in-one — without the expense, heat, and footprint of a comparable color laser";
    case "oj-8000":
      return "value-focused small offices and home offices that need full all-in-one functionality — print, scan, copy, fax — at a friendly price point";
    case "smart-tank":
      return "households and home offices that print constantly and want to forget cartridges — refillable ink tanks deliver thousands of pages per refill and the lowest cost per page in any inkjet category";
    case "envy-inspire":
    case "envy":
      return "design-conscious homes and creative households that print photos, school projects, party invitations, and recipes — and want a printer that looks as good on the desk as it prints on the page";
    case "deskjet":
      return "students, families, and anyone who wants a friendly, affordable home printer for homework, online forms, the occasional photo, and everyday scanning and copying";
    default:
      return "modern US households and offices that need a reliable everyday inkjet";
  }
}

function inferUseCases(p) {
  const fam = inferProductFamily(p);
  if (fam === "wide-format-ojp") return [
    "A3 / 11×17 inch tabloid spreadsheets, drawings, and floor plans",
    "Two-sided document copying and 35-page ADF batch scanning",
    "Wireless network printing for an entire team",
    "Mobile fax sent and received from the HP Smart app",
  ];
  if (fam === "ojp-9000" || fam === "ojp-8000" || fam === "oj-8000") return [
    "Daily contracts, invoices, reports, and proposals",
    "Two-sided document scanning, copying, and (where supported) faxing",
    "Mobile printing from laptops, tablets, and phones across the office",
    "Wireless network sharing across multiple users without a print server",
  ];
  if (fam === "smart-tank") return [
    "High-volume household and home-office printing without cartridge runs",
    "School projects, homework, and worksheets in crisp color",
    "Receipts, forms, recipes, and digital coupons",
    "Mobile printing from any phone, tablet, or laptop",
  ];
  if (fam === "envy" || fam === "envy-inspire") return [
    "4×6, 5×7, and borderless 8.5×11 photo printing on glossy paper",
    "Craft projects, scrapbooking, party invitations, and greeting cards",
    "Document scanning, copying, and everyday school printing",
    "Wireless printing from phones and laptops via the HP Smart app",
  ];
  return [
    "Homework, school assignments, and worksheets",
    "Forms, recipes, digital coupons, and shipping labels",
    "Occasional 4×6 photo printing",
    "Mobile printing via the HP Smart app",
  ];
}

function inferConsumables(p) {
  const fam = inferProductFamily(p);
  if (fam === "smart-tank") {
    return "Smart Tank models use refillable ink bottles instead of cartridges. A starter kit ships in the box and a single set of refills typically delivers thousands of pages — enough for years of household printing for most users. Replacement bottles are available wherever HP supplies are sold and are dramatically cheaper per page than cartridges.";
  }
  return "This printer uses original HP ink cartridges. A starter set ships in the box so you can begin printing during setup. When you need refills, look for the cartridge model number listed in the HP Smart app, on the cartridge itself, or on the HP supplies page. HP+ eligible models also unlock optional Instant Ink — a subscription that automatically ships replacement cartridges before you run out, sized to how much you actually print.";
}

function inferHighlights(p) {
  // Pick up to 4 marketable specs as quick highlights
  const order = ["Functions", "Print Speed", "ADF", "Duplex", "Display", "Connectivity", "Paper Capacity", "Mobile Printing", "Print Quality"];
  return order.filter((k) => p.specs[k]).slice(0, 4).map((k) => ({ key: k, value: p.specs[k] }));
}

function inferFeatureBullets(p) {
  const featureMap = {
    "Print Speed": (v) => `<strong>${esc(v)}</strong> — keep meetings on schedule and stop waiting on warmup beeps.`,
    "Print Quality": (v) => `<strong>${esc(v)}</strong> — sharp text, accurate color, and lab-quality photos when you need them.`,
    "ADF": (v) => `<strong>${esc(v)}</strong> — load a stack and walk away while it scans, copies, and (where supported) faxes hands-free.`,
    "Duplex": (v) => `<strong>${esc(v)}</strong> — automatically cut paper use in half on every long document.`,
    "Connectivity": (v) => `<strong>${esc(v)}</strong> — connect to any modern home or office network in minutes.`,
    "Mobile Printing": (v) => `<strong>${esc(v)}</strong> — print straight from a phone, tablet, or Chromebook over Wi-Fi.`,
    "Display": (v) => `<strong>${esc(v)}</strong> — change any setting at the device without touching a computer.`,
    "Paper Capacity": (v) => `<strong>${esc(v)}</strong> — fewer paper-tray reloads and fewer interruptions.`,
    "Functions": (v) => `<strong>${esc(v)}</strong> — replaces a separate printer, scanner, copier, and (where listed) fax.`,
    "Page Yield": (v) => `<strong>${esc(v)}</strong> — drop your cost-per-page to a fraction of cartridge pricing.`,
    "Photo Print": (v) => `<strong>${esc(v)}</strong> — print frame-worthy photos straight from your phone.`,
    "Borderless": (v) => `<strong>${esc(v)}</strong> — full-bleed photos with no white margins.`,
    "Ink Tank": (v) => `<strong>${esc(v)}</strong> — refillable tanks instead of cartridges keep cost-per-page low.`,
    "Max Paper Size": (v) => `<strong>${esc(v)}</strong> — supports oversized documents most desktop printers can't handle.`,
  };
  const out = [];
  for (const [k, v] of Object.entries(p.specs)) {
    if (featureMap[k]) out.push(featureMap[k](v));
  }
  return out.slice(0, 6);
}

function inferOverviewCopy(p) {
  const fam = inferProductFamily(p);
  const cat = p.category === "office-inkjet" ? "office" : "home";
  const para2 = (() => {
    if (fam === "wide-format-ojp") return `Wide-format printing has historically meant heavy laser MFPs, expensive toner, and a dedicated equipment closet. The ${esc(p.name)} brings full A3 / 11×17 inch output back to the desktop, paired with a duplex automatic document feeder, dual paper trays, and a color touchscreen — at a fraction of the cost-per-page of a comparable color laser.`;
    if (fam === "ojp-9000") return `Built for offices that take printing seriously, the ${esc(p.name)} pairs business-grade speed with the security and management features modern IT teams expect. Native dual-band Wi-Fi, a 250-sheet input tray, automatic two-sided printing, and a duplex automatic document feeder mean fewer interruptions and more finished work.`;
    if (fam === "ojp-8000" || fam === "oj-8000") return `The ${esc(p.name)} is engineered for the way real small offices and home offices actually work today — a mix of email, PDFs, contracts, scanning, and the occasional fax. Wireless setup over the HP Smart app takes about five minutes, and the printer is ready to share across every device on your network.`;
    if (fam === "smart-tank") return `Smart Tank flips the inkjet economics on its head. Instead of buying cartridges every few months, you fill the tanks once and print for what HP estimates is up to two years of typical home use before refilling. The result is dramatically lower cost-per-page than any cartridge-based printer in the same class.`;
    if (fam === "envy" || fam === "envy-inspire") return `The ENVY series is the photo-and-creativity flagship of the HP home lineup. Color reproduction is tuned for portraits, landscapes, and craft projects, and the included Smart app makes it effortless to send a photo from your phone and have it print at the highest quality the paper will allow.`;
    return `Set up the ${esc(p.name)} in about five minutes with the HP Smart app, then print, scan, and copy from any phone, tablet, or laptop on your network. Dual-band Wi-Fi keeps the connection rock-solid, and the included starter ink lets you print right out of the box.`;
  })();
  const para3 = cat === "office"
    ? `Every order ships free via Standard Ground inside the United States, with a 30-day return window and the full HP manufacturer warranty. Our team is US-based and reachable by email any day of the week — see the <a href="/contact-us.html">Contact page</a> for details.`
    : `Every order ships free via Standard Ground inside the United States, backed by our 30-day return window and the full HP manufacturer warranty. Need help choosing or have a question after delivery? Our US-based support team is one email away — see the <a href="/contact-us.html">Contact page</a>.`;
  return [esc(p.long), para2, para3];
}

function inferWhatsInBox(p) {
  const fam = inferProductFamily(p);
  const isTank = fam === "smart-tank";
  const list = [
    `${p.name}`,
    `Original HP setup ink ${isTank ? "kit (bottles)" : "cartridges"}`,
    `Power cord (US plug)`,
    `Quick-start setup guide`,
    `Software & driver download instructions`,
  ];
  // Add a phone cord on fax-capable models
  const fns = (p.specs["Functions"] || "").toLowerCase();
  if (fns.includes("fax")) list.push(`Phone cord (for fax line)`);
  return list;
}

function makeProductFaq(p) {
  const isTank = inferProductFamily(p) === "smart-tank";
  return [
    {
      q: `Does the ${p.name} come with ink in the box?`,
      a: isTank
        ? `Yes — every HP Smart Tank ship from our US warehouse with a starter ink kit (bottles) so you can fill the tanks during setup and start printing right away. Refill bottles are widely available and last for thousands of pages.`
        : `Yes. Every printer ships with a starter set of original HP ink cartridges so you can complete wireless setup and print immediately. When the starters run low, install standard HP cartridges or, on HP+ eligible models, enroll in optional Instant Ink for automatic refills.`,
    },
    {
      q: `Will the ${p.name} work with my Mac, iPhone, Android phone, or Chromebook?`,
      a: `Yes. The ${esc(p.name)} supports Apple AirPrint for iPhone, iPad, and macOS; Mopria for Android; the HP Smart app on iOS and Android; and standard drivers for macOS, Windows 10/11, and ChromeOS. Wi-Fi Direct lets phones print without a router when needed.`,
    },
    {
      q: `Is wireless setup straightforward, or do I need a USB cable?`,
      a: `Setup is wireless and typically takes under five minutes. Install the HP Smart app on your phone, follow the prompts, and the app pairs the printer with your Wi-Fi network. A USB 2.0 port is included if you prefer a wired connection — but no USB cable is required for normal use.`,
    },
    {
      q: `What does shipping cost on the ${p.name}?`,
      a: `Shipping is completely free. Every TopInkjet order ships free via Standard Ground inside the United States — no minimum spend, no membership, no hidden surcharges. Standard Ground typically delivers in 3–5 business days. See our <a href="/shipping-policy.html">Shipping Policy</a> for details.`,
    },
    {
      q: `Can I return the ${p.name} if it isn't right for me?`,
      a: `Yes. You have 30 days from delivery to return any printer for a full refund of the product price, as long as it's in resalable condition with the original packaging and accessories. Read the full <a href="/return-policy.html">Return Policy</a> for instructions and exceptions.`,
    },
    {
      q: `Is the ${p.name} backed by a warranty?`,
      a: `Yes. Every printer ships with the full HP manufacturer warranty (typically a 1-year limited hardware warranty). Registration is optional, and HP customer support is reachable directly through the HP Smart app and the HP support site if anything ever goes wrong.`,
    },
    {
      q: `Does TopInkjet ship outside the United States?`,
      a: `No — TopInkjet currently ships within the United States only, including all 50 states, Washington D.C., and APO/FPO/DPO addresses. We do not ship internationally at this time.`,
    },
  ];
}

function pageProduct(p, allProducts) {
  const related = allProducts
    .filter((x) => x.category === p.category && x.id !== p.id)
    .slice(0, 4);
  const catTitle = p.category === "office-inkjet" ? "Office Inkjet" : "Home Inkjet";
  const highlights = inferHighlights(p);
  const features = inferFeatureBullets(p);
  const useCases = inferUseCases(p);
  const audience = inferAudience(p);
  const consumables = inferConsumables(p);
  const overview = inferOverviewCopy(p);
  const whatsInBox = inferWhatsInBox(p);
  const faqs = makeProductFaq(p);

  const productJsonLd = `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Product",
    "name": p.name,
    "image": p.gallery.map((g) => SITE_URL + "/assets/products/" + g),
    "description": p.short,
    "sku": p.sku,
    "mpn": p.sku,
    "brand": { "@type": "Brand", "name": p.brand },
    "category": catTitle,
    "offers": {
      "@type": "Offer",
      "url": SITE_URL + "/product/" + p.slug + ".html",
      "priceCurrency": "USD",
      "price": p.price.toFixed(2),
      "availability": "https://schema.org/InStock",
      "itemCondition": "https://schema.org/NewCondition",
      "seller": { "@type": "Organization", "name": "TopInkjet" },
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingRate": { "@type": "MonetaryAmount", "value": "0", "currency": "USD" },
        "shippingDestination": { "@type": "DefinedRegion", "addressCountry": "US" },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "handlingTime": { "@type": "QuantitativeValue", "minValue": 1, "maxValue": 2, "unitCode": "DAY" },
          "transitTime": { "@type": "QuantitativeValue", "minValue": 3, "maxValue": 5, "unitCode": "DAY" }
        }
      },
      "hasMerchantReturnPolicy": {
        "@type": "MerchantReturnPolicy",
        "applicableCountry": "US",
        "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
        "merchantReturnDays": 30,
        "returnMethod": "https://schema.org/ReturnByMail",
        "returnFees": "https://schema.org/FreeReturn"
      }
    },
  })}</script>`;
  const faqJsonLd = `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((f) => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": { "@type": "Answer", "text": f.a.replace(/<[^>]+>/g, "") }
    }))
  })}</script>`;
  const breadJsonLd = breadcrumbJsonLd([
    { label: "Home", href: "/" },
    { label: catTitle, href: `/category-${p.category}.html` },
    { label: p.name, href: `/product/${p.slug}.html` },
  ]);
  const body = `
${breadcrumbs([
  { label: "Home", href: "/" },
  { label: catTitle, href: `/category-${p.category}.html` },
  { label: p.name },
])}
<section class="section section-tight">
  <div class="container product-page">
    <div class="product-gallery">
      <div class="main-image">
        <img id="main-product-image" src="/assets/products/${esc(p.gallery[0])}" alt="${esc(p.name)} primary view" width="640" height="640" decoding="async" fetchpriority="high"/>
      </div>
      <div class="thumbs">
        ${p.gallery.map((g, i) => {
          const t = (p.thumbs && p.thumbs[i]) || g;
          return `<button class="thumb${i===0?' active':''}" data-img="/assets/products/${esc(g)}" aria-label="View image ${i+1}"><img src="/assets/products/${esc(t)}" alt="${esc(p.name)} view ${i+1}" loading="lazy" decoding="async" width="80" height="80"/></button>`;
        }).join("")}
      </div>
    </div>
    <div class="product-info">
      <span class="brand">${esc(p.brand)}</span>
      <h1>${esc(p.name)}</h1>
      <p class="lead">${esc(p.short)}</p>
      <div class="price-block">
        <span class="price-big">${money(p.price)}</span>
        <span class="price-meta">USD · Free US shipping on every order</span>
      </div>
      <div class="qty-row">
        <label for="qty">Qty</label>
        <div class="qty-control">
          <button type="button" data-qty="-1" aria-label="Decrease">−</button>
          <input id="qty" type="number" min="1" value="1"/>
          <button type="button" data-qty="+1" aria-label="Increase">+</button>
        </div>
      </div>
      <div class="cta-row">
        <button class="btn btn-accent btn-lg" data-add-to-cart="${esc(p.id)}" data-qty-source="qty">Add to Cart</button>
        <button class="btn btn-outline btn-lg" data-wishlist-toggle="${esc(p.id)}">♡ Add to Wishlist</button>
      </div>
      <ul class="ship-bullets">
        <li>✓ Ships from our US warehouse</li>
        <li>✓ Free Standard Shipping on every order (3–5 business days)</li>
        <li>✓ 30-Day Returns — see <a href="/return-policy.html">Return Policy</a></li>
        <li>✓ Backed by the full manufacturer warranty</li>
        <li>✓ Secure US checkout — all major cards & digital wallets</li>
      </ul>
      ${highlights.length ? `<div class="hl-strip" aria-label="Quick highlights">
        ${highlights.map((h) => `<div class="hl-pill"><span class="hl-key">${esc(h.key)}</span><span class="hl-val">${esc(h.value)}</span></div>`).join("")}
      </div>` : ""}
    </div>
  </div>
</section>

<section class="section">
  <div class="container product-tabs">
    <article class="prod-section">
      <h2>Overview</h2>
      ${overview.map((para) => `<p>${para}</p>`).join("\n      ")}
    </article>

    ${features.length ? `<article class="prod-section">
      <h2>Key Features &amp; Benefits</h2>
      <ul class="feature-list">
        ${features.map((f) => `<li>${f}</li>`).join("")}
      </ul>
    </article>` : ""}

    <article class="prod-section">
      <h2>Who It's For</h2>
      <p>The ${esc(p.name)} is designed for ${audience}.</p>
      <h3>Common Use Cases</h3>
      <ul class="use-list">
        ${useCases.map((u) => `<li>${esc(u)}</li>`).join("")}
      </ul>
    </article>

    <article class="prod-section">
      <h2>Set Up in Three Steps</h2>
      <ol class="setup-grid">
        <li class="setup-card"><div class="setup-num">1</div><h3>Unbox &amp; Power On</h3><p>Remove all the orange protective tape, plug in the power cord, and turn on the printer. Load a few sheets of letter paper into the input tray.</p></li>
        <li class="setup-card"><div class="setup-num">2</div><h3>Open the HP Smart App</h3><p>Download the free HP Smart app on iOS, Android, macOS, or Windows. The app will detect your new printer over Bluetooth Low Energy and walk you through Wi-Fi setup.</p></li>
        <li class="setup-card"><div class="setup-num">3</div><h3>Install Ink &amp; Align</h3><p>Insert the included starter ${inferProductFamily(p) === "smart-tank" ? "ink bottles into the tanks" : "cartridges"}, print and scan the alignment page when prompted, and you're ready to print from any device on the network.</p></li>
      </ol>
    </article>

    <article class="prod-section">
      <h2>Connectivity &amp; Mobile Printing</h2>
      <p>The ${esc(p.name)} connects with ${esc(p.specs["Connectivity"] || "dual-band Wi-Fi, Wi-Fi Direct, and USB 2.0")}, so it integrates seamlessly into any modern home or office network. Mobile printing is supported through ${esc(p.specs["Mobile Printing"] || "the HP Smart app, AirPrint, and Mopria")}, which means iPhone, iPad, Android, Chromebook, macOS, and Windows users can all print without installing custom drivers in most cases. Wi-Fi Direct lets phones connect to the printer without a router — useful in shared workspaces, classrooms, or anywhere guest devices need to print.</p>
    </article>

    <article class="prod-section">
      <h2>Specifications</h2>
      <table class="spec-table">
        <tbody>
          ${Object.entries(p.specs).map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`).join("")}
          <tr><th scope="row">SKU</th><td>${esc(p.sku)}</td></tr>
          <tr><th scope="row">Manufacturer Part Number</th><td>${esc(p.sku)}</td></tr>
          <tr><th scope="row">Brand</th><td>${esc(p.brand)}</td></tr>
          <tr><th scope="row">Category</th><td>${catTitle}</td></tr>
          <tr><th scope="row">Country of Sale</th><td>United States only</td></tr>
        </tbody>
      </table>
    </article>

    <article class="prod-section">
      <h2>What's in the Box</h2>
      <ul class="box-list">
        ${whatsInBox.map((it) => `<li>${esc(it)}</li>`).join("")}
      </ul>
    </article>

    <article class="prod-section">
      <h2>Ink &amp; Supplies</h2>
      <p>${consumables}</p>
    </article>

    <article class="prod-section">
      <h2>Shipping, Returns &amp; Warranty</h2>
      <h3>Free US Shipping on Every Order</h3>
      <p>The ${esc(p.name)} ships free via Standard Ground inside the United States. Standard Ground transit is typically 3–5 business days after dispatch, and we hand orders to the carrier within 1–2 business days of order placement. We deliver to all 50 states, Washington D.C., and APO/FPO/DPO addresses. We do not currently ship internationally.</p>
      <h3>30-Day Returns</h3>
      <p>Return any printer within 30 days of delivery for a full refund of the product price. The product must be in resalable condition with original packaging and all accessories. Email us through the <a href="/contact-us.html">Contact page</a> to start a return — we reply within one business day. Read the full <a href="/return-policy.html">Return Policy</a> and <a href="/refund-policy.html">Refund Policy</a> for details.</p>
      <h3>Manufacturer Warranty</h3>
      <p>Every ${esc(p.brand)} printer we sell is backed by the full ${esc(p.brand)} manufacturer warranty (typically a 1-year limited hardware warranty). HP customer support is reachable directly through the HP Smart app and the HP support website. Warranty registration is optional but recommended.</p>
    </article>

    <article class="prod-section">
      <h2>Frequently Asked Questions</h2>
      <div class="faq-list">
        ${faqs.map((f) => `<details><summary>${esc(f.q)}</summary><p>${f.a}</p></details>`).join("")}
      </div>
    </article>
  </div>
</section>

<section class="section section-soft">
  <div class="container">
    <div class="section-head"><h2>You May Also Like</h2><p class="lead">Other ${catTitle.toLowerCase()} printers in the same family.</p></div>
    <div class="product-grid">
      ${related.map(productCard).join("")}
    </div>
  </div>
</section>
`;
  // Pick the shortest title template that fits within ~65 chars without truncation
  const titleCandidates = [
    `${p.name} — Free US Shipping | TopInkjet`,
    `${p.name} | TopInkjet`,
  ];
  const finalTitle = titleCandidates.find((t) => t.length <= 65) || titleCandidates[titleCandidates.length - 1];
  // Build a description that ends naturally at a sentence boundary, not a hard cut
  const fullDesc = `${p.short} Free US shipping on every order, 30-day returns, US-based support.`;
  const finalDesc = fullDesc.length <= 160 ? fullDesc : `${p.short} Free US shipping on every order. 30-day returns.`;
  return shell({
    title: finalTitle,
    description: finalDesc,
    canonical: `/product/${p.slug}.html`,
    active: p.category === "office-inkjet" ? "office" : "home-cat",
    body,
    ogImage: "/assets/products/" + p.image,
    jsonld: productJsonLd + faqJsonLd + breadJsonLd,
    extraJs: `<script src="/assets/js/product.js" defer></script>`,
  });
}

function pageCart(products) {
  const suggestions = products.slice(0, 6);
  const body = `
${breadcrumbs([{ label: "Home", href: "/" }, { label: "Cart" }])}
<section class="section">
  <div class="container">
    <h1>Your Cart</h1>
    <div class="cart-page">
      <div id="cart-list">
        <div class="empty-state empty-state-card" id="cart-empty">
          <div class="empty-icon" aria-hidden="true">
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="32" cy="32" r="32" fill="#ECF2FF"/>
              <path d="M18 22h4l3 18a3 3 0 0 0 3 2.5h12a3 3 0 0 0 3-2.4L46 27H24" stroke="#7c5cff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
              <circle cx="28" cy="48" r="2.6" fill="#7c5cff"/>
              <circle cx="40" cy="48" r="2.6" fill="#7c5cff"/>
            </svg>
          </div>
          <h2>Your cart is empty</h2>
          <p>Browse our <a href="/shop.html">printer catalog</a> or pick from one of our suggestions below.</p>
          <a class="btn btn-accent" href="/shop.html">Shop All Printers</a>
        </div>
        <div class="cart-items" id="cart-items"></div>
      </div>
      <aside class="cart-summary" id="cart-summary">
        <h3>Order Summary</h3>
        <div class="row"><span>Subtotal</span><strong id="cart-subtotal">$0.00</strong></div>
        <div class="row"><span>Estimated Tax (8%)</span><strong id="cart-tax">$0.00</strong></div>
        <div class="row"><span>Shipping</span><strong id="cart-shipping" class="co-free">FREE</strong></div>
        <div class="row total"><span>Total</span><strong id="cart-total">$0.00</strong></div>
        <p class="ship-note">🚚 Free Standard Ground Shipping on every order.</p>
        <a class="btn btn-accent btn-block btn-lg" href="/checkout.html">Proceed to Checkout</a>
        <a class="btn btn-outline btn-block" href="/shop.html">Continue Shopping</a>
      </aside>
    </div>
  </div>
</section>
<section class="section section-soft">
  <div class="container">
    <div class="section-head"><h2>Suggested for You</h2><p class="lead">A few popular printers if you need a starting point.</p></div>
    <div class="product-grid">${suggestions.map(productCard).join("")}</div>
  </div>
</section>
`;
  return shell({
    title: "Shopping Cart — TopInkjet",
    description: "Review the items in your TopInkjet shopping cart and proceed to secure checkout.",
    canonical: "/cart.html",
    body,
    extraJs: `<script src="/assets/js/cart-page.js?v=3" defer></script>`,
  });
}

function pageWishlist(products) {
  const suggestions = products.slice(2, 8);
  const body = `
${breadcrumbs([{ label: "Home", href: "/" }, { label: "Wishlist" }])}
<section class="section">
  <div class="container">
    <h1>Your Wishlist</h1>
    <p class="lead">Save printers you love and come back to them later.</p>
    <div class="empty-state empty-state-card" id="wishlist-empty">
      <div class="empty-icon" aria-hidden="true">
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="32" fill="#FFF4D2"/>
          <path d="M32 46s-12-7.4-12-16a7 7 0 0 1 12-4.9A7 7 0 0 1 44 30c0 8.6-12 16-12 16z" stroke="#7c5cff" stroke-width="2.4" stroke-linejoin="round" fill="none"/>
        </svg>
      </div>
      <h2>Your wishlist is empty</h2>
      <p>Tap the heart on any product to save it for later.</p>
      <a class="btn btn-accent" href="/shop.html">Browse Printers</a>
    </div>
    <div class="product-grid" id="wishlist-items"></div>
  </div>
</section>
<section class="section section-soft">
  <div class="container">
    <div class="section-head"><h2>Suggested Picks</h2><p class="lead">Popular models other shoppers are eyeing.</p></div>
    <div class="product-grid">${suggestions.map(productCard).join("")}</div>
  </div>
</section>
`;
  return shell({
    title: "Wishlist — TopInkjet",
    description: "Your saved printers and accessories from TopInkjet. Move items to your cart anytime.",
    canonical: "/wishlist.html",
    body,
    extraJs: `<script src="/assets/js/wishlist-page.js?v=4" defer></script>`,
  });
}

function pageCheckout() {
  const states = [
    "AL","AK","AZ","AR","CA","CO","CT","DE","DC","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
  ];
  const stateNames = {AL:"Alabama",AK:"Alaska",AZ:"Arizona",AR:"Arkansas",CA:"California",CO:"Colorado",CT:"Connecticut",DE:"Delaware",DC:"District of Columbia",FL:"Florida",GA:"Georgia",HI:"Hawaii",ID:"Idaho",IL:"Illinois",IN:"Indiana",IA:"Iowa",KS:"Kansas",KY:"Kentucky",LA:"Louisiana",ME:"Maine",MD:"Maryland",MA:"Massachusetts",MI:"Michigan",MN:"Minnesota",MS:"Mississippi",MO:"Missouri",MT:"Montana",NE:"Nebraska",NV:"Nevada",NH:"New Hampshire",NJ:"New Jersey",NM:"New Mexico",NY:"New York",NC:"North Carolina",ND:"North Dakota",OH:"Ohio",OK:"Oklahoma",OR:"Oregon",PA:"Pennsylvania",RI:"Rhode Island",SC:"South Carolina",SD:"South Dakota",TN:"Tennessee",TX:"Texas",UT:"Utah",VT:"Vermont",VA:"Virginia",WA:"Washington",WV:"West Virginia",WI:"Wisconsin",WY:"Wyoming"};
  const body = `
${breadcrumbs([{ label: "Home", href: "/" }, { label: "Cart", href: "/cart.html" }, { label: "Checkout" }])}
<section class="section">
  <div class="container">
    <h1>Secure Checkout</h1>
    <p class="lead">Guest checkout — no account required. <a href="/account/sign-in.html">Already have an account? Sign in</a> (optional).</p>
    <ol class="progress-bar" role="list">
      <li class="progress-step active" data-step="1"><span class="num">1</span><span class="label">Contact</span></li>
      <li class="progress-step" data-step="2"><span class="num">2</span><span class="label">Address</span></li>
      <li class="progress-step" data-step="3"><span class="num">3</span><span class="label">Delivery</span></li>
      <li class="progress-step" data-step="4"><span class="num">4</span><span class="label">Payment</span></li>
      <li class="progress-step" data-step="5"><span class="num">5</span><span class="label">Review</span></li>
    </ol>

    <div class="checkout-layout">
      <form id="checkout-form" novalidate>
        <!-- STEP 1 -->
        <section class="checkout-step active" data-step="1">
          <header class="step-head">
            <span class="step-badge">1</span>
            <div>
              <h2>Contact Info</h2>
              <p class="step-sub">We use this to send your order confirmation and shipping updates.</p>
            </div>
          </header>
          <div class="form-grid">
            <label class="span-2"><span>Email <em>*</em></span><input type="email" name="email" required autocomplete="email" data-validate="email" placeholder="you@example.com"/><small class="field-error" data-error-for="email"></small></label>
            <label><span>Full Name <em>*</em></span><input type="text" name="fullName" required autocomplete="name" data-validate="name" placeholder="Jane Doe"/><small class="field-error" data-error-for="fullName"></small></label>
            <label><span>Phone (US) <em>*</em></span><input type="tel" name="phone" required placeholder="(555) 555-1234" autocomplete="tel" maxlength="14" inputmode="numeric" data-validate="phone"/><small class="field-error" data-error-for="phone"></small></label>
          </div>
          <div class="step-actions"><span></span><button class="btn btn-accent btn-lg" type="button" data-next="2">Continue to Address</button></div>
        </section>

        <!-- STEP 2 -->
        <section class="checkout-step" data-step="2">
          <header class="step-head">
            <span class="step-badge">2</span>
            <div>
              <h2>Shipping Address</h2>
              <p class="step-sub">United States only. We verify the address before continuing.</p>
            </div>
          </header>
          <div class="form-grid">
            <label class="span-2"><span>Street Address <em>*</em></span><input type="text" name="street" required autocomplete="address-line1" placeholder="123 Main St" data-validate="street"/><small class="field-error" data-error-for="street"></small></label>
            <label class="span-2"><span>Apt / Suite (optional)</span><input type="text" name="apt" autocomplete="address-line2" placeholder="Apt 4B"/></label>
            <label><span>City <em>*</em></span><input type="text" name="city" required autocomplete="address-level2" data-validate="city" placeholder="Austin"/><small class="field-error" data-error-for="city"></small></label>
            <label><span>State <em>*</em></span>
              <select name="state" required autocomplete="address-level1" data-validate="state">
                <option value="">Select…</option>
                ${states.map((s) => `<option value="${s}">${stateNames[s]}</option>`).join("")}
              </select>
              <small class="field-error" data-error-for="state"></small>
            </label>
            <label><span>ZIP Code <em>*</em></span><input type="text" name="zip" required placeholder="78758" autocomplete="postal-code" maxlength="10" inputmode="numeric" data-validate="zip"/><small class="field-error" data-error-for="zip"></small></label>
            <label><span>Country</span><input type="text" name="country" value="United States" readonly disabled/></label>
          </div>
          <div class="address-status" id="address-status" role="status"></div>
          <div class="step-actions">
            <button class="btn btn-outline" type="button" data-prev="1">Back</button>
            <button class="btn btn-accent btn-lg" type="button" data-next="3" id="verify-btn">Verify &amp; Continue</button>
          </div>
        </section>

        <!-- STEP 3 — Delivery Preferences -->
        <section class="checkout-step" data-step="3">
          <header class="step-head">
            <span class="step-badge">3</span>
            <div>
              <h2>Delivery Preferences</h2>
              <p class="step-sub">Free standard ground shipping (3–5 business days) on every order. Tell us how you'd like it delivered.</p>
            </div>
          </header>

          <div class="free-ship-banner">
            <span class="fs-icon" aria-hidden="true">🚚</span>
            <div>
              <strong>Standard Ground Shipping — FREE</strong>
              <span>Arrives in 3–5 business days. Tracked end-to-end via the carrier.</span>
            </div>
          </div>

          <fieldset class="delivery-fieldset">
            <legend>How should we deliver?</legend>
            <div class="delivery-options">
              <label class="delivery-option selected">
                <input type="radio" name="deliveryMethod" value="leave-at-door" checked/>
                <div class="opt-icon" aria-hidden="true">📦</div>
                <div class="opt-body">
                  <div class="opt-name">Leave at door</div>
                  <div class="opt-desc">Driver leaves the package at your front door. No signature needed.</div>
                </div>
              </label>
              <label class="delivery-option">
                <input type="radio" name="deliveryMethod" value="signature-required"/>
                <div class="opt-icon" aria-hidden="true">✍️</div>
                <div class="opt-body">
                  <div class="opt-name">Signature required</div>
                  <div class="opt-desc">An adult must sign on delivery. More secure for higher-value orders.</div>
                </div>
              </label>
              <label class="delivery-option">
                <input type="radio" name="deliveryMethod" value="hold-at-location"/>
                <div class="opt-icon" aria-hidden="true">🏪</div>
                <div class="opt-body">
                  <div class="opt-name">Hold at carrier location</div>
                  <div class="opt-desc">We'll route the package to a nearby carrier facility for in-person pickup.</div>
                </div>
              </label>
            </div>
          </fieldset>

          <label class="block-field">
            <span>Delivery instructions (optional)</span>
            <textarea name="deliveryInstructions" rows="3" maxlength="240" placeholder="e.g. Gate code 1234. Leave by side garage door."></textarea>
            <small class="field-hint">Up to 240 characters. Shared with the carrier on the shipping label.</small>
          </label>

          <label class="check-row">
            <input type="checkbox" name="smsNotify"/>
            <span>Text me tracking updates at the phone number above (US carrier rates may apply).</span>
          </label>

          <div class="step-actions">
            <button class="btn btn-outline" type="button" data-prev="2">Back</button>
            <button class="btn btn-accent btn-lg" type="button" data-next="4">Continue to Payment</button>
          </div>
        </section>

        <!-- STEP 4 -->
        <section class="checkout-step" data-step="4">
          <header class="step-head">
            <span class="step-badge">4</span>
            <div>
              <h2>Payment</h2>
              <p class="step-sub">Validated in the browser. Your card is never transmitted in this demo.</p>
            </div>
          </header>
          <div class="form-grid">
            <label class="span-2"><span>Name on Card <em>*</em></span><input type="text" name="cardName" required autocomplete="cc-name" data-validate="name" placeholder="Jane Doe"/><small class="field-error" data-error-for="cardName"></small></label>
            <label class="span-2"><span>Card Number <em>*</em></span>
              <div class="card-row">
                <input type="text" name="cardNumber" required inputmode="numeric" autocomplete="cc-number" placeholder="1234 5678 9012 3456" maxlength="23" data-validate="cardNumber"/>
                <span class="card-brand-icon" id="card-brand">CARD</span>
              </div>
              <small class="field-error" data-error-for="cardNumber"></small>
            </label>
            <label><span>Expiry (MM/YY) <em>*</em></span><input type="text" name="cardExpiry" required placeholder="08/29" maxlength="5" autocomplete="cc-exp" inputmode="numeric" data-validate="cardExpiry"/><small class="field-error" data-error-for="cardExpiry"></small></label>
            <label><span>CVV <em>*</em></span><input type="text" name="cardCvv" required maxlength="4" autocomplete="cc-csc" inputmode="numeric" data-validate="cardCvv" placeholder="123"/><small class="field-error" data-error-for="cardCvv"></small></label>
          </div>
          <p class="disclosure">This is a demonstration storefront. Form data is validated locally and stored in your browser only — no card information is transmitted to any server.</p>
          <div class="step-actions">
            <button class="btn btn-outline" type="button" data-prev="3">Back</button>
            <button class="btn btn-accent btn-lg" type="button" data-next="5">Continue to Review</button>
          </div>
        </section>

        <!-- STEP 5 -->
        <section class="checkout-step" data-step="5">
          <header class="step-head">
            <span class="step-badge">5</span>
            <div>
              <h2>Review &amp; Place Order</h2>
              <p class="step-sub">Confirm everything looks right before placing your order.</p>
            </div>
          </header>
          <div class="review-section">
            <h3>Contact <a href="#" data-edit="1">Edit</a></h3>
            <p id="rev-contact"></p>
          </div>
          <div class="review-section">
            <h3>Shipping Address <a href="#" data-edit="2">Edit</a></h3>
            <p id="rev-address"></p>
          </div>
          <div class="review-section">
            <h3>Delivery <a href="#" data-edit="3">Edit</a></h3>
            <p id="rev-delivery"></p>
          </div>
          <div class="review-section">
            <h3>Payment <a href="#" data-edit="4">Edit</a></h3>
            <p id="rev-payment"></p>
          </div>
          <div class="review-section">
            <h3>Order Items</h3>
            <ul id="rev-items"></ul>
          </div>
          <p class="disclosure">By placing your order, you agree to our <a href="/terms-of-service.html">Terms of Service</a>, <a href="/privacy-policy.html">Privacy Policy</a>, and <a href="/return-policy.html">Return Policy</a>.</p>
          <div class="step-actions">
            <button class="btn btn-outline" type="button" data-prev="4">Back</button>
            <button class="btn btn-accent btn-lg" type="button" id="place-order">Place Order</button>
          </div>
        </section>
      </form>

      <aside class="cart-summary checkout-summary" id="checkout-summary">
        <h3>Order Summary</h3>
        <div id="checkout-items" class="co-items"></div>
        <div class="co-empty" id="co-empty" hidden>Your cart is empty. <a href="/shop.html">Add a printer</a> to continue.</div>
        <div class="free-ship-pill" aria-hidden="true">
          <span>🚚</span>
          <span>Free standard shipping included</span>
        </div>
        <div class="co-totals">
          <div class="row"><span>Subtotal</span><strong id="co-subtotal">$0.00</strong></div>
          <div class="row"><span>Shipping</span><strong id="co-shipping" class="co-free">FREE</strong></div>
          <div class="row"><span>Tax (8%)</span><strong id="co-tax">$0.00</strong></div>
          <div class="row total"><span>Total</span><strong id="co-total">$0.00</strong></div>
        </div>
        <p class="co-fineprint">Taxes calculated at 8% for demo purposes. Real sales tax depends on your shipping state.</p>
      </aside>
    </div>
  </div>
</section>
`;
  return shell({
    title: "Secure Checkout — TopInkjet",
    description: "Complete your TopInkjet order with our secure 5-step checkout. Free standard US shipping on every order.",
    canonical: "/checkout.html",
    body,
    extraCss: `<link rel="stylesheet" href="/assets/css/checkout.css?v=3"/>`,
    extraJs: `<script src="/assets/js/avs.js?v=3" defer></script><script src="/assets/js/checkout.js?v=3" defer></script>`,
  });
}

function pageOrderConfirmation() {
  const body = `
${breadcrumbs([{ label: "Home", href: "/" }, { label: "Order Confirmation" }])}
<section class="section">
  <div class="container narrow">
    <div class="confirm-card">
      <div class="confirm-check">✓</div>
      <h1>Thank you for your order!</h1>
      <p class="lead">Order <strong id="order-number">TI-XXXXXXXX</strong></p>
      <p>An order confirmation has been sent to your email.</p>
    </div>
    <div class="confirm-grid">
      <div class="card">
        <h3>Shipping To</h3>
        <p id="confirm-name"></p>
        <p id="confirm-address"></p>
        <p id="confirm-email"></p>
      </div>
      <div class="card">
        <h3>Delivery</h3>
        <div id="confirm-delivery" class="confirm-delivery"></div>
      </div>
      <div class="card span-2">
        <h3>Order Details</h3>
        <ul id="confirm-items"></ul>
        <hr/>
        <div class="row"><span>Subtotal</span><strong id="confirm-subtotal">$0.00</strong></div>
        <div class="row"><span>Shipping</span><strong id="confirm-shipping" class="co-free">FREE</strong></div>
        <div class="row"><span>Tax</span><strong id="confirm-tax">$0.00</strong></div>
        <div class="row total"><span>Total</span><strong id="confirm-total">$0.00</strong></div>
      </div>
    </div>
    <div class="confirm-cta">
      <a class="btn btn-accent btn-lg" href="/shop.html">Continue Shopping</a>
      <a class="btn btn-outline" href="/return-policy.html">View Return Policy</a>
      <a class="btn btn-outline" href="/contact.html">Contact Support</a>
    </div>
  </div>
</section>
`;
  return shell({
    title: "Order Confirmation — TopInkjet",
    description: "Your order has been received. Thank you for shopping with TopInkjet.",
    canonical: "/order-confirmation.html",
    body,
    extraCss: `<link rel="stylesheet" href="/assets/css/checkout.css?v=3"/>`,
    extraJs: `<script src="/assets/js/order-confirmation.js?v=3" defer></script>`,
  });
}

// ----- Account pages -----
function pageSignIn() {
  const body = `
${breadcrumbs([{ label: "Home", href: "/" }, { label: "Sign In" }])}
<section class="section">
  <div class="container narrowest auth-card">
    <h1>Sign In</h1>
    <p class="lead">Sign in to view past orders and saved addresses. Sign-in is optional — guest checkout works without an account.</p>
    <form id="signin-form" novalidate>
      <label><span>Email <em>*</em></span><input type="email" name="email" required autocomplete="email"/></label>
      <label><span>Password <em>*</em></span><input type="password" name="password" required autocomplete="current-password"/></label>
      <button class="btn btn-accent btn-block btn-lg" type="submit">Sign In</button>
    </form>
    <p class="auth-alt">No account yet? <a href="/account/sign-up.html">Create an account</a></p>
    <p><a href="/shop.html">← Continue as a guest</a></p>
  </div>
</section>
`;
  return shell({
    title: "Sign In — TopInkjet",
    description: "Sign in to your TopInkjet account to view orders and manage your profile.",
    canonical: "/account/sign-in.html",
    body,
    extraJs: "",
  });
}

function pageSignUp() {
  const body = `
${breadcrumbs([{ label: "Home", href: "/" }, { label: "Create Account" }])}
<section class="section">
  <div class="container narrowest auth-card">
    <h1>Create Your Account</h1>
    <p class="lead">It's free, takes 30 seconds, and lets us save your shipping address for next time.</p>
    <form id="signup-form" novalidate>
      <label><span>Full Name <em>*</em></span><input type="text" name="name" required autocomplete="name"/></label>
      <label><span>Email <em>*</em></span><input type="email" name="email" required autocomplete="email"/></label>
      <label><span>Password (8+ chars) <em>*</em></span><input type="password" name="password" required minlength="8" autocomplete="new-password"/></label>
      <button class="btn btn-accent btn-block btn-lg" type="submit">Create Account</button>
    </form>
    <p class="auth-alt">Already have an account? <a href="/account/sign-in.html">Sign in</a></p>
  </div>
</section>
`;
  return shell({
    title: "Create Account — TopInkjet",
    description: "Create a TopInkjet account to track your orders and save your shipping addresses.",
    canonical: "/account/sign-up.html",
    body,
    extraJs: "",
  });
}

function pageDashboard() {
  const body = `
${breadcrumbs([{ label: "Home", href: "/" }, { label: "Account Dashboard" }])}
<section class="section">
  <div class="container">
    <h1>My Account</h1>
    <div id="dashboard-not-signed-in" class="empty-state">
      <h2>You're not signed in.</h2>
      <p><a class="btn btn-accent" href="/account/sign-in.html">Sign In</a> or <a class="btn btn-outline" href="/account/sign-up.html">Create Account</a></p>
    </div>
    <div id="dashboard-signed-in" hidden>
      <h2>Welcome back, <span id="dash-name"></span></h2>
      <p>Email: <span id="dash-email"></span></p>
      <p><button class="btn btn-outline" id="signout-btn">Sign out</button></p>
      <h3>Order History</h3>
      <div id="order-history"></div>
    </div>
  </div>
</section>
`;
  return shell({
    title: "Account Dashboard — TopInkjet",
    description: "View your TopInkjet order history, saved addresses, and account settings.",
    canonical: "/account/dashboard.html",
    body,
    extraJs: "",
  });
}

// ----- Static info pages: about, contact, faq -----
function pageAbout() {
  const body = `
${breadcrumbs([{ label: "Home", href: "/" }, { label: "About" }])}
<section class="section">
  <div class="container narrow">
    <span class="eyebrow">About TopInkjet</span>
    <h1>A focused inkjet store, built for US buyers.</h1>
    <p class="lead">We started TopInkjet in 2019 because buying a printer had quietly become miserable. Endless model numbers, bait-and-switch pricing, and websites that hid the only specs that actually mattered. We thought small-business buyers, parents, and home-office workers deserved a simpler, more honest place to shop.</p>
    <p>TopInkjet is an independent US retailer that carries a tightly focused catalog of office and home inkjet printers. We don't list every printer ever made — we keep the lineup small so it stays easy to compare, and we back every model with attentive US-based customer service.</p>
    <h2>What we believe</h2>
    <p>Three principles guide every decision we make:</p>
    <ul>
      <li><strong>Real specs, real photos.</strong> We list every product with the manufacturer's actual specifications and the actual product images. No exaggeration, no stock photos that don't match what's in the box.</li>
      <li><strong>Honest pricing.</strong> Free standard shipping is included on every order, and we never raise the price you see at checkout. No surprise "shipping protection" bumps. No mandatory upsells.</li>
      <li><strong>Attentive service.</strong> If you call or email, you reach someone who actually knows the products. Not a bot. Not an offshore call center reading scripts.</li>
    </ul>
    <h2>Who we serve</h2>
    <p>Our customers are split roughly in half: small offices and home offices that need a workhorse for daily document work, and households that want a reliable printer for homework, photos, and the occasional paperwork run. We've designed our two main categories — Office Inkjet and Home Inkjet — to make finding the right printer painless for either group.</p>
    <h2>How we choose what to sell</h2>
    <p>Every printer in our lineup has been evaluated against four criteria: real-world reliability, total cost of ownership, customer support reputation, and how well the on-paper specs match real performance. We're particularly fans of the HP OfficeJet Pro and Smart Tank lines because they consistently score well on all four.</p>
    <p>If you'd like a personal recommendation, our <a href="/contact.html">support team</a> is happy to help. Tell us what you print, how often, and what you'd like to spend, and we'll point you at one of the two or three models that actually fit.</p>
    <h2>How we ship</h2>
    <p>Every order ships from our US warehouse via free Standard Ground Shipping with UPS or FedEx and typically arrives in 3–5 business days inside the contiguous United States. We also deliver to Alaska, Hawaii, US territories, and APO/FPO/DPO addresses with extended transit times — see our <a href="/shipping-policy.html">Shipping Policy</a> for the full schedule. We do not currently ship internationally and we do not offer paid expedited or overnight upgrades — ground shipping is included free with every order.</p>
    <h2>Get in touch</h2>
    <p>You can reach us at <a href="mailto:${BIZ.email}">${BIZ.email}</a>, by phone at <a href="tel:${BIZ.phone.replace(/[^0-9+]/g,"")}">${BIZ.phone}</a>, or through the <a href="/contact.html">contact form</a>. We answer every message Monday through Friday during business hours.</p>
  </div>
</section>
`;
  return shell({
    title: "About TopInkjet — Curated US Inkjet Printer Retailer",
    description: "TopInkjet is an independent US retailer focused on a curated lineup of office and home inkjet printers.",
    canonical: "/about.html",
    body,
    active: "about",
  });
}

function pageContact() {
  const body = `
${breadcrumbs([{ label: "Home", href: "/" }, { label: "Contact" }])}
<section class="section">
  <div class="container contact-grid">
    <div>
      <span class="eyebrow">Contact TopInkjet</span>
      <h1>We're here to help.</h1>
      <p class="lead">Questions about a product, an order, or a return? Drop us a line and a member of our team will reply within one business day.</p>
      <h3>Email</h3>
      <p><a href="mailto:${BIZ.email}">${BIZ.email}</a></p>
      <h3>Phone</h3>
      <p><a href="tel:${BIZ.phone.replace(/[^0-9+]/g,"")}">${BIZ.phone}</a></p>
      <h3>Hours</h3>
      <p>${BIZ.hours}</p>
      <h3>Mailing Address</h3>
      <p>${BIZ.address.street}<br/>${BIZ.address.city}, ${BIZ.address.state} ${BIZ.address.zip}<br/>${BIZ.address.country}</p>
    </div>
    <form id="contact-form" class="contact-form" novalidate>
      <h2>Send us a message</h2>
      <label><span>Name <em>*</em></span><input type="text" name="name" required/></label>
      <label><span>Email <em>*</em></span><input type="email" name="email" required/></label>
      <label><span>Subject <em>*</em></span><input type="text" name="subject" required/></label>
      <label><span>Message <em>*</em></span><textarea name="message" rows="5" required></textarea></label>
      <button class="btn btn-accent btn-lg" type="submit">Send Message</button>
      <p class="form-msg" id="contact-msg" hidden>Thanks — we'll reply within one business day.</p>
    </form>
  </div>
</section>
`;
  return shell({
    title: "Contact TopInkjet — Email, Phone & Mailing Address",
    description: "Contact TopInkjet customer support by email, phone, or our online form. US-based human support, weekdays 9–6 Central.",
    canonical: "/contact.html",
    body,
    active: "contact",
    extraJs: `<script src="/assets/js/contact.js" defer></script>`,
  });
}

function pageFaq() {
  const qa = [
    ["Do you ship internationally?", "TopInkjet ships within the United States only — all 50 states, Washington D.C., and APO/FPO/DPO addresses. We do not currently ship to Canada, Mexico, or any international destination."],
    ["When will my order ship?", "Most orders are packed and handed to the carrier within 1–2 business days from our US warehouse. Orders placed on weekends or US federal holidays begin processing the next business day. You'll receive a tracking email as soon as your printer ships."],
    ["How long does delivery take?", "Standard ground shipping arrives in 3–5 business days, free on every order. Delivery times exclude the day of shipment, weekends, and US federal holidays. Most orders are packed and handed to the carrier within 1–2 business days of order placement."],
    ["What carriers do you use?", "We ship via UPS Ground, UPS 2-Day Air, UPS Next Day Air, FedEx Ground, FedEx 2Day, and FedEx Standard Overnight depending on package size and destination. You'll receive a tracking number by email when your order ships."],
    ["Is shipping really free?", "Yes. Every order ships free via Standard Ground shipping anywhere in the United States — all 50 states, Washington D.C., US territories, and APO/FPO/DPO addresses — with no minimum spend required. Transit times to Alaska, Hawaii, US territories, and APO/FPO/DPO are typically extended; see the Shipping Policy for the full schedule."],
    ["Can I return a printer if I don't love it?", "Absolutely. You have 30 days from the date of delivery to return any printer in resalable condition with original packaging and accessories for a full refund of the product price. See our <a href=\"/return-policy.html\">Return Policy</a> for the full process."],
    ["Do you offer a warranty?", "Yes — every printer we sell carries the full manufacturer's warranty (typically 1 year limited hardware warranty for HP printers). For warranty service, contact the manufacturer directly using the documentation included in the box."],
    ["Do I have to create an account to check out?", "No. Guest checkout is the default and works without ever creating an account. Creating an account is optional and only saves your shipping address and order history for next time."],
    ["What payment methods do you accept?", "We accept Visa, Mastercard, American Express, Discover, Apple Pay, and Google Pay. All payments are processed through encrypted, PCI-compliant infrastructure."],
    ["Do you charge sales tax?", "Yes. As a US retailer, we are required to collect sales tax in states where we have nexus. Tax is calculated at checkout based on your shipping address."],
    ["Can I cancel my order?", "If your order has not yet shipped, contact us right away at <a href=\"mailto:${BIZ.email}\">${BIZ.email}</a> and we'll cancel it. Once an order has shipped, you'll need to follow the return process after delivery."],
    ["Do you price match competitors?", "We don't currently offer formal price matching, but if you find a major US retailer offering the same product at a lower advertised price, email us and we'll do our best to make it right."],
    ["What if my printer arrives damaged?", "If your shipment arrives with visible carrier damage, photograph the box and contents and email us within 48 hours. We'll arrange a free replacement and a return label for the damaged unit."],
    ["How will I know when my order ships?", "We'll send a shipment confirmation email with the carrier name and tracking number as soon as your printer leaves our warehouse. The link in that email is the easiest way to follow your delivery."],
    ["Do you sell ink cartridges or paper?", "Not at this time. We focus exclusively on printer hardware. For ink, we recommend purchasing genuine OEM cartridges directly from the manufacturer or an authorized retailer."],
  ];
  const body = `
${breadcrumbs([{ label: "Home", href: "/" }, { label: "FAQ" }])}
<section class="section">
  <div class="container narrow">
    <span class="eyebrow">Frequently Asked Questions</span>
    <h1>FAQ</h1>
    <p class="lead">Quick answers to the most common questions about ordering, shipping, returns, and accounts.</p>
    <div class="faq-list">
      ${qa.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${a}</p></details>`).join("")}
    </div>
  </div>
</section>
`;
  return shell({
    title: "FAQ — Shipping, Returns, Payment | TopInkjet",
    description: "Answers to the most common questions about TopInkjet ordering, shipping times, returns, payments, accounts, and warranty.",
    canonical: "/faq.html",
    body,
  });
}

// ----- Legal pages — long-form content (600+ words each) -----
function legalShell(title, description, slug, body) {
  return shell({
    title: `${title} — TopInkjet`,
    description,
    canonical: "/" + slug + ".html",
    body: `
${breadcrumbs([{ label: "Home", href: "/" }, { label: title }])}
<section class="section">
  <div class="container narrow legal-body">
    <h1>${title}</h1>
    <p class="legal-meta">Last updated: January 2026</p>
    ${body}
  </div>
</section>
`,
  });
}

function pagePrivacy() {
  return legalShell(
    "Privacy Policy",
    "How TopInkjet collects, uses, and protects your personal information.",
    "privacy-policy",
    `
<p>TopInkjet ("we", "us", "our") respects your privacy. This Privacy Policy explains what information we collect when you visit topinkjet.com or place an order with us, how we use that information, who we share it with, and the choices you have. By using our site, you agree to the practices described below.</p>

<h2>Information We Collect</h2>
<p>We collect information that you provide directly when you create an account, place an order, or contact support. This includes your name, email address, mailing and billing addresses, phone number, payment information, and any messages you send to us. When you place an order, your card payment is processed by an encrypted PCI-compliant payment gateway and we do not store full card numbers on our servers.</p>
<p>We also collect information automatically when you visit the site, including your IP address, browser type, operating system, the pages you view, the time you spent on each page, and the URL that referred you. This information is collected through standard web logs and through small cookies described in our <a href="/cookie-policy.html">Cookie Policy</a>.</p>

<h2>How We Use Your Information</h2>
<p>We use the information we collect to fulfill your orders, ship the products you purchased, send order confirmations and shipping updates, respond to support inquiries, provide and improve the site and our services, prevent fraud, comply with our legal obligations, and — only if you have opted in — send you marketing communications you can unsubscribe from at any time.</p>

<h2>How We Share Your Information</h2>
<p>We share information only with the service providers we need to operate our business: payment processors that handle your card transaction, shipping carriers that deliver your order, email service providers that send transactional and (if you've opted in) marketing emails, fraud-prevention vendors, and analytics providers used to measure how the site performs. These providers are contractually required to use your information only to perform services for us and to keep it secure.</p>
<p>We do not sell your personal information for monetary consideration. We do not share your personal information with third parties for their own marketing purposes. If you are a California resident and would like to exercise your right to opt out of any sharing for cross-context behavioral advertising, please visit our <a href="/do-not-sell-my-personal-info.html">Do Not Sell or Share My Personal Information</a> page.</p>

<h2>Data Retention</h2>
<p>We retain your account information for as long as your account is active. We retain order records for up to seven years to comply with US tax and accounting requirements. You may request deletion of your account at any time by emailing <a href="mailto:${BIZ.email}">${BIZ.email}</a>. We will remove personal information promptly except where retention is required by law.</p>

<h2>Security</h2>
<p>We protect your information with industry-standard administrative, technical, and physical safeguards. All data transmitted to and from topinkjet.com is encrypted in transit using TLS 1.2 or higher. Access to customer information internally is restricted to employees who need it to perform their job. No system is perfectly secure, however, and we cannot guarantee absolute security.</p>

<h2>Your Rights and Choices</h2>
<p>You have the right to access, correct, and delete your personal information. You may also opt out of marketing emails at any time using the unsubscribe link in any marketing message. California, Colorado, Connecticut, Utah, and Virginia residents have additional rights under their state privacy laws, including the right to know what personal information we have collected, the right to delete it, and the right to opt out of certain sharing. Please email <a href="mailto:${BIZ.email}">${BIZ.email}</a> to exercise any of these rights.</p>

<h2>Children</h2>
<p>TopInkjet does not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us and we will delete it.</p>

<h2>Changes to This Policy</h2>
<p>We may update this Privacy Policy from time to time. The "Last updated" date at the top of this page tells you when the most recent revision was published. Material changes will be highlighted on the homepage for at least 30 days.</p>

<h2>Contact Us</h2>
<p>Questions about this Privacy Policy or our privacy practices? Email <a href="mailto:${BIZ.email}">${BIZ.email}</a>, call <a href="tel:${BIZ.phone.replace(/[^0-9+]/g,"")}">${BIZ.phone}</a>, or write to us at ${BIZ.address.street}, ${BIZ.address.city}, ${BIZ.address.state} ${BIZ.address.zip}, USA.</p>
`
  );
}

function pageTerms() {
  return legalShell(
    "Terms of Service",
    "The legal agreement between you and TopInkjet for using topinkjet.com and ordering products.",
    "terms-of-service",
    `
<p>These Terms of Service ("Terms") govern your use of topinkjet.com (the "Site") and any orders you place through the Site. By accessing the Site or placing an order, you agree to be bound by these Terms. If you do not agree, please do not use the Site.</p>

<h2>1. Eligibility</h2>
<p>You must be at least 18 years old and a resident of the United States to place an order. By placing an order you confirm that the shipping and billing addresses you provide are accurate and that you are authorized to use the payment method you submit.</p>

<h2>2. Products and Pricing</h2>
<p>We make every reasonable effort to display accurate product descriptions, images, specifications, and prices. Despite our efforts, errors occasionally occur. We reserve the right to correct errors and to update prices, specifications, and product availability at any time without prior notice. Prices on the Site are in United States dollars (USD) and exclude sales tax, which is calculated at checkout based on your shipping address. If a product you ordered is mispriced, we will contact you before shipping and either offer to honor the price, refund the difference, or cancel the order.</p>

<h2>3. Orders and Acceptance</h2>
<p>Your submission of an order through the Site is an offer to purchase. Our acceptance of your offer occurs when we send you an order confirmation email and ship the product. Until that time, we may decline or cancel any order for any reason, including limits on quantities purchased, suspected fraud, or inaccurate billing information.</p>

<h2>4. Payment</h2>
<p>We accept the payment methods listed on the checkout page. By providing a payment method, you authorize us (and our payment processor) to charge the full amount of your order, including taxes and shipping. If your payment cannot be processed, we will cancel your order.</p>

<h2>5. Shipping and Risk of Loss</h2>
<p>Shipping terms, costs, and estimated delivery times are described in our <a href="/shipping-policy.html">Shipping Policy</a>. We ship within the United States only. Title and risk of loss to products pass to you when the carrier takes possession of the product at our warehouse.</p>

<h2>6. Returns and Refunds</h2>
<p>You may return most products within 30 days of delivery in accordance with our <a href="/return-policy.html">Return Policy</a> and receive a refund as described in our <a href="/refund-policy.html">Refund Policy</a>. Custom or final-sale items, where indicated, are not eligible for return.</p>

<h2>7. Account Responsibility</h2>
<p>If you create an account, you are responsible for maintaining the confidentiality of your password and for all activity that occurs under your account. You agree to notify us immediately at <a href="mailto:${BIZ.email}">${BIZ.email}</a> of any unauthorized use.</p>

<h2>8. Acceptable Use</h2>
<p>You agree not to: use the Site for any unlawful purpose; attempt to gain unauthorized access to any portion of the Site or our systems; interfere with the Site's operation; introduce viruses, trojans, or harmful material; use automated tools to scrape or copy product information for commercial use; or impersonate any person or entity.</p>

<h2>9. Intellectual Property</h2>
<p>All content on the Site — including text, graphics, logos, button icons, images, audio clips, and software — is owned by TopInkjet or its licensors and is protected by United States and international intellectual property laws. You may not reproduce, modify, distribute, or commercially exploit any portion of the Site without our prior written permission. The brand names and logos of products we sell are the property of their respective owners and are used for descriptive purposes only.</p>

<h2>10. Disclaimers</h2>
<p>The Site and the products are provided on an "as is" and "as available" basis. To the fullest extent permitted by law, TopInkjet disclaims all warranties, express or implied, including the implied warranties of merchantability and fitness for a particular purpose. Manufacturer warranties on products we sell remain in effect according to the manufacturer's terms.</p>

<h2>11. Limitation of Liability</h2>
<p>To the maximum extent permitted by law, TopInkjet shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of or inability to use the Site or the products. Our total liability to you for any claim arising out of or related to the Site or the products shall not exceed the amount you paid for the product giving rise to the claim.</p>

<h2>12. Governing Law and Disputes</h2>
<p>These Terms are governed by the laws of the State of Texas, without regard to conflict-of-law principles. Any dispute arising out of or related to these Terms or the Site shall be resolved exclusively in the state or federal courts located in Travis County, Texas, and you consent to the personal jurisdiction of those courts.</p>

<h2>13. Changes to These Terms</h2>
<p>We may update these Terms from time to time. Material changes will take effect 30 days after we post them. Your continued use of the Site after the effective date constitutes acceptance of the revised Terms.</p>

<h2>14. Contact</h2>
<p>Questions about these Terms? Email <a href="mailto:${BIZ.email}">${BIZ.email}</a> or write to us at ${BIZ.address.street}, ${BIZ.address.city}, ${BIZ.address.state} ${BIZ.address.zip}.</p>
`
  );
}

function pageReturn() {
  return legalShell(
    "Return Policy",
    "TopInkjet's 30-day return policy for printers and accessories. Resalable condition required. RMA process explained.",
    "return-policy",
    `
<p>We want every TopInkjet customer to love their printer. If for any reason you don't, you have 30 days from the delivery date to start a return. This policy explains how returns work, what's eligible, and how to begin the process.</p>

<h2>30-Day Return Window</h2>
<p>Most products purchased on topinkjet.com are eligible for return within 30 days of the delivery date shown by the shipping carrier. After 30 days, items are no longer eligible for a return through TopInkjet. If your printer develops a defect after the 30-day window, please contact the manufacturer directly to use the manufacturer's warranty.</p>

<h2>Condition Requirements</h2>
<p>To qualify for a refund, the returned product must be:</p>
<ul>
  <li><strong>In resalable condition</strong> — clean, undamaged, and free from heavy wear.</li>
  <li><strong>In original packaging</strong> — with all original boxes, foam, plastic bags, and protective inserts.</li>
  <li><strong>With all accessories included</strong> — power cable, ink cartridges (whether unused or partially used), USB cable if shipped, setup guide, warranty card, and any other items included from the manufacturer.</li>
</ul>
<p>Printers returned with missing accessories, damage from improper packaging on the return trip, or in non-resalable condition will be subject to a partial refund or, in some cases, refusal of the return. We'll always communicate with you before any deduction is taken.</p>

<h2>Items Not Eligible for Return</h2>
<p>The following items are not eligible for return: opened ink supplies (separate from the original printer purchase), digital downloads, gift cards, and any item explicitly marked "Final Sale" on the product page. Customized or special-order printers, where applicable, are also non-returnable.</p>

<h2>How to Start a Return (RMA Process)</h2>
<ol>
  <li><strong>Email us at <a href="mailto:${BIZ.email}">${BIZ.email}</a></strong> within 30 days of delivery. Include your order number, the product you'd like to return, and the reason for the return.</li>
  <li><strong>Receive your Return Merchandise Authorization (RMA).</strong> We'll respond within one business day with an RMA number and detailed return instructions.</li>
  <li><strong>Pack the printer.</strong> Use the original packaging. Include all accessories. Place the RMA number clearly on the outside of the box and inside the box.</li>
  <li><strong>Ship the package.</strong> See "Who Pays Return Shipping" below.</li>
  <li><strong>We inspect and refund.</strong> When we receive the printer, we inspect it within 3 business days and process your refund within 5 additional business days. See our <a href="/refund-policy.html">Refund Policy</a> for refund timing details.</li>
</ol>

<h2>Who Pays Return Shipping</h2>
<p>If you are returning a printer because you changed your mind, you are responsible for the return shipping cost. We recommend a trackable shipping method with insurance equal to the value of the printer.</p>
<p>If you are returning a printer because it arrived damaged, defective, or because we shipped the wrong product, TopInkjet will provide a prepaid return label and cover all return shipping costs. Notify us within 48 hours of delivery to qualify for prepaid return shipping on damaged shipments.</p>

<h2>Refunds</h2>
<p>We refund the full price of the product to your original payment method. The original outbound shipping cost is non-refundable except in the case of a damaged, defective, or incorrectly shipped product, in which case it is also refunded. See the <a href="/refund-policy.html">Refund Policy</a> for full refund details.</p>

<h2>Exchanges</h2>
<p>We do not currently process direct exchanges. To swap a printer for a different model, please return the original printer for a refund and place a new order for the model you want. This way you have the new printer in hand before the refund is finalized.</p>

<h2>International Returns</h2>
<p>TopInkjet ships within the United States only. If a product was shipped to a US address and you have moved internationally, you are responsible for returning the product to our US warehouse at your own expense; we will refund the product price upon receipt and inspection.</p>

<h2>Damaged or Defective on Arrival</h2>
<p>If your shipment arrives with carrier damage to the box or product, photograph the damage and contact us within 48 hours at <a href="mailto:${BIZ.email}">${BIZ.email}</a>. We'll arrange a prepaid return label and ship a replacement immediately, no questions asked.</p>

<h2>Questions</h2>
<p>If you have any question about your specific return, email <a href="mailto:${BIZ.email}">${BIZ.email}</a> or call <a href="tel:${BIZ.phone.replace(/[^0-9+]/g,"")}">${BIZ.phone}</a> during business hours (${BIZ.hours}). We will respond within one business day.</p>
`
  );
}

function pageRefund() {
  return legalShell(
    "Refund Policy",
    "TopInkjet refund timing and methods. How long refunds take, original payment methods, and partial refunds.",
    "refund-policy",
    `
<p>This Refund Policy explains how TopInkjet processes refunds for returned products and orders that we cannot fulfill. It complements our <a href="/return-policy.html">Return Policy</a>, which explains the return process itself.</p>

<h2>When Refunds Are Issued</h2>
<p>We issue refunds in the following situations:</p>
<ul>
  <li>You returned a product within the 30-day return window in accordance with our Return Policy and the product passed our resalability inspection.</li>
  <li>You received a damaged, defective, or incorrect product and we have confirmed the issue.</li>
  <li>You cancelled an order before it shipped.</li>
  <li>We were unable to fulfill your order (for example, due to a stocking error or pricing mistake) and chose to cancel rather than ship.</li>
  <li>You were charged in error or charged more than the amount displayed at checkout.</li>
</ul>

<h2>Refund Method</h2>
<p>All refunds are issued to the original payment method used for the order. We cannot refund to a different card or to a different person. If your original card has expired, contact your card issuer — most issuers will forward the refund to your replacement card automatically.</p>

<h2>Refund Timing</h2>
<p>Once we receive your returned product and confirm it meets the conditions in the <a href="/return-policy.html">Return Policy</a>, our team inspects it within 3 business days. Your refund is then submitted to your card issuer within 5 additional business days. Total elapsed time from when we receive your return to when you see the refund: typically 5 to 10 business days.</p>
<p>For order cancellations and billing corrections (where no return is required), refunds are issued within 2 business days of confirmation.</p>
<p>Once we submit a refund, your card issuer typically posts it to your account within 5 to 10 business days, although it occasionally takes one full billing cycle. If you don't see your refund after 10 business days from our refund email, please first check with your bank, then email us at <a href="mailto:${BIZ.email}">${BIZ.email}</a> and we will investigate.</p>

<h2>What We Refund</h2>
<p>For an eligible standard return (you changed your mind), we refund:</p>
<ul>
  <li>The full price you paid for the product.</li>
  <li>The full sales tax associated with the product.</li>
  <li>Outbound shipping: not applicable — every TopInkjet order ships free via Standard Ground Shipping, so there is no outbound shipping charge to refund.</li>
</ul>
<p>For a return due to damage, defect, or our shipping error, we refund 100% of the product price, all related sales tax, the original outbound shipping cost, and any return shipping cost you incurred.</p>

<h2>What We Do Not Refund</h2>
<p>We do not refund:</p>
<ul>
  <li>Original outbound shipping cost on standard returns where you simply changed your mind.</li>
  <li>Return shipping cost on standard returns (you are responsible for return shipping unless we made the error).</li>
  <li>Any deduction taken from a partial refund — see "Partial Refunds" below.</li>
</ul>

<h2>Partial Refunds</h2>
<p>In rare cases, we may issue a partial refund:</p>
<ul>
  <li>If accessories are missing from the returned package, we deduct the replacement cost of those accessories.</li>
  <li>If the returned printer shows obvious signs of use beyond what is required to evaluate the product, we may deduct a usage fee of up to 15% of the product price.</li>
  <li>If the original packaging is missing or so badly damaged that the printer cannot be resold as new, we may deduct a repackaging fee of up to 10% of the product price.</li>
</ul>
<p>We will always communicate with you before issuing a partial refund and explain the deduction. If you disagree, we'll work with you to find a reasonable solution.</p>

<h2>Refund of Promotional Credit</h2>
<p>If your original order used a promotional discount or store credit, that portion of the refund is returned as the same store credit, not as cash to your card.</p>

<h2>Lost-in-Transit Returns</h2>
<p>You are responsible for the safe return of the product to our warehouse. We strongly recommend using a trackable shipping method with insurance covering the value of the printer. If a returned package is lost in transit, you must work with the return carrier to file a lost-package claim. Until we receive and inspect the printer, we cannot issue a refund.</p>

<h2>Chargebacks and Disputes</h2>
<p>Before initiating a chargeback or payment dispute with your card issuer, please contact us at <a href="mailto:${BIZ.email}">${BIZ.email}</a>. Almost every refund issue can be resolved faster directly with our support team. Chargebacks initiated without first contacting us may delay refund processing while your bank investigates.</p>

<h2>Contact</h2>
<p>Questions? Email <a href="mailto:${BIZ.email}">${BIZ.email}</a> or call <a href="tel:${BIZ.phone.replace(/[^0-9+]/g,"")}">${BIZ.phone}</a> during business hours.</p>
`
  );
}

function pageShipping() {
  return legalShell(
    "Shipping Policy",
    "TopInkjet ships within the United States only — all 50 states, D.C., US territories, and APO/FPO/DPO — with free Standard Ground Shipping on every order. Processing times, carriers, and delivery preferences explained.",
    "shipping-policy",
    `
<p>This Shipping Policy explains where we ship, when your order will leave our warehouse, how long it takes to arrive, what it costs, and what to do if anything goes wrong in transit.</p>

<h2>Where We Ship</h2>
<p>TopInkjet ships within the United States only — to all 50 states, the District of Columbia, US territories (Puerto Rico, US Virgin Islands, Guam, American Samoa, and the Northern Mariana Islands), and APO/FPO/DPO military addresses. We do not currently ship to Canada, Mexico, or any other international destination.</p>

<h2>Order Processing</h2>
<p>Most orders are picked, packed, and handed to the carrier within 1–2 business days from our US warehouse, Monday through Friday. Orders placed on weekends or US federal holidays begin processing the next business day. You will receive a tracking email as soon as your printer ships.</p>
<p>If your order requires additional verification (for example, a billing address that does not match the card on file), we may delay shipment until we can confirm the order with you. We'll email you within one business day if this happens.</p>

<h2>Shipping Method, Cost, and Timing</h2>
<p>We currently offer one shipping option: <strong>Standard Ground Shipping</strong>, which is free on every order with no minimum spend. Estimated delivery times below are <em>in addition to</em> processing time and exclude weekends and US federal holidays. They are estimates from our carrier partners and are not guaranteed.</p>
<table class="spec-table">
  <thead><tr><th>Method</th><th>Estimated Delivery</th><th>Cost</th></tr></thead>
  <tbody>
    <tr><td>Standard Ground Shipping</td><td>3–5 business days</td><td>FREE on every order</td></tr>
  </tbody>
</table>
<p>Free Standard Ground Shipping is automatically applied at checkout to every order — there is no minimum spend, no membership required, and no surprise fees added later in the flow.</p>

<h2>Carriers</h2>
<p>We work with two primary carriers: UPS (Ground) and FedEx (Ground). The carrier used for your order depends on package size, weight, and destination. You will receive a shipment confirmation email containing your tracking number when your order leaves our warehouse.</p>

<h2>Delivery Preferences</h2>
<p>At checkout you can choose how the package should be handed over: leave at door (the default for most addresses), signature required (for added security), or hold at the carrier's nearest pickup location. You may also leave free-text delivery instructions for the driver and opt in to SMS tracking updates.</p>

<h2>Alaska, Hawaii, US Territories, and APO/FPO</h2>
<p>Free Standard Ground Shipping applies to Alaska, Hawaii, US Territories, and APO/FPO/DPO addresses, but transit times are typically extended:</p>
<ul>
  <li><strong>Alaska and Hawaii:</strong> add 2–4 business days to standard ground transit.</li>
  <li><strong>US Territories:</strong> add 5–10 business days; some routes use US Postal Service for the final leg.</li>
  <li><strong>APO/FPO/DPO:</strong> handed to the US Postal Service for military mail processing; transit time varies by destination and unit.</li>
</ul>

<h2>Address Accuracy</h2>
<p>Please double-check your shipping address at checkout. If you provide an incorrect or incomplete address and the carrier returns the package to us, we will reship at our cost the first time. If a second reship is required due to address issues, you will be responsible for the reshipment shipping cost.</p>

<h2>Tracking Your Order</h2>
<p>You'll receive a shipment confirmation email with the carrier name and tracking number as soon as your printer leaves our warehouse. Use the tracking link in that email to follow your package — it updates as soon as the carrier scans the label.</p>

<h2>Lost or Stolen Packages</h2>
<p>If a tracking page shows your order as delivered but you cannot find the package, please:</p>
<ol>
  <li>Wait 24 hours — carriers occasionally mark packages "delivered" before the actual delivery.</li>
  <li>Check with neighbors and around your property — packages are sometimes left at side or back doors.</li>
  <li>Contact the carrier directly with your tracking number to file a missing-package report.</li>
  <li>Email us at <a href="mailto:${BIZ.email}">${BIZ.email}</a> with your order number and any case number from the carrier. We will work with the carrier to resolve the issue and, where appropriate, ship a replacement.</li>
</ol>

<h2>Damaged or Lost in Transit</h2>
<p>If your package is lost in transit (no tracking updates for more than 7 business days) or arrives with carrier damage to the box or product, contact us within 48 hours of the expected delivery date at <a href="mailto:${BIZ.email}">${BIZ.email}</a>. We will work with the carrier to investigate and ship a replacement at no additional cost.</p>

<h2>P.O. Boxes</h2>
<p>For weight and size reasons, most printers cannot be shipped to P.O. boxes. Please use a street address.</p>

<h2>Sales Tax</h2>
<p>Sales tax is calculated at checkout based on your shipping address and applicable state and local rates. Our checkout uses a flat estimated rate of 8% for clarity; the actual rate charged to your card matches your local jurisdiction.</p>

<h2>Questions</h2>
<p>For any shipping question, email <a href="mailto:${BIZ.email}">${BIZ.email}</a> or call <a href="tel:${BIZ.phone.replace(/[^0-9+]/g,"")}">${BIZ.phone}</a> during business hours.</p>
`
  );
}

function pageCookie() {
  return legalShell(
    "Cookie Policy",
    "How TopInkjet uses cookies and similar technologies on topinkjet.com.",
    "cookie-policy",
    `
<p>This Cookie Policy explains what cookies are, what TopInkjet uses them for, and the choices you have. It complements our <a href="/privacy-policy.html">Privacy Policy</a>.</p>

<h2>What Are Cookies?</h2>
<p>Cookies are small text files placed on your device when you visit a website. They allow the site to remember information about your visit — things like your preferred language, your sign-in state, or items in your shopping cart — making the next visit easier. Cookies can also be used to measure how a website is performing and to make advertising more relevant.</p>

<h2>Cookies We Use</h2>
<p>We group the cookies we use into four categories. The cookie banner that appears on your first visit to topinkjet.com lets you choose which categories you allow.</p>
<h3>Strictly Necessary</h3>
<p>These cookies are required for the site to work. They enable your sign-in session, your shopping cart, your wishlist, your checkout flow, and your cookie preferences themselves. They cannot be turned off because the site would not function without them.</p>
<h3>Functional</h3>
<p>These cookies remember your preferences (such as recent products viewed and saved wishlist items) so the experience feels more personal next time. They are first-party cookies set by TopInkjet only.</p>
<h3>Performance / Analytics</h3>
<p>These cookies help us understand how visitors use the site — which pages are most popular, where people drop off in checkout, and how the site performs in different browsers. The data is aggregated and does not identify individual visitors. Examples include Google Analytics.</p>
<h3>Marketing / Advertising</h3>
<p>These cookies, set by us or by partner ad networks, are used to make ads more relevant to you on other sites you visit. They are off by default. If you allow them, our ad partners may receive a unique identifier and a list of pages you visited on topinkjet.com so they can show you printer-related advertising on other sites.</p>

<h2>Local Storage</h2>
<p>In addition to cookies, we use your browser's local storage to keep your shopping cart, wishlist, account session, and order history alive between visits. Local storage is private to your browser and is never transmitted automatically to our servers. If you clear your browser data, this information is removed.</p>

<h2>Your Choices</h2>
<p>You can change your cookie choices at any time by clearing your browser storage and revisiting topinkjet.com — the banner will reappear and you can pick a new preference. You can also block cookies entirely in your browser settings, but please note that blocking strictly necessary cookies will prevent core site features (cart, sign-in, checkout) from working.</p>
<p>Most modern browsers also support a "Do Not Track" or "Global Privacy Control" signal. Where applicable law requires, we honor those signals as opt-out requests for sale or sharing of personal information.</p>

<h2>Third-Party Cookies</h2>
<p>Some cookies are set by third parties we work with — for example, payment processors, analytics providers, and (if you have allowed marketing cookies) advertising partners. These third parties have their own privacy and cookie policies. We carefully select partners that meet our security and privacy standards.</p>

<h2>Updates</h2>
<p>We may update this Cookie Policy from time to time. The "Last updated" date at the top reflects the most recent change. Material changes will be highlighted on the homepage for at least 30 days.</p>

<h2>Contact</h2>
<p>Questions about cookies? Email <a href="mailto:${BIZ.email}">${BIZ.email}</a>.</p>
`
  );
}

function pageDoNotSell() {
  return legalShell(
    "Do Not Sell or Share My Personal Information",
    "Submit a request to opt out of any sale or sharing of your personal information.",
    "do-not-sell-my-personal-info",
    `
<p>This page explains your right to opt out of the "sale" or "sharing" (including for cross-context behavioral advertising) of your personal information under California, Colorado, Connecticut, Utah, Virginia, and other applicable US state privacy laws.</p>

<h2>What "Sale" and "Sharing" Mean</h2>
<p>Under these laws, "sale" generally means the disclosure of personal information to a third party for monetary or other valuable consideration. "Sharing" generally refers to disclosing personal information to a third party for cross-context behavioral advertising — that is, ads served to you on other sites based on your browsing of topinkjet.com.</p>
<p><strong>TopInkjet does not sell your personal information for monetary consideration.</strong> However, if you choose to allow Marketing/Advertising cookies in our cookie preferences, we may share device identifiers and limited browsing information with advertising partners for cross-context behavioral advertising. You can opt out at any time below.</p>

<h2>How to Opt Out</h2>
<p>You have three ways to opt out:</p>
<h3>1. Clear Marketing Cookies</h3>
<p>Open the cookie preferences modal by clearing your browser storage and reloading topinkjet.com, or by clicking "Manage Preferences" in the cookie banner. Make sure the "Marketing / Advertising" toggle is off and click Save Preferences.</p>
<h3>2. Use the Form Below</h3>
<p>Submit the form on this page. We will record your opt-out and apply it to your email address (and account, if you have one).</p>
<h3>3. Send the Global Privacy Control Signal</h3>
<p>If your browser supports the Global Privacy Control (GPC) signal, we will honor it as an opt-out request automatically.</p>

<h2>Authorized Agents</h2>
<p>You may designate an authorized agent to submit an opt-out request on your behalf. The agent must provide written authorization signed by you, and we may contact you to confirm.</p>

<h2>Verification</h2>
<p>For account holders, we verify the request through the email address on file. For non-account holders, we will use the email you supply on the form to confirm the request and apply the opt-out.</p>

<h2>Other Privacy Rights</h2>
<p>In addition to opting out of sale or sharing, applicable state laws give you the right to know what personal information we have collected, the right to delete it, and the right to correct it. Submit those requests to <a href="mailto:${BIZ.email}">${BIZ.email}</a> or use the form below with the appropriate request type selected.</p>

<h2>Submit Your Request</h2>
<form id="do-not-sell-form" class="contact-form" novalidate>
  <label><span>Full Name <em>*</em></span><input type="text" name="name" required/></label>
  <label><span>Email on file <em>*</em></span><input type="email" name="email" required/></label>
  <label><span>State of residence</span>
    <select name="state">
      <option value="">Select…</option>
      <option>California</option><option>Colorado</option><option>Connecticut</option>
      <option>Utah</option><option>Virginia</option><option>Other US state</option>
    </select>
  </label>
  <label><span>Request Type <em>*</em></span>
    <select name="reqType" required>
      <option value="opt-out">Opt out of sale / sharing</option>
      <option value="know">Right to know what data is collected</option>
      <option value="delete">Right to delete</option>
      <option value="correct">Right to correct</option>
    </select>
  </label>
  <label><span>Additional notes (optional)</span><textarea name="notes" rows="4"></textarea></label>
  <button class="btn btn-accent btn-lg" type="submit">Submit Request</button>
  <p class="form-msg" id="dns-msg" hidden>Thanks. We've recorded your request and will confirm by email within 15 days.</p>
</form>

<h2>Response Time</h2>
<p>We respond to opt-out requests as soon as practicable and at most within 15 business days as required by California law. Other requests (right to know, delete, correct) are handled within 45 days, with a possible 45-day extension if necessary.</p>

<h2>Contact</h2>
<p>Email <a href="mailto:${BIZ.email}">${BIZ.email}</a> or call <a href="tel:${BIZ.phone.replace(/[^0-9+]/g,"")}">${BIZ.phone}</a> with any privacy question.</p>
`
  );
}

function pageAccessibility() {
  return legalShell(
    "Accessibility Statement",
    "TopInkjet's commitment to a website that is usable by everyone, regardless of ability.",
    "accessibility",
    `
<p>TopInkjet is committed to making topinkjet.com usable by everyone, including people with disabilities. We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA published by the World Wide Web Consortium and to apply best practices for inclusive design throughout the site.</p>

<h2>What We've Done</h2>
<p>Our development and design team has built topinkjet.com with the following accessibility features in mind:</p>
<ul>
  <li><strong>Keyboard navigation:</strong> every interactive element on the site can be reached and operated using a standard keyboard. Skip links allow assistive-technology users to jump past repeated navigation.</li>
  <li><strong>Focus indicators:</strong> visible focus styles are applied to every focusable control so keyboard users can always tell where they are.</li>
  <li><strong>Semantic HTML:</strong> the site uses standard HTML elements (headings, landmarks, lists, buttons, links) so screen readers can announce structure correctly. Each page has exactly one H1 and a logical heading hierarchy.</li>
  <li><strong>Alternative text:</strong> every product image and content image includes descriptive alternative text. Decorative images are marked appropriately so they are not announced.</li>
  <li><strong>Color contrast:</strong> body text meets at least 4.5:1 contrast against its background; large text meets at least 3:1. Color is never used as the only means of conveying information.</li>
  <li><strong>Form labels and errors:</strong> every input has a visible label, and form validation messages are programmatically associated with their fields and announced to screen readers.</li>
  <li><strong>Resizable text:</strong> the site uses relative units so visitors can scale text up to 200% without loss of content or functionality.</li>
  <li><strong>Responsive design:</strong> the site adapts to phone, tablet, and desktop viewports and works at high zoom levels.</li>
  <li><strong>Motion:</strong> we minimize motion and respect the operating-system "reduce motion" preference.</li>
</ul>

<h2>Ongoing Effort</h2>
<p>Accessibility is a continuous process, not a one-time project. We test each new page and feature against WCAG 2.1 AA criteria using both automated tools and human review with a screen reader (VoiceOver and NVDA). We audit the entire site at least once a year.</p>

<h2>Known Limitations</h2>
<p>Despite our best efforts, some content on the site may not yet be fully accessible. Specifically:</p>
<ul>
  <li>A small number of older product images may have less descriptive alternative text than newer images. We update these as we identify them.</li>
  <li>Some PDF documents linked from policy pages may not be fully tagged for accessibility. If you encounter a PDF that's hard to use, contact us and we will provide an alternative format within 5 business days.</li>
</ul>

<h2>Assistive Technology Compatibility</h2>
<p>topinkjet.com is designed to work with the following assistive technologies:</p>
<ul>
  <li>Screen readers: VoiceOver (macOS / iOS), NVDA (Windows), JAWS (Windows), TalkBack (Android).</li>
  <li>Browsers: the latest two versions of Chrome, Edge, Safari, and Firefox.</li>
  <li>Operating systems: macOS, Windows 10/11, iOS 15+, Android 12+.</li>
</ul>

<h2>Get in Touch</h2>
<p>If you experience any difficulty accessing any part of topinkjet.com, or if you have suggestions for improving accessibility, please contact us:</p>
<p><strong>Email:</strong> <a href="mailto:${BIZ.email}">${BIZ.email}</a><br/>
<strong>Phone:</strong> <a href="tel:${BIZ.phone.replace(/[^0-9+]/g,"")}">${BIZ.phone}</a><br/>
<strong>Mail:</strong> Accessibility Coordinator, TopInkjet, ${BIZ.address.street}, ${BIZ.address.city}, ${BIZ.address.state} ${BIZ.address.zip}</p>
<p>We aim to respond to accessibility-related inquiries within 2 business days. If your inquiry requires deeper investigation, we will provide a status update every 5 business days until it is resolved.</p>

<h2>Formal Complaints</h2>
<p>If you believe we have failed to provide accessible content or service, you may also file a complaint with the US Department of Justice under the Americans with Disabilities Act (ADA). Information about the ADA complaint process is available at <a href="https://www.ada.gov/" rel="noopener">www.ada.gov</a>.</p>
`
  );
}

function pageDisclaimer() {
  return legalShell(
    "Disclaimer",
    "Important disclosures about product information, brand names, pricing, and third-party services on topinkjet.com.",
    "disclaimer",
    `
<p>The information on topinkjet.com is provided in good faith for general informational and commercial purposes. By using the site, you acknowledge the following disclosures.</p>

<h2>Independent Retailer</h2>
<p>TopInkjet is an independent United States retailer. We are not owned by, operated by, or affiliated with any printer manufacturer. The products we sell are sourced through US distribution channels.</p>

<h2>Brand Names and Trademarks</h2>
<p>Brand names, model numbers, logos, and other trademarks used throughout topinkjet.com are the property of their respective owners and are used for descriptive and identification purposes only. Their use does not imply any sponsorship, endorsement, partnership, or affiliation between TopInkjet and any trademark holder.</p>

<h2>Product Information Accuracy</h2>
<p>We make every reasonable effort to ensure that product descriptions, specifications, images, prices, and availability are accurate. Manufacturers occasionally update product specifications without notice; in case of any discrepancy between our product page and the manufacturer's current published specifications, the manufacturer's specifications take precedence. If you've made a purchase decision based on a specification that turns out to be incorrect, contact us within 30 days of delivery and we will work with you on a return or partial refund.</p>

<h2>Pricing</h2>
<p>All prices on the site are in US dollars and exclude applicable sales tax. Prices may change without notice and may differ from prices at other US retailers. We reserve the right to correct pricing errors and to cancel orders placed at incorrect prices, as further described in our <a href="/terms-of-service.html">Terms of Service</a>.</p>

<h2>Stock Availability</h2>
<p>Although we do our best to keep stock counts accurate, products occasionally sell out faster than our system updates. If you place an order for a product that turns out to be out of stock, we will contact you within one business day with the option to wait for restock, switch to a similar model, or cancel for a full refund.</p>

<h2>No Professional Advice</h2>
<p>Buying guides, blog articles, and FAQ entries on topinkjet.com are written by our team to help you make informed purchase decisions. They reflect our experience and opinion as of their publication date and should not be construed as professional advice for your specific situation. If you require expert guidance on enterprise printer fleets, managed print services, or compliance-driven document workflows, please consult a qualified professional.</p>

<h2>Third-Party Links</h2>
<p>topinkjet.com occasionally links to third-party websites, including manufacturer pages and external resources. We are not responsible for the content, accuracy, or practices of those external sites. The presence of a link does not imply endorsement.</p>

<h2>Manufacturer Warranty</h2>
<p>Every printer we sell carries the original manufacturer's warranty as documented in the product packaging. TopInkjet does not provide an additional warranty beyond what the manufacturer offers. For warranty-covered repairs or replacements, please follow the manufacturer's instructions in the documentation included with your product.</p>

<h2>Earnings and Performance</h2>
<p>Any productivity claim on the site (for example, "saves time", "low cost per page", "improves workflow") is a general statement and not a guarantee of any specific business or personal outcome. Actual results vary based on usage patterns, environment, and other factors outside our control.</p>

<h2>Limitation of Liability</h2>
<p>To the fullest extent permitted by law, TopInkjet shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising out of your access to, use of, or reliance on the information presented on topinkjet.com. Our total liability is limited as set out in our <a href="/terms-of-service.html">Terms of Service</a>.</p>

<h2>Changes to This Disclaimer</h2>
<p>We may update this Disclaimer from time to time. The "Last updated" date at the top of the page tells you when the most recent revision was published.</p>

<h2>Contact</h2>
<p>Questions about anything on this page? Email <a href="mailto:${BIZ.email}">${BIZ.email}</a>.</p>
`
  );
}


// ----- 404 -----
function page404() {
  const body = `
<section class="section">
  <div class="container narrowest" style="text-align:center">
    <h1>404 — Page Not Found</h1>
    <p class="lead">The page you're looking for has moved or never existed.</p>
    <p><a class="btn btn-accent btn-lg" href="/">Return Home</a> <a class="btn btn-outline btn-lg" href="/shop.html">Shop Printers</a></p>
  </div>
</section>
`;
  return shell({
    title: "Page Not Found — TopInkjet",
    description: "The page you're looking for could not be found.",
    canonical: "/404.html",
    body,
  });
}

// ----- Sitemap & robots -----
function buildSitemap(products) {
  const urls = [
    "/", "/shop.html",
    "/category-office-inkjet.html", "/category-home-inkjet.html",
    "/cart.html", "/wishlist.html", "/checkout.html", "/order-confirmation.html",
    "/account/sign-in.html", "/account/sign-up.html", "/account/dashboard.html",
    "/about.html", "/contact.html", "/faq.html",
    "/privacy-policy.html", "/terms-of-service.html",
    "/return-policy.html", "/refund-policy.html",
    "/shipping-policy.html", "/cookie-policy.html",
    "/do-not-sell-my-personal-info.html", "/accessibility.html", "/disclaimer.html",
  ];
  const allUrls = [
    ...urls,
    ...products.map((p) => `/product/${p.slug}.html`),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map((u) => `  <url><loc>${SITE_URL}${u}</loc><changefreq>weekly</changefreq></url>`).join("\n")}
</urlset>
`;
}

const ROBOTS = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;

// ---------- Public entry ----------
export function buildPages(PRODUCTS, write) {
  // Homepage
  write("index.html", pageHome(PRODUCTS));
  // Shop & categories
  write("shop.html", pageShop(PRODUCTS));
  write("category-office-inkjet.html", pageCategory(PRODUCTS, "office-inkjet"));
  write("category-home-inkjet.html", pageCategory(PRODUCTS, "home-inkjet"));
  // Product pages
  for (const p of PRODUCTS) {
    write(`product/${p.slug}.html`, pageProduct(p, PRODUCTS));
  }
  // Cart / wishlist / checkout
  write("cart.html", pageCart(PRODUCTS));
  write("wishlist.html", pageWishlist(PRODUCTS));
  write("checkout.html", pageCheckout());
  write("order-confirmation.html", pageOrderConfirmation());
  // Account
  write("account/sign-in.html", pageSignIn());
  write("account/sign-up.html", pageSignUp());
  write("account/dashboard.html", pageDashboard());
  // Static info
  write("about.html", pageAbout());
  write("contact.html", pageContact());
  write("faq.html", pageFaq());
  // Legal
  write("privacy-policy.html", pagePrivacy());
  write("terms-of-service.html", pageTerms());
  write("return-policy.html", pageReturn());
  write("refund-policy.html", pageRefund());
  write("shipping-policy.html", pageShipping());
  write("cookie-policy.html", pageCookie());
  write("do-not-sell-my-personal-info.html", pageDoNotSell());
  write("accessibility.html", pageAccessibility());
  write("disclaimer.html", pageDisclaimer());
  // 404
  write("404.html", page404());
  // Sitemap & robots
  write("sitemap.xml", buildSitemap(PRODUCTS));
  write("robots.txt", ROBOTS);
  console.log("[pages] generated all HTML pages");
}
