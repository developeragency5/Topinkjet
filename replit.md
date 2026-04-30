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
