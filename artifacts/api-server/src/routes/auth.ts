import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, usersTable, toPublicUser } from "@workspace/db";
import { AuthSignUpBody, AuthSignInBody } from "@workspace/api-zod";
import {
  signSessionToken,
  setSessionCookie,
  clearSessionCookie,
  requireAuth,
  attachSession,
} from "../lib/auth";
import { enforceSameOrigin } from "../lib/cors";

const router: IRouter = Router();

// All state-changing auth endpoints (POST signup/signin/signout) must come
// from one of our trusted origins. CORS alone does not block form-POST CSRF
// when the session cookie is `SameSite=None`, so we enforce it explicitly.
router.use("/auth", enforceSameOrigin);

const BCRYPT_ROUNDS = 12;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function errorBody(message: string, details?: unknown) {
  if (details === undefined) return { error: message };
  return { error: message, details };
}

router.post("/auth/signup", async (req, res, next) => {
  try {
    const parsed = AuthSignUpBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json(errorBody("Invalid request", parsed.error.flatten()));
      return;
    }
    const { email: rawEmail, password, name } = parsed.data;
    const email = normalizeEmail(rawEmail);

    const existing = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (existing.length > 0) {
      res
        .status(409)
        .json(errorBody("An account with that email already exists."));
      return;
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    let created;
    try {
      [created] = await db
        .insert(usersTable)
        .values({
          email,
          passwordHash,
          name: name?.trim() || null,
        })
        .returning();
    } catch (err) {
      // Handle the race where two concurrent signups slip past the
      // existence check above and both try to insert. Postgres reports
      // a unique-constraint violation as SQLSTATE 23505.
      if (
        err &&
        typeof err === "object" &&
        "code" in err &&
        (err as { code?: string }).code === "23505"
      ) {
        res
          .status(409)
          .json(errorBody("An account with that email already exists."));
        return;
      }
      throw err;
    }

    if (!created) {
      throw new Error("Failed to create user");
    }

    const token = signSessionToken({ userId: created.id });
    setSessionCookie(res, token);

    res.status(201).json({ user: toPublicUser(created) });
  } catch (err) {
    next(err);
  }
});

router.post("/auth/signin", async (req, res, next) => {
  try {
    const parsed = AuthSignInBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json(errorBody("Invalid request", parsed.error.flatten()));
      return;
    }
    const { email: rawEmail, password } = parsed.data;
    const email = normalizeEmail(rawEmail);

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    // Constant-time-ish: always run bcrypt.compare even if user doesn't exist,
    // to prevent timing-attack email enumeration.
    const dummyHash =
      "$2a$12$CwTycUXWue0Thq9StjUM0uJ8eNQ8qj9P8kR8Z5Uqp6cV7q.h9nL3W";
    const hashToCheck = user?.passwordHash ?? dummyHash;
    const passwordValid = await bcrypt.compare(password, hashToCheck);

    if (!user || !passwordValid) {
      res.status(401).json(errorBody("Invalid email or password."));
      return;
    }

    const token = signSessionToken({ userId: user.id });
    setSessionCookie(res, token);

    res.status(200).json({ user: toPublicUser(user) });
  } catch (err) {
    next(err);
  }
});

router.post("/auth/signout", (_req, res) => {
  clearSessionCookie(res);
  res.status(204).end();
});

router.get("/auth/me", attachSession, requireAuth, async (req, res, next) => {
  try {
    const userId = req.session!.userId;

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!user) {
      clearSessionCookie(res);
      res.status(401).json(errorBody("Account no longer exists."));
      return;
    }

    res.status(200).json({ user: toPublicUser(user) });
  } catch (err) {
    next(err);
  }
});

export default router;
