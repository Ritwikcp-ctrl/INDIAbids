import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import cookieParser from "cookie-parser";
import { randomUUID } from "node:crypto";

import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";

import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import categoryRoutes from "./modules/categories/category.routes.js";
import businessRoutes from "./modules/businesses/business.routes.js";
import boardRoutes from "./modules/boards/board.routes.js";
import biddingRoutes from "./modules/bidding/bidding.routes.js";
import paymentRoutes from "./modules/payments/payment.routes.js";

import {
  getBusinessByManageToken,
  claimBusinessByManageToken,
} from "./modules/businesses/business.controller.js";
import { requireAuth } from "./middleware/require-auth.js";
import { notFoundHandler } from "./middleware/not-found.js";
import { errorHandler } from "./middleware/error-handler.js";

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
    genReqId: (req, res) => res.locals.requestId,
  })
);

app.use(
  express.json({
    limit: "100kb",
    verify: (req, res, buffer) => {
      if (req.url?.startsWith("/api/v1/payments/webhooks/razorpay")) {
        req.rawBody = Buffer.from(buffer);
      }
    },
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
    limit: 500,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: {
        code: "RATE_LIMITED",
        message: "Too many requests. Please try again later.",
      },
    },
  })
);

app.use(cookieParser());


app.use("/api/v1", healthRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/businesses", businessRoutes);
app.use("/api/v1/boards", boardRoutes);
app.use("/api/v1/bids", biddingRoutes);
app.use("/api/v1/checkout", biddingRoutes); 
app.use("/api/v1/payments", paymentRoutes);


app.get("/api/v1/manage/:token", getBusinessByManageToken);
app.post("/api/v1/manage/:token/claim", requireAuth, claimBusinessByManageToken);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;

//To Do : Add a web application firewall , implement stricter CORS policies for production and conduct a security audit.

//To do : Ship logs to a centralized service like Datadog, Logtail.