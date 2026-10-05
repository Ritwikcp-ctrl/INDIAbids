import type { Request, Response, NextFunction } from "express";

import { AppError } from "../../lib/app-error";
import { verifyWebhookSignature } from "./payment.crypto";

import { reconcileCapturedPayment } from "./payment.service";

import { prisma } from "../../lib/prisma";

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
      throw new AppError(
        400,
        "RAW_BODY_REQUIRED",
        "Raw webhook body is required."
      );
    }

    const signature = req.get("X-Razorpay-signature");

    if (!signature) {
      throw new AppError(
        400,
        "WEBHOOK_SIGNATURE_REQUIRED",
        "Webhook signature is required."
      );
    }

    const valid = verifyWebhookSignature(rawBody, signature);

    if (!valid) {
      throw new AppError(
        401,
        "WEBHOOK_SIGNATURE_INVALID",
        "Webhook signature is invalid."
      );
    }

    const eventId = req.get("x-razorpay-event-id");

    if (!eventId) {
      throw new AppError(
        400,
        "WEBHOOK_EVENT_ID_REQUIRED",
        "Webhook event ID is required."
      );
    }

    const payload = JSON.parse(rawBody.toString("utf8")) as RazorpayWebhook;

    const eventType = payload.event;

    if (!eventType) {
      throw new AppError(
        400,
        "WEBHOOK_EVENT_INVALID",
        "Webhook event type is missing."
      );
    }

    const providerPaymentId = payload.payload?.payment?.entity?.id;

    const providerOrderId = payload.payload?.payment?.entity?.order_id;

    const existingEvent = await prisma.paymentWebhookEvent.findUnique({
      where: {
        provider_eventId: {
          provider: "razorpay",
          eventId,
        },
      },
    });

    if (existingEvent) {
      res.status(200).json({
        received: true,
        duplicate: true,
      });
      return;
    }

    if (eventType !== "payment.captured" && eventType !== "payment.failed") {
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

      res.status(200).json({
        received: true,
        ignored: true,
      });
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
            providerPaymentId: null,

            status: {
              in: ["CREATED", "PENDING"],
            },
          },

          data: {
            status: "FAILED",
          },
        });
      });

      res.status(200).json({
        received: true,
      });
      return;
    }

    const entity = payload.payload?.payment?.entity;

    if (!entity) {
      throw new AppError(
        400,
        "WEBHOOK_PAYMENT_DATA_INVALID",
        "Payment entity is missing."
      );
    }

    const amount = entity.amount;
    const currency = entity.currency;

    if (
      typeof amount !== "number" ||
      !Number.isSafeInteger(amount) ||
      amount <= 0 ||
      typeof currency !== "string" ||
      !currency
    ) {
      throw new AppError(
        400,
        "WEBHOOK_PAYMENT_DATA_INVALID",
        "Payment amount or currency is invalid."
      );
    }

    const result = await prisma.$transaction(async (tx) => {
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

      return reconcileCapturedPayment({
        providerOrderId,
        providerPaymentId,

        amountPaise: BigInt(amount),

        currency,
      });
    });

    res.status(200).json({
      received: true,
      status: result.refundRequired ? "REFUND_PENDING" : "SUCCEEDED",
    });
  } catch (error) {
    next(error);
  }
}
