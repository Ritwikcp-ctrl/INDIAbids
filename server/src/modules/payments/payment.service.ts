import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../lib/app-error.js";
import { env } from "../../config/env.js";
import { logger } from "../../lib/logger.js";
import { razorpay } from "./razorpay.js";
import { verifyCheckoutSignature } from "./payment.crypto.js";
import { updateRedisLeaderboard } from "../../lib/redis.js";
import type {
  CreatePaymentOrderInput,
  VerifyPaymentInput,
} from "./payment.schemas.js";

function paymentExpiry(): Date {
  return new Date(Date.now() + env.PAYMENT_ORDER_TTL_MINUTES * 60 * 1000);
}

export type CapturedPaymentInput = {
  providerOrderId: string;
  providerPaymentId: string;
  amountPaise: bigint;
  currency: string;
};

/**
 * Reconcile a captured payment.
 * ACID transaction across Payment -> Bid -> BoardMembership.
 * FOR UPDATE on payment row + pg_advisory_xact_lock on membership serialises concurrent bidders.
 * After commit: updates Redis sorted set in O(log N).
 */
export async function reconcileCapturedPayment(input: CapturedPaymentInput) {
  // 1. Run ACID Postgres transaction
  const updatedMembership = await prisma.$transaction(async (tx) => {
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

    if (payment.status === "SUCCEEDED") {
      const mem = await tx.boardMembership.findUnique({
        where: { id: payment.membershipId },
        select: { id: true, boardId: true, businessId: true, totalSpendPaise: true, lastBidAt: true },
      });
      return { alreadyHandled: true, paymentId: payment.id, membership: mem };
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
      },
    });

    // Create Bid record
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

    return {
      alreadyHandled: false,
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
    select: { id: true, amountPaise: true, currency: true },
  });

  if (!payment) {
    throw new AppError(404, "PAYMENT_NOT_FOUND", "Payment record not found for this order.");
  }

  return reconcileCapturedPayment({
    providerOrderId: input.razorpayOrderId,
    providerPaymentId: input.razorpayPaymentId,
    amountPaise: payment.amountPaise,
    currency: payment.currency,
  });
}
