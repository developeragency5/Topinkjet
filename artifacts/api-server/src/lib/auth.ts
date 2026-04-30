import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { logger } from "./logger";

const JWT_ALG = "HS256" as const;
const SESSION_COOKIE = "tij_session";
const SESSION_TTL_DAYS = 30;
const SESSION_TTL_MS = SESSION_TTL_DAYS * 24 * 60 * 60 * 1000;

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "JWT_SECRET environment variable is required and must be at least 32 characters.",
    );
  }
  return secret;
}

export interface SessionPayload {
  userId: string;
}

export function signSessionToken(payload: SessionPayload): string {
  return jwt.sign(payload, getJwtSecret(), {
    algorithm: JWT_ALG,
    expiresIn: `${SESSION_TTL_DAYS}d`,
  });
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret(), {
      algorithms: [JWT_ALG],
    });
    if (
      typeof decoded === "object" &&
      decoded !== null &&
      typeof (decoded as { userId?: unknown }).userId === "string"
    ) {
      return { userId: (decoded as { userId: string }).userId };
    }
    return null;
  } catch (err) {
    logger.debug({ err }, "JWT verification failed");
    return null;
  }
}

function isProd(): boolean {
  return process.env.NODE_ENV === "production";
}

export function setSessionCookie(res: Response, token: string): void {
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProd(),
    // Cross-origin (Cloudflare frontend ↔ Render backend) requires SameSite=None in prod.
    // In dev we use Lax so the cookie still works on http://localhost.
    sameSite: isProd() ? "none" : "lax",
    maxAge: SESSION_TTL_MS,
    path: "/",
  });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE, {
    httpOnly: true,
    secure: isProd(),
    sameSite: isProd() ? "none" : "lax",
    path: "/",
  });
}

export function readSessionFromRequest(req: Request): SessionPayload | null {
  const cookies = (req as Request & { cookies?: Record<string, string> })
    .cookies;
  const token = cookies?.[SESSION_COOKIE];
  if (!token || typeof token !== "string") return null;
  return verifySessionToken(token);
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      session?: SessionPayload;
    }
  }
}

export function attachSession(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const session = readSessionFromRequest(req);
  if (session) req.session = session;
  next();
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const session = req.session ?? readSessionFromRequest(req);
  if (!session) {
    res.status(401).json({ error: "Not signed in" });
    return;
  }
  req.session = session;
  next();
}
