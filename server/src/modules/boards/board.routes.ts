import { Router } from "express";
import rateLimit from "express-rate-limit";

import { createBoard, listBoards, getBoardByKey } from "./board.controller";

import { requireAuth } from "../../middleware/require-auth";
import { requireRole } from "../../middleware/require-role";


import {
  joinBoard,
} from "./membership.controller";

import {
  getQuote,
  getBoardLeaderboard,
} from "../bidding/bidding.controller";



const router = Router();

const createBoardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    error: {
      code: "RATE_LIMITED",
      message: "Too many board creation requests.",
    },
  },
});

const membershipLimiter =
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,

    standardHeaders: true,
    legacyHeaders: false,

    message: {
      success: false,
      error: {
        code: "RATE_LIMITED",
        message:
          "Too many board membership requests.",
      },
    },
  });


  router.post(
  "/:boardId/memberships",
  requireAuth,
  membershipLimiter,
  joinBoard,
);

/*
 * Admin-only mutation.
 */
router.post(
  "/",
  requireAuth,
  requireRole("ADMIN"),
  createBoardLimiter,
  createBoard
);

router.post(
  "/:boardId/bids/quote",
  requireAuth,
  getQuote,
);

router.get(
  "/:boardId/leaderboard",
  getBoardLeaderboard,
);

/*
 * Public reads.
 */
router.get("/", listBoards);

router.get("/:key", getBoardByKey);

export default router;
