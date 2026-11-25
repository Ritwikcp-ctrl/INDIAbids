import { z } from "zod";
export const boardIdSchema = z.object({
    boardId: z.string().uuid(),
});
export const quoteSchema = z.object({
    businessId: z.string().uuid().optional(),
    manageToken: z.string().trim().optional(),
});
export const leaderboardQuerySchema = z.object({
    limit: z.coerce.number().int().min(1).max(100).default(50),
});
export const placeBidSchema = z.object({
    boardId: z.string().uuid().optional(),
    categorySlug: z.string().trim().optional(),
    scope: z.enum(["NATIONAL", "STATE"]).default("NATIONAL"),
    state: z.string().trim().nullish(),
    // Raising existing listing
    businessId: z.string().uuid().optional(),
    manageToken: z.string().trim().min(8).optional(),
    // New listing
    name: z.string().trim().min(2).max(120).optional(),
    website: z.string().trim().optional().or(z.literal("")),
    description: z.string().trim().max(1000).optional(),
    contactEmail: z.string().email().optional(),
    contactPhone: z.string().trim().max(20).optional(),
    amountPaise: z.union([z.string(), z.number(), z.bigint()]).transform((val) => {
        try {
            const b = BigInt(val);
            if (b <= 0n)
                throw new Error();
            return b;
        }
        catch {
            throw new Error("Invalid bid amount in paise.");
        }
    }),
    idempotencyKey: z.string().optional(),
});
