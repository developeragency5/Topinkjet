import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { isAllowedOrigin } from "./lib/cors";

const app: Express = express();

// ---------- CORS ----------
const corsOptions: cors.CorsOptions = {
  // Important: never call back with an Error — that bubbles to the global error
  // handler as a 500. Pass false to deny silently; the browser will block the
  // response because no Access-Control-Allow-Origin header is sent.
  origin: (origin, callback) => {
    // Allow same-origin / non-browser tools (no Origin header) — no CORS
    // headers needed in that case anyway.
    if (!origin) return callback(null, true);
    if (isAllowedOrigin(origin)) return callback(null, origin);
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

app.use("/api", router);

// Centralized error handler — keeps stack traces out of API responses.
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  req.log.error({ err }, "Unhandled error");
  if (res.headersSent) return;
  res.status(500).json({ error: "Internal server error" });
});

export default app;
