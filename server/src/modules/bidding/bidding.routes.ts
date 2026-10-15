
import { Router } from "express";
import rateLimit from "express-rate-limit";

import { requireAuth } from "../../middleware/require-auth";
import {
  getQuote,
  getBoardLeaderboard,
} from "./bidding.controller";

const router = Router();

const quoteRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    code: "RATE_LIMITED",
    message: "Too many bid quote requests. Please try again later.",
  },
});

const leaderboardRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    code: "RATE_LIMITED",
    message: "Too many leaderboard requests. Please try again later.",
  },
});

// Get a bid quote for a business on a board.
router.post(
  "/:boardId/quote",
  quoteRateLimiter,
  requireAuth,
  getQuote,
);

// View the leaderboard for a board.
router.get(
  "/:boardId/leaderboard",
  leaderboardRateLimiter,
  getBoardLeaderboard,
);

export default router;
