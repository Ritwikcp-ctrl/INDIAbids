import { Router } from "express";
import rateLimit from "express-rate-limit";
import { createBusiness, listMyBusinesses, getPublicBusinessBySlug, getBusinessByManageToken, claimBusinessByManageToken, updateBusiness, } from "./business.controller.js";
import { requireAuth } from "../../middleware/require-auth.js";
import { attachUser } from "../../middleware/attach-user.js";
const router = Router();
const createBusinessLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 20,
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
    limit: 60,
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
// Strict gate for authenticated user's listings
router.get("/mine", requireAuth, listMyBusinesses);
// Manage listing anonymously via one-time token
router.get("/manage/:token", getBusinessByManageToken);
// Claim listing: requires auth, sets ownerId, nulls manageTokenHash (old URL 404s)
router.post("/manage/:token/claim", requireAuth, claimBusinessByManageToken);
// Create business (optional auth)
router.post("/", attachUser, createBusinessLimiter, createBusiness);
// Update business (auth or manageToken)
router.patch("/:id", attachUser, updateBusinessLimiter, updateBusiness);
// Public business profile by slug (must come after specific routes)
router.get("/:slug", getPublicBusinessBySlug);
export default router;
