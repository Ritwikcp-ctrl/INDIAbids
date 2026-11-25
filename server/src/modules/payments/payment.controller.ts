import type { Request, Response, NextFunction } from "express";
import { AppError } from "../../lib/app-error.js";
import {
  createPaymentOrderSchema,
  verifyPaymentSchema,
  paymentIdSchema,
  idempotencyKeySchema,
} from "./payment.schemas.js";
import * as paymentService from "./payment.service.js";

export async function verifyPayment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = verifyPaymentSchema.parse(req.body);
    const result = await paymentService.verifyPayment(input);

    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getPaymentStatus(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    if (!id) {
      throw new AppError(400, "PAYMENT_ID_REQUIRED", "Payment ID is required.");
    }

    const payment = await paymentService.getPaymentStatus(id);

    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    next(error);
  }
}
