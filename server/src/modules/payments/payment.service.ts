import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../lib/app-error.js";
import { verifyCheckoutSignature } from "./payment.crypto.js";
import { updateRedisLeaderboard } from "../../lib/redis.js";
import type { VerifyPaymentInput } from "./payment.schemas.js";

export type CapturedPaymentInput = {
  providerOrderId: string;
  providerPaymentId: string;
  amountPaise: bigint;
  currency: string;
  webhookEvent?: {
    provider: string;
    eventId: string;
    eventType: string;
  };
};

/**
 * Reconcile a captured payment.
 * ACID transaction across PaymentWebhookEvent -> Payment -> Bid -> BoardMembership.
 * FOR UPDATE on payment row + pg_advisory_xact_lock on membership serialises concurrent bidders.
 * After commit: updates Redis sorted set in O(log N).
 */
export async function reconcileCapturedPayment(input: CapturedPaymentInput) {
  // 1. Run ACID Postgres transaction
  const updatedMembership = await prisma.$transaction(async (tx) => {
    if (input.webhookEvent) {
      const existingEvent = await tx.paymentWebhookEvent.findUnique({
        where: {
          provider_eventId: {
            provider: input.webhookEvent.provider,
            eventId: input.webhookEvent.eventId,
          },
        },
        select: { id: true },
      });

      if (existingEvent) {
        return {
          alreadyHandled: true,
          duplicateWebhook: true,
          paymentId: null as string | null,
          membership: null,
        };
      }
    }

    // Row lock on payment row
    const payments = await tx.$queryRaw<
      Array<{
        id: string;
        businessId: string;
        membershipId: string;
        amountPaise: bigint;
        currency: string;
        status: string;
        providerPaymentId: string | null;
      }>
    >`
      SELECT id, "businessId", "membershipId", "amountPaise", currency, status, "providerPaymentId"
      FROM "Payment"
      WHERE "providerOrderId" = ${input.providerOrderId}
      FOR UPDATE
    `;

    const payment = payments[0];
    if (!payment) {
      throw new AppError(404, "PAYMENT_NOT_FOUND", "Local payment record was not found.");
    }

    if (payment.amountPaise !== input.amountPaise) {
      throw new AppError(
        400,
        "AMOUNT_MISMATCH",
        "Captured payment amount does not match order amount."
      );
    }

    if (payment.currency !== input.currency) {
      throw new AppError(
        400,
        "CURRENCY_MISMATCH",
        "Captured payment currency does not match order currency."
      );
    }

    if (payment.status === "SUCCEEDED") {
      if (input.webhookEvent) {
        await tx.paymentWebhookEvent.create({
          data: {
            provider: input.webhookEvent.provider,
            eventId: input.webhookEvent.eventId,
            eventType: input.webhookEvent.eventType,
            providerOrderId: input.providerOrderId,
            providerPaymentId: input.providerPaymentId,
            status: "PROCESSED",
            processedAt: new Date(),
          },
        });
      }

      const mem = await tx.boardMembership.findUnique({
        where: { id: payment.membershipId },
        select: {
          id: true,
          boardId: true,
          businessId: true,
          totalSpendPaise: true,
          lastBidAt: true,
        },
      });
      return {
        alreadyHandled: true,
        duplicateWebhook: false,
        paymentId: payment.id,
        membership: mem,
      };
    }

    if (payment.status === "REFUNDED" || payment.status === "REFUND_PENDING") {
      throw new AppError(409, "PAYMENT_REFUNDED", "Cannot reconcile a refunded payment.");
    }

    // Serialise concurrent bidders on the same membership/board using advisory lock
    await tx.$executeRaw`
      SELECT pg_advisory_xact_lock(hashtextextended(${payment.membershipId}, 0))
    `;

    // Update payment record to SUCCEEDED
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: "SUCCEEDED",
        providerPaymentId: input.providerPaymentId,
        failureReason: null,
      },
    });

    // Create Bid record idempotently
    const existingBid = await tx.bid.findUnique({
      where: { paymentId: payment.id },
    });

    if (!existingBid) {
      await tx.bid.create({
        data: {
          membershipId: payment.membershipId,
          paymentId: payment.id,
          amountPaise: payment.amountPaise,
          status: "ACTIVE",
        },
      });
    }

    // Increment BoardMembership spend
    const membership = await tx.boardMembership.update({
      where: { id: payment.membershipId },
      data: {
        totalSpendPaise: {
          increment: payment.amountPaise,
        },
        lastBidAt: new Date(),
      },
      select: {
        id: true,
        boardId: true,
        businessId: true,
        totalSpendPaise: true,
        lastBidAt: true,
      },
    });

    if (input.webhookEvent) {
      await tx.paymentWebhookEvent.create({
        data: {
          provider: input.webhookEvent.provider,
          eventId: input.webhookEvent.eventId,
          eventType: input.webhookEvent.eventType,
          providerOrderId: input.providerOrderId,
          providerPaymentId: input.providerPaymentId,
          status: "PROCESSED",
          processedAt: new Date(),
        },
      });
    }

    return {
      alreadyHandled: false,
      duplicateWebhook: false,
      paymentId: payment.id,
      membership,
    };
  });

  // 2. AFTER COMMIT -> Redis ZADD!
  // Money never lives only in Redis.
  if (updatedMembership?.membership) {
    const { boardId, businessId, totalSpendPaise, lastBidAt } = updatedMembership.membership;
    await updateRedisLeaderboard(boardId, businessId, totalSpendPaise, lastBidAt);
  }

  return {
    success: true,
    paymentId: updatedMembership.paymentId,
    alreadyHandled: updatedMembership.alreadyHandled,
    duplicateWebhook: updatedMembership.duplicateWebhook,
  };
}

