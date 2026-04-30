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

## Auth (frontend ↔ api-server)

- **Static frontend** on Cloudflare Pages calls **api-server** (Express, deployed on Render) cross-origin with cookies.
- **Schema**: `lib/db/src/schema/users.ts` — `usersTable` (uuid id, unique email, bcrypt password_hash, name, timestamps) plus `toPublicUser()` helper that strips `passwordHash` before serialization.
- **Routes**: `artifacts/api-server/src/routes/auth.ts` — `POST /api/auth/signup`, `/signin`, `/signout`, `GET /api/auth/me`. Uses zod schemas generated from `lib/api-spec/openapi.yaml` (`AuthSignUpBody`, `AuthSignInBody`, `AuthSignInResponse`, `AuthMeResponse`). Signin uses bcryptjs compare against a dummy hash on unknown email to avoid leaking user existence via timing. Signup catches Postgres `23505` unique-violation on the insert (covers the race where two concurrent signups slip past the existence check) and converts to a 409.
- **Session**: HS256 JWT in HttpOnly cookie `tij_session` (30-day expiry). Helpers in `artifacts/api-server/src/lib/auth.ts`. Cookie attributes: `Secure; SameSite=None` in production (cross-site fetch), `SameSite=Lax` in dev. `JWT_SECRET` env var must be ≥32 chars.
- **CORS + CSRF**: `app.ts` reads `FRONTEND_ORIGIN` (comma-separated allowlist) and enables `credentials: true`; reflects allowed origins via `Access-Control-Allow-Origin`, returns no CORS header (browser blocks) for disallowed ones. **CSRF defense** lives in `artifacts/api-server/src/lib/cors.ts` — `enforceSameOrigin` middleware is mounted on `/auth/*` and rejects POST/PUT/PATCH/DELETE whose Origin (or Referer fallback) isn't in the allowlist. Required because `SameSite=None` cookies don't get the browser's built-in CSRF protection. Server-to-server requests (no Origin and no Referer) pass through.
- **Frontend client**: `artifacts/topinkjet/site/assets/js/auth.js` (vanilla JS) — exposes `window.TopInkjetAuth.{signUp,signIn,signOut,getMe}`, all using `fetch(..., { credentials: 'include' })`. Wires `#sign-in-form`, `#sign-up-form`, `#sign-out-btn`, populates `#dashboard-*` fields, and swaps the header between "Sign In/Up" and "My Account / Sign Out". Caches the user in `localStorage` (`tij_user_cache`) so the header doesn't flicker on page load.
- **API URL injection**: `build-pages.mjs` reads `process.env.API_BASE_URL` (defaults to `/api`) and emits `<script>window.__TOPINKJET_API_BASE_URL=...</script>` in every page's `<head>`. CI sets it via `${{ vars.API_BASE_URL || 'https://topinkjet-api.onrender.com/api' }}`.
- **Render deployment**: `render.yaml` Blueprint provisions `topinkjet-db` Postgres + `topinkjet-api` web service (Node 24, free, Ohio region). Env vars: `DATABASE_URL` (auto-wired), `JWT_SECRET` (auto-generated), `FRONTEND_ORIGIN=https://topinkjet.com,https://www.topinkjet.com`, `NODE_ENV=production`. After first deploy run `pnpm --filter @workspace/db run push` against the External DB URL once. Full guide in `RENDER_DEPLOY.md`.
