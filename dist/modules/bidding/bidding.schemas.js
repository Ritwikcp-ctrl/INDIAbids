import { z } from "zod";
export const boardIdSchema = z.object({
    boardId: z.string().uuid(),
});
export const quoteSchema = z.object({
    businessId: z.string().uuid(),
});
export const leaderboardQuerySchema = z.object({
    limit: z.coerce.number().int().min(1).max(100).default(50),
});
