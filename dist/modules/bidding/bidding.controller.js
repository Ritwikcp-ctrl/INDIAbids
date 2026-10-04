import { AppError } from "../../lib/app-error";
import { boardIdSchema, quoteSchema, leaderboardQuerySchema, } from "./bidding.schemas";
import { getBidQuote, getLeaderboard } from "./bidding.service";
export async function getQuote(req, res, next) {
    try {
        if (!req.auth) {
            throw new AppError(401, "AUTHENTICATION_REQUIRED", "Authentication is required.");
        }
        const { boardId } = boardIdSchema.parse(req.params);
        const input = quoteSchema.parse(req.body);
        const quote = await getBidQuote(req.auth.userId, boardId, input);
        res.setHeader("cache-Control", "no-store");
        res.status(200).json({
            success: true,
            data: {
                quote,
            },
        });
    }
    catch (error) {
        next(error);
    }
}
export async function getBoardLeaderboard(req, res, next) {
    try {
        const { boardId } = boardIdSchema.parse(req.params);
        const { limit } = leaderboardQuerySchema.parse(req.query);
        const leaderboard = await getLeaderboard(boardId, limit);
        res.status(200).json({
            success: true,
            data: {
                leaderboard,
            },
        });
    }
    catch (error) {
        next(error);
    }
}
