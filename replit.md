# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## TopInkjet Artifact (artifacts/topinkjet)

US-only static ecommerce site for HP inkjet printers — pure HTML/CSS/vanilla JS.

- **Build**: `node artifacts/topinkjet/build-site.mjs` (regenerates `site/` from `build-pages.mjs` + product catalog).
- **Dev workflow**: `artifacts/topinkjet: web` serves `site/`.
- **Catalog**: 22 SKUs (11 office, 11 home), defined inline in `build-site.mjs`.
- **Cart/wishlist state**: localStorage only (`ti_cart_v1`, `ti_wishlist_v1`).
- **5-step checkout**: Contact → Shipping (with AVS) → Method → Payment → Review (no Billing ZIP, no separate billing address).
- **Forbidden copy** (do NOT reintroduce): "same-day dispatch", "2 PM Central" cutoff, "we'd buy ourselves", fake reviews/ratings, urgency scarcity, "HP authorized" claims, blog content.
- **Defensive numerics**: `cart.js`, `cart-page.js`, `checkout.js`, `main.js` all coerce `qty`/`price` via `safeQty`/`safePrice` to prevent `$NaN` when localStorage is corrupted from older versions.
- **Performance**: `build-site.mjs` resizes product images via ImageMagick (max 1200px JPG q82 + 480px WebP thumbs) with mtime-based skip cache. `serve.mjs` sends proper Cache-Control: HTML must-revalidate, css/js 1h, images/fonts 30d immutable. CSS link includes `?v=${ASSET_VERSION}` (build-time epoch) to bust cache after rebuilds.
- **Typography**: Body uses Inter, headings (h1-h4) use Plus Jakarta Sans (loaded together via single Google Fonts link in `build-pages.mjs`). Root font is fluid: `clamp(16px, 0.4vw + 14.7px, 17.5px)`. Hero h1 is `clamp(2.25rem, 5vw + 0.5rem, 4.25rem)` for big-poster impact on desktop.
- **Responsive breakpoints**: 480 (mobile cards 2-up + stacked CTAs + stacked footer/why-grid + trust-strip 1-col), 700/720, 800 (footer/why-grid stacks), 860 (cart stacks), 900 (hero stacks + trust-strip 2-col), 980 (header nav→hamburger). Hero, container, and section paddings use `clamp()` for fluid spacing.
