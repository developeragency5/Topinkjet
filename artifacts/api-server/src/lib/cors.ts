import type { Request, Response, NextFunction } from "express";

// FRONTEND_ORIGIN is a comma-separated list of allowed browser origins
// (production). In development (no env var) we additionally accept any
// localhost / 127.0.0.1 origin on any port (covers the Replit proxy at
// http://localhost:80, Vite at 5173, Next at 3000, ad-hoc tooling) AND the
// public Replit dev domain (*.replit.dev / *.repl.co) advertised via
// REPLIT_DOMAINS or REPLIT_DEV_DOMAIN, so headless test browsers and the
// preview pane (which both go through the public domain) work too.
const isProduction = process.env.NODE_ENV === "production";

const explicitAllowlist: string[] = (process.env.FRONTEND_ORIGIN ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const replitDevHosts: string[] = [
  ...(process.env.REPLIT_DOMAINS ?? "").split(","),
  process.env.REPLIT_DEV_DOMAIN ?? "",
]
  .map((s) => s.trim())
  .filter(Boolean);

function isLocalhostOrigin(origin: string): boolean {
  try {
    const u = new URL(origin);
    return u.hostname === "localhost" || u.hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

function isReplitDevOrigin(origin: string): boolean {
  try {
    const u = new URL(origin);
    return replitDevHosts.includes(u.hostname);
  } catch {
    return false;
  }
}

export function isAllowedOrigin(origin: string): boolean {
  if (explicitAllowlist.includes(origin)) return true;
  if (!isProduction) {
    if (isLocalhostOrigin(origin)) return true;
    if (isReplitDevOrigin(origin)) return true;
  }
  return false;
}

// CSRF defense for cookie-authenticated state-changing requests.
//
// Our session cookie is `SameSite=None; Secure` in production so the static
// frontend on topinkjet.com can include it when calling the Render-hosted
// API. That weakens the browser's built-in CSRF protection, so we enforce it
// ourselves on POST/PUT/PATCH/DELETE: the request's Origin (or Referer
// fallback) header must match an allowed origin. Browsers always send Origin
// on cross-site form submissions, so this blocks classic form-POST CSRF.
//
// GET/HEAD/OPTIONS are allowed through — they should never have side effects.
// Requests with no Origin and no Referer are also allowed (server-to-server,
// curl, Postman); those are not browser CSRF vectors.
export function enforceSameOrigin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const safeMethod =
    req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS";
  if (safeMethod) return next();

  const origin = req.get("origin");
  const referer = req.get("referer");

  // Server-to-server / CLI tools — no browser CSRF risk.
  if (!origin && !referer) return next();

  let candidate: string | undefined;
  if (origin) {
    candidate = origin;
  } else if (referer) {
    try {
      const u = new URL(referer);
      candidate = `${u.protocol}//${u.host}`;
    } catch {
      candidate = undefined;
    }
  }

  if (candidate && isAllowedOrigin(candidate)) return next();

  res.status(403).json({ error: "Forbidden: cross-origin request rejected." });
}
