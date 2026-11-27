import type { Request, Response, NextFunction } from "express";
import { AppError } from "../../lib/app-error.js";
import { verifyWebhookSignature } from "./payment.crypto.js";
import {
  isPrismaUniqueViolation,
  reconcileCapturedPayment,
} from "./payment.service.js";
import { prisma } from "../../lib/prisma.js";
import { logger } from "../../lib/logger.js";

type RazorpayWebhook = {
  event: string;
  payload?: {
    payment?: {
      entity?: {
        id?: string;
        order_id?: string;
        amount?: number;
        currency?: string;
        status?: string;
        captured?: boolean;
      };
    };
  };
};

export async function handleRazorpayWebhook(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const rawBody = req.rawBody;
    if (!rawBody) {
      throw new AppError(400, "RAW_BODY_REQUIRED", "Raw webhook body is required.");
    }

    const signature = req.get("x-razorpay-signature") || req.get("X-Razorpay-Signature");
    if (!signature) {
      throw new AppError(400, "WEBHOOK_SIGNATURE_REQUIRED", "Webhook signature is required.");
    }

    const valid = verifyWebhookSignature(rawBody, signature);
    if (!valid) {
      throw new AppError(401, "WEBHOOK_SIGNATURE_INVALID", "Webhook signature is invalid.");
    }

    const eventId = req.get("x-razorpay-event-id") || req.get("X-Razorpay-Event-Id");
    if (!eventId) {
      throw new AppError(400, "WEBHOOK_EVENT_ID_REQUIRED", "Webhook event ID is required.");
    }

    const payload = JSON.parse(rawBody.toString("utf8")) as RazorpayWebhook;
    const eventType = payload.event;

    if (!eventType) {
      throw new AppError(400, "WEBHOOK_EVENT_INVALID", "Webhook event type is missing.");
    }

    const providerPaymentId = payload.payload?.payment?.entity?.id;
    const providerOrderId = payload.payload?.payment?.entity?.order_id;

    if (eventType !== "payment.captured" && eventType !== "payment.failed") {
      try {
        await prisma.paymentWebhookEvent.create({
          data: {
            provider: "razorpay",
            eventId,
            eventType,
            providerOrderId: providerOrderId ?? null,
            providerPaymentId: providerPaymentId ?? null,
            status: "IGNORED",
            processedAt: new Date(),
          },
        });
      } catch (err) {
        if (isPrismaUniqueViolation(err)) {
          res.status(200).json({ received: true, duplicate: true });
          return;
        }
        throw err;
      }

      res.status(200).json({ received: true, ignored: true });
      return;
    }

    if (!providerPaymentId || !providerOrderId) {
      throw new AppError(
        400,
        "WEBHOOK_PAYMENT_DATA_MISSING",
        "Payment or order ID is missing from the webhook."
      );
    }

    if (eventType === "payment.failed") {
      try {
        await prisma.$transaction(async (tx) => {
          await tx.paymentWebhookEvent.create({
            data: {
              provider: "razorpay",
              eventId,
              eventType,
              providerOrderId,
              providerPaymentId,
              status: "PROCESSED",
              processedAt: new Date(),
            },
          });

          await tx.payment.updateMany({
            where: {
              providerOrderId,
              status: { in: ["CREATED", "PENDING"] },
            },
            data: { status: "FAILED" },
          });
        });
      } catch (err) {
        if (isPrismaUniqueViolation(err)) {
          res.status(200).json({ received: true, duplicate: true });
          return;
        }
        throw err;
      }

      res.status(200).json({ received: true, status: "FAILED" });
      return;
    }

    const entity = payload.payload?.payment?.entity;
    const amount = entity?.amount;
    const currency = entity?.currency || "INR";

    if (typeof amount !== "number" || !Number.isInteger(amount) || amount <= 0) {
      throw new AppError(400, "WEBHOOK_PAYMENT_DATA_INVALID", "Invalid payment amount.");
    }

    // Reconcile captured payment + record webhook event atomically inside Postgres transaction
    try {
      const result = await reconcileCapturedPayment({
        providerOrderId,
        providerPaymentId,
        amountPaise: BigInt(amount),
        currency,
        webhookEvent: {
          provider: "razorpay",
          eventId,
          eventType,
        },
      });

      if (result.duplicateWebhook) {
        res.status(200).json({ received: true, duplicate: true });
        return;
      }

      res.status(200).json({
        received: true,
        status: "SUCCEEDED",
        alreadyHandled: result.alreadyHandled,
      });
    } catch (err) {
      if (isPrismaUniqueViolation(err)) {
        res.status(200).json({ received: true, duplicate: true });
        return;
      }
      throw err;
    }
  } catch (error) {
    logger.error({ error }, "Error handling Razorpay webhook");
    next(error);
  }
}
