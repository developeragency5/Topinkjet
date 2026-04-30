# Deploying the TopInkjet API to Render

The TopInkjet stack is split across two providers:

| Piece | Where it lives | How it deploys |
| --- | --- | --- |
| Static site (`artifacts/topinkjet`) | Cloudflare Pages — `topinkjet.com` | GitHub Actions (`.github/workflows/ci.yml`) on every push to `main` |
| API server (`artifacts/api-server`) | Render — `topinkjet-api.onrender.com` | Render auto-deploy on every push to `main` |
| Postgres database | Render — `topinkjet-db` | Provisioned once via the Render dashboard or Blueprint |

The frontend (Cloudflare) calls the backend (Render) cross-origin with cookies,
so CORS and cookie attributes must match in production. This guide walks through
the one-time setup on Render and the recurring "what do I do when I redeploy?"
checklist.

---

## Option A — Blueprint (recommended, one click)

The repo contains a `render.yaml` Blueprint that describes both the database
and the web service. Use this on a fresh Render account to get everything in
one shot.

1. Sign in at <https://dashboard.render.com>.
2. Click **New +** → **Blueprint**.
3. Connect your GitHub account if you haven't already, then pick the repo
   `developeragency5/Topinkjet` and branch `main`.
4. Render reads `render.yaml`, shows you a preview of:
   - Postgres database `topinkjet-db` (free, Ohio region)
   - Web service `topinkjet-api` (Node 24, free)
5. Click **Apply**. Render will:
   - Create the database and capture its internal connection string.
   - Inject `DATABASE_URL` into the web service automatically.
   - Generate a random 64-char `JWT_SECRET` (one-time, stored only in Render).
   - Pre-set `NODE_ENV=production` and
     `FRONTEND_ORIGIN=https://topinkjet.com,https://www.topinkjet.com`.