export async function getPaymentStatus(paymentId: string) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    select: {
      id: true,
      status: true,
      amountPaise: true,
      currency: true,
      providerOrderId: true,
      providerPaymentId: true,
      businessId: true,
      membershipId: true,
      createdAt: true,
      membership: {
        select: {
          boardId: true,
          totalSpendPaise: true,
          board: {
            select: {
              id: true,
              name: true,
              key: true,
              scope: true,
              state: true,
            },
          },
        },
      },
    },
  });

  if (!payment) {
    throw new AppError(404, "PAYMENT_NOT_FOUND", "Payment not found.");
  }

  return {
    id: payment.id,
    status: payment.status,
    amountPaise: payment.amountPaise.toString(),
    currency: payment.currency,
    providerOrderId: payment.providerOrderId,
    providerPaymentId: payment.providerPaymentId,
    businessId: payment.businessId,
    boardId: payment.membership.boardId,
    board: payment.membership.board,
    createdAt: payment.createdAt.toISOString(),
  };
}

export async function verifyPayment(input: VerifyPaymentInput) {
  const valid = verifyCheckoutSignature(
    input.razorpayOrderId,
    input.razorpayPaymentId,
    input.razorpaySignature
  );

  if (!valid) {
    throw new AppError(400, "SIGNATURE_INVALID", "Payment signature verification failed.");
  }

  const payment = await prisma.payment.findUnique({
    where: { providerOrderId: input.razorpayOrderId },
    select: { id: true, amountPaise: true, currency: true, status: true },
  });

  if (!payment) {
    throw new AppError(404, "PAYMENT_NOT_FOUND", "Payment record not found for this order.");
  }

  if (payment.status === "FAILED") {
    throw new AppError(409, "PAYMENT_FAILED", "This payment order has already failed.");
  }

  return reconcileCapturedPayment({
    providerOrderId: input.razorpayOrderId,
    providerPaymentId: input.razorpayPaymentId,
    amountPaise: payment.amountPaise,
    currency: payment.currency,
  });
}

export function isPrismaUniqueViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}
