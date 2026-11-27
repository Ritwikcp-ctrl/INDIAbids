import pino from "pino";
import { env } from "../config/env";

export const logger = pino({
  level: env.LOG_LEVEL,

  redact: [
    "req.headers.authorization",
    "req.headers.cookie",
    "req.headers['x-manage-token']",
    "password",
    "token",
    "manageToken",
    "accessToken",
    "refreshToken",
    "googleId",
    "RAZORPAY_KEY_SECRET",
    "RAZORPAY_WEBHOOK_SECRET",
  ],

  base: {
    service: "INDIAbids-api",
    environment: env.NODE_ENV,
  },
});
