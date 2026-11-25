import { Router } from "express";
import rateLimit from "express-rate-limit";
import { verifyPayment, getPaymentStatus } from "./payment.controller.js";
import { handleRazorpayWebhook } from "./payment.webhook.controller.js";

const router = Router();

const statusLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "RATE_LIMITED",
      message: "Too many payment status requests.",
    },
  },
});

// Razorpay Webhook endpoint (fulfillment source of truth)
router.post("/webhooks/razorpay", handleRazorpayWebhook);

// Payment status polling for /success/:paymentId (public)
router.get("/status/:id", statusLimiter, getPaymentStatus);
router.get("/:id", statusLimiter, getPaymentStatus);

// Client-side checkout callback verification (optional fallback)
router.post("/verify", verifyPayment);

export default router;