6. The first deploy will take 4–6 minutes (cold install + esbuild bundle).
   When it finishes, run the database migration once from your laptop — see
   [Database migration](#database-migration) below.

---

## Option B — Manual setup (do this if you don't want the Blueprint)

### B1. Create the Postgres database

1. Render dashboard → **New +** → **PostgreSQL**.
2. Settings:
   - **Name**: `topinkjet-db`
   - **Database**: `topinkjet`
   - **User**: `topinkjet`
   - **Region**: `Ohio (US East)` (same region as the API for low latency)
   - **PostgreSQL Version**: `16`
   - **Plan**: `Free`
3. Click **Create Database**. Wait ~1 minute for status to flip to *Available*.
4. From the database page, copy the **Internal Database URL** — you'll paste it
   into the web service's `DATABASE_URL` env var.

### B2. Create the web service

1. **New +** → **Web Service** → connect repo `developeragency5/Topinkjet`,
   branch `main`.
2. Settings:
   - **Name**: `topinkjet-api`
   - **Region**: `Ohio (US East)` (must match the database region)
   - **Branch**: `main`
   - **Root Directory**: leave blank (the build command operates on the
     monorepo root)
   - **Runtime**: `Node`
   - **Plan**: `Free`
   - **Build Command**:
     ```bash
     corepack enable && corepack prepare pnpm@10.26.1 --activate && pnpm install --frozen-lockfile && pnpm --filter @workspace/api-server run build
     ```
   - **Start Command**:
     ```bash
     node --enable-source-maps artifacts/api-server/dist/index.mjs
     ```
   - **Health Check Path**: `/api/healthz`
   - **Auto-Deploy**: `Yes`

3. **Environment Variables** (Settings → Environment):

   | Key | Value | Notes |
   | --- | --- | --- |
   | `NODE_ENV` | `production` | Enables `Secure; SameSite=None` cookies |
   | `NODE_VERSION` | `24` | Pin Node to match local + CI |
   | `DATABASE_URL` | *(paste internal URL from step B1.4)* | Render injects this automatically if you "Add from Database" |
   | `JWT_SECRET` | *(64+ random chars)* | Click **Generate** — Render picks a strong value. Never reuse the dev secret. |
   | `FRONTEND_ORIGIN` | `https://topinkjet.com,https://www.topinkjet.com` | Comma-separated, no trailing slash |

   `PORT` is set automatically by Render — don't override it.

4. Click **Create Web Service**. Render starts the first build immediately.
   Watch the **Logs** tab; you should see `[api-server] listening on :10000`
   (port number varies) once it's up.

---

## Database migration

After the **first** deploy and any time you change `lib/db/src/schema/`,
push the schema to the Render Postgres database. The web service does not run
migrations on boot — that's intentional, so you stay in control.

Easiest path is from your laptop, against Render's *External* database URL
(the one with the `.render.com` hostname, **not** the internal one):

```bash
# Copy the External Database URL from the Render database page
export DATABASE_URL="postgresql://topinkjet:...@dpg-xxxxx.ohio-postgres.render.com/topinkjet"
pnpm --filter @workspace/db run push
```

Drizzle prints `[✓] Changes applied` when done. The `users` table now exists
in production.

> Tip: if you'd rather not put the production URL on your laptop, use the
> Render **Shell** tab on the `topinkjet-api` service and run the same command
> there — `DATABASE_URL` is already set to the internal URL inside the service.

---

## Verifying the deploy

```bash
# 1. Health check (no cookies, no auth)
curl -i https://topinkjet-api.onrender.com/api/healthz
# Expect: HTTP/1.1 200 OK  + {"status":"ok"}

# 2. CORS preflight from the production frontend origin
curl -i -X OPTIONS https://topinkjet-api.onrender.com/api/auth/me \
  -H "Origin: https://topinkjet.com" \
  -H "Access-Control-Request-Method: GET"
# Expect: 204 with Access-Control-Allow-Origin: https://topinkjet.com
#                 + Access-Control-Allow-Credentials: true

# 3. End-to-end signup → me → signout from the topinkjet.com frontend:
#    open https://topinkjet.com/account/sign-up.html in a real browser,
#    create an account, confirm it redirects to /account/dashboard.html
#    and the header now shows "My Account / Sign Out".
```

If the browser console shows a CORS error, the most common causes are:

- `FRONTEND_ORIGIN` on Render doesn't *exactly* match the origin in the
  browser (check `https://` vs `http://`, `www.` vs apex, no trailing slash).
- The frontend was built without `API_BASE_URL` so it's calling `/api/...` on
  `topinkjet.com` instead of `topinkjet-api.onrender.com`. Check
  `view-source:https://topinkjet.com/` for the
  `window.__TOPINKJET_API_BASE_URL` line — it should equal
  `https://topinkjet-api.onrender.com/api`. If it's wrong, see
  [Frontend build URL](#frontend-build-url) below.

---

## Frontend build URL

The static site reads `process.env.API_BASE_URL` at *build* time and embeds it
as `window.__TOPINKJET_API_BASE_URL` in every HTML page. The default points at
the production Render service:

- **GitHub Actions CI** — set in `.github/workflows/ci.yml` under the
  *Build topinkjet static site* step. The workflow uses
  `${{ vars.API_BASE_URL || 'https://topinkjet-api.onrender.com/api' }}`, so
  to override without editing the workflow, add a repository **Variable**
  (Settings → Secrets and variables → Actions → **Variables**) named
  `API_BASE_URL`.
- **Local dev** — leave it unset and the build defaults to `/api`, which
  works against the locally-running api-server through the Replit proxy.

If you rename the Render service or add a custom domain in front of it,
update the variable above and re-run the workflow (or push any commit).

---

## Recommended: serve the API from a same-site subdomain

The default setup above is **third-party cookies**: the static site lives on
`topinkjet.com`, the API on `topinkjet-api.onrender.com`, and the session
cookie travels cross-site. We send `SameSite=None; Secure` so it works today,
but Chrome / Safari / Firefox have all been progressively restricting
third-party cookies, and a meaningful slice of users already block them.

The bullet-proof fix is to put the API behind a subdomain of your own apex
domain, e.g. `api.topinkjet.com`, so the cookie becomes **same-site**:

1. In Cloudflare DNS for `topinkjet.com`, add a CNAME record:
   - **Type**: CNAME
   - **Name**: `api`
   - **Target**: `topinkjet-api.onrender.com`
   - **Proxy status**: DNS only (orange cloud OFF). Cloudflare proxying with
     Render's free plan can break the TLS handshake — start with DNS only;
     turn the proxy on later only after verifying it works.
2. In Render, open the `topinkjet-api` service → **Settings** → **Custom
   Domains** → **Add Custom Domain** → `api.topinkjet.com`. Render will
   provision a Let's Encrypt cert (a few minutes).
3. Update env vars and re-deploy:
   - `FRONTEND_ORIGIN` on Render: still `https://topinkjet.com,https://www.topinkjet.com`
   - `API_BASE_URL` for the static site: change to `https://api.topinkjet.com/api`
     (set as a GitHub Actions repository **Variable** named `API_BASE_URL`,
     or edit `.github/workflows/ci.yml`).
4. The session cookie will now be set for `api.topinkjet.com` and the browser
   will treat the request as same-site (`*.topinkjet.com` ↔ `topinkjet.com`).
   You can switch the cookie to `SameSite=Lax` for stronger CSRF protection
   later if you want — the code currently uses `SameSite=None` in production
   so both setups keep working without changes.

This is a one-time DNS edit and turns the auth from "should work in modern
browsers" into "works in every browser, full stop." Do it before you launch
publicly.

## Cold starts (free plan only)

Render's free web service spins down after ~15 minutes of inactivity. The
*first* request after that takes 30–60 seconds while the container boots.
This shows up to users as a long initial spinner on sign-in/sign-up. Two
ways to handle it:

1. **Live with it** for the launch, document the behaviour, upgrade to the
   $7/month Starter plan once traffic justifies it.
2. **Cron-ping** the health endpoint every 10 minutes from a free uptime
   monitor (UptimeRobot, BetterUptime, Cron-job.org, etc.) targeting
   `https://topinkjet-api.onrender.com/api/healthz`. This keeps the dyno warm
   and is permitted by Render's free-tier ToS.

---

## Rolling back

Each deploy in Render's *Deploys* tab has a **Rollback** button. Roll back the
web service first, then (only if a schema change was involved) restore the
database from the most recent automatic snapshot under the database's
*Backups* tab.

---

## Local development

Local development still works exactly as before — the api-server runs in a
Replit workflow against Replit's bundled Postgres, the static site is served
through the same proxy on `localhost:80`, and the build defaults
`API_BASE_URL` to `/api`. None of this is touched by the Render deploy.
