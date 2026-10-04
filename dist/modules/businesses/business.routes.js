import { Router } from "express";
import rateLimit from "express-rate-limit";
import { createBusiness, listMyBusinesses, getPublicBusinessBySlug, updateBusiness, } from "./business.controller";
import { requireAuth } from "../../middleware/require-auth";
const router = Router();
const createBusinessLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: {
            code: "RATE_LIMITED",
            message: "Too many business creation attempts. Please try again later.",
        },
    },
});
const updateBusinessLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: {
            code: "RATE_LIMITED",
            message: "Too many update requests. Please try again later.",
        },
    },
});
/*
 * IMPORTANT:
 *
 * /mine must come before /:slug.
 * Otherwise Express may interpret "mine" as a slug.
 */
router.get("/mine", requireAuth, listMyBusinesses);
router.post("/", requireAuth, createBusinessLimiter, createBusiness);
router.get("/:slug", getPublicBusinessBySlug);
router.patch("/:id", requireAuth, updateBusinessLimiter, updateBusiness);
export default router;
