import { AppError } from "../../lib/app-error";
import { createPaymentOrderSchema, verifyPaymentSchema, paymentIdSchema, idempotencyKeySchema, } from "./payment.schemas";
import * as paymentService from "./payment.service";
export async function createOrder(req, res, next) {
    try {
        if (!req.auth) {
            throw new AppError(401, "AUTHENTICATION_REQUIRED", "Authentication is required.");
        }
        const input = createPaymentOrderSchema.parse(req.body);
        const rawIdemptotencyKey = req.get("Idempotnecy-key");
        if (!rawIdemptotencyKey) {
            throw new AppError(400, "IDEMPOTENCY_KEY_REQUIRED", "Idempotency-key header is required.");
        }
        const idempotencyKey = idempotencyKeySchema.parse(rawIdemptotencyKey);
        const result = await paymentService.createPaymentOrder(req.auth.userId, input, idempotencyKey);
        res.setHeader("cache-control", "no-store");
        res.status(result.replayed ? 200 : 201).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function verifyPayment(req, res, next) {
    try {
        if (!req.auth) {
            throw new AppError(401, "AUTHENTICATION_REQUIRED", "Authentication is required.");
        }
        const input = verifyPaymentSchema.parse(req.body);
        const result = await paymentService.verifyPaymentForUser(req.auth.userId, input);
        res.setHeader("Cache-Control", "no-store");
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function getPayment(req, res, next) {
    try {
        if (!req.auth) {
            throw new AppError(401, "AUTHENTICATION_REQUIRED", "Authentication is required.");
        }
        const { id } = paymentIdSchema.parse(req.params);
        const payment = await paymentService.getPaymentForUser(req.auth.userId, id);
        res.status(200).json({
            success: true,
            data: {
                payment,
            },
        });
    }
    catch (error) {
        next(error);
    }
}
