import { Router } from "express";
import rateLimit from "express-rate-limit";
import { createOrder, verifyPayment, getPayment } from "./payment.controller";
import { handleRazorpayWebhook } from "./payment.webhook.controller";
import { requireAuth } from "../../middleware/require-auth";
const router = Router();
const paymentLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.url.startsWith("/api/v1/payments/webhooks/razorpay"),
    message: {
        success: false,
        error: {
            code: "RATE_LIMITED",
            message: "Too many payment requrest.",
        },
    },
});
router.post("/webhooks/razorpay", handleRazorpayWebhook);
router.post("/orders", requireAuth, paymentLimiter, createOrder);
router.post("/verify", requireAuth, paymentLimiter, verifyPayment);
router.get("/:id", requireAuth, getPayment);
export default router;
