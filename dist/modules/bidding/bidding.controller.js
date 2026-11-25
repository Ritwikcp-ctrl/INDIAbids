import { AppError } from "../../lib/app-error.js";
import { boardIdSchema, quoteSchema, leaderboardQuerySchema, placeBidSchema, } from "./bidding.schemas.js";
import { getBidQuote, getLeaderboard, placeBid } from "./bidding.service.js";
export async function createBid(req, res, next) {
    try {
        const input = placeBidSchema.parse(req.body);
        const result = await placeBid(req.auth?.userId ?? null, input);
        res.status(201).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function getQuote(req, res, next) {
    try {
        const { boardId } = boardIdSchema.parse(req.params);
        const input = quoteSchema.parse(req.body || {});
        const quote = await getBidQuote(boardId, input);
        res.setHeader("Cache-Control", "no-store");
        res.status(200).json({
            success: true,
            data: { quote },
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
        const data = await getLeaderboard(boardId, limit);
        res.status(200).json({
            success: true,
            data: {
                leaderboard: data.entries,
                board: data.board,
            },
        });
    }
    catch (error) {
        next(error);
    }
}
