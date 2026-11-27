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
const verifyLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: {
            code: "RATE_LIMITED",
            message: "Too many payment verification attempts.",
        },
    },
});
// Razorpay Webhook endpoint (fulfillment source of truth)
router.post("/webhooks/razorpay", handleRazorpayWebhook);
// Payment status polling for /success/:paymentId (public)
router.get("/status/:id", statusLimiter, getPaymentStatus);
router.get("/:id", statusLimiter, getPaymentStatus);
// Client-side checkout callback verification (immediate confirmation alongside webhook)
router.post("/verify", verifyLimiter, verifyPayment);
export default router;
