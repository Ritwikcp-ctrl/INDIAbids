import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import { randomUUID } from "node:crypto";

import { env } from "./config/env";
import { logger } from "./lib/logger";

import healthRoutes from "./routes/health.routes";

import { notFoundHandler } from "./middleware/not-found";
import { errorHandler } from "./middleware/error-handler";
import { success } from "zod";
import cookieParser from "cookie-parser";

import authRoutes from "./modules/auth/auth.routes";

const app = express();

app.set("trust proxy", env.TRUST_PROXY);

app.disable("x-powered-by");

app.use(helmet());

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use((req, res, next) => {
  const requestId = randomUUID();
  res.locals.requestId = requestId;
  res.setHeader("x-Request-ID", requestId);

  next();
});

app.use(
  pinoHttp({
    logger,
    genReqId: (req, res) => {
      return res.locals.requestId;
    },
  })
);

app.use(
  express.json({
    limit: "100kb",
  })
);

app.use(
  express.urlencoded({
    extended: false,
    limit: "50kb",
  })
);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: {
        code: "RATE_LIMITED",
        message: "Too many request.Please try again later.",
      },
    },
  })
);

app.use(cookieParser());

app.use("/api/v1", healthRoutes);
app.use("/api/v1/auth", authRoutes);

app.use(notFoundHandler);

app.use(errorHandler);

export default app;
