import { z } from "zod";
import { razorpay } from "./razorpay";
const paiseSchema = z
    .string()
    .trim()
    .regex(/^\d+$/, {
    message: "Amount must contain only digits.",
})
    .transform((value) => BigInt(value))
    .refine((value) => value > 0n, {
    message: "Amount must be greater than zero.",
});
export const createPaymentOrderSchema = z.object({
    businessId: z.string().uuid(),
    boardId: z.string().uuid(),
    amountPaise: paiseSchema,
});
export const verifyPaymentSchema = z.object({
    razorpayOrderId: z.string().trim().min(1).max(100),
    razorpayPaymentId: z.string().trim().min(1).max(100),
    razorpaySignature: z.string().trim().min(1).max(200),
});
export const paymentIdSchema = z.object({
    id: z.string().uuid(),
});
export const idempotencyKeySchema = z.string().trim().min(16).max(128).regex(/^[A-Za-z0-9._:-]+$/, "Invalid idempotency key.");
