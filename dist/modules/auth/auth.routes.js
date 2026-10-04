import { Router } from "express";
import rateLimit from "express-rate-limit";
import { register, login, refresh, logout, me } from "./auth.controller";
import { requireAuth } from "../../middleware/require-auth";
import { requireSameOrigin } from "../../middleware/require-same-origin";
const router = Router();
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: {
            code: "RATE_LIMITED",
            message: "Too many registration attempts. Please try again later.",
        },
    },
});
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: {
            code: "RATE_LIMITED",
            message: "Too many login attempts.Please try again later.",
        },
    },
});
router.post("/register", registerLimiter, requireSameOrigin, register);
router.post("/login", loginLimiter, requireSameOrigin, login);
router.post("/refresh", requireSameOrigin, refresh);
router.post("/logout", requireSameOrigin, logout);
router.get("/me", requireAuth, me);
export default router;
