import { Router } from "express";
import rateLimit from "express-rate-limit";
import { attachUser } from "../../middleware/attach-user.js";
import { createBid, getQuote, getBoardLeaderboard, } from "./bidding.controller.js";
const router = Router();
const bidRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: {
            code: "RATE_LIMITED",
            message: "Too many bid requests. Please slow down.",
        },
    },
});
const quoteRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: {
            code: "RATE_LIMITED",
            message: "Too many bid quote requests. Please try again later.",
        },
    },
});
const leaderboardRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 120,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: {
            code: "RATE_LIMITED",
            message: "Too many leaderboard requests. Please try again later.",
        },
    },
});
// Single code path for bidding: anonymous & authenticated
router.post("/", bidRateLimiter, attachUser, createBid);
// Get quote for climbing on a board
router.post("/:boardId/quote", quoteRateLimiter, attachUser, getQuote);
// Public leaderboard served from Redis
router.get("/:boardId/leaderboard", leaderboardRateLimiter, getBoardLeaderboard);
export default router;
