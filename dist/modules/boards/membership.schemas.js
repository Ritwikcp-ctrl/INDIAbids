import { z } from "zod";
export const boardIdSchema = z.object({
    boardId: z.string().uuid(),
});
export const businessIdSchema = z.object({
    businessId: z.string().uuid(),
});
export const joinBoardSchema = z.object({
    businessId: z.string().uuid(),
});
