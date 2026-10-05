import { Prisma } from "../../generated/prisma/client";

import { prisma } from "../../lib/prisma";
import { AppError } from "../../lib/app-error";

import { env } from "../../config/env";

import { razorpay } from "./razorpay";
import { verifyCheckoutSignature } from "./payment.crypto";
import { getBidQuote } from "../bidding/bidding.service";

import type {
  CreatePaymentOrderInput,
  VerifyPaymentInput,
} from "./payment.schemas";

function toSafeNumber(value: bigint): number {
  const numbervalue = Number(value);

  if (!Number.isSafeInteger(numbervalue)) {
    throw new AppError(
      400,
      "PAYMENT_AMOUNT_TOO_LARGE",
      "Payment amount is outside the supported range."
    );
  }
  return numbervalue;
}

function paymentExpiray(): Date {
  return new Date(Date.now() + env.PAYMENT_ORDER_TTL_MINUTES * 60 * 1000);
}

export async function createPaymentOrder(
  userId: string,
  input: CreatePaymentOrderInput,
  idempotencyKey: string
) {
  const existing = await prisma.payment.findUnique({
    where: {
      idempotencyKey,
    },

    select: {
      id: true,
      businessId: true,
      membershipId: true,
      initiatedById: true,

      provider: true,
      providerOrderId: true,

      amountPaise: true,
      currency: true,

      status: true,
      expiresAt: true,

      providerPaymentId: true,
      providerRefundId: true,
    },
  });

  if (existing) {
    if (existing.initiatedById !== userId) {
      throw new AppError(
        409,
        "IDEMPOTENCY_KEY_REUSED",
        "This idempotency key belongs to another request."
      );
    }

    if (
      existing.businessId !== input.businessId ||
      existing.amountPaise !== input.amountPaise
    ) {
      throw new AppError(
        409,
        "IDEMPOTENCY_KEY_REUSED",
        "Idempotency key was already used with different payment parameters."
      );
    }

    return {
      replayed: true,
      payment: existing,
    };
  }

  const membership = await prisma.boardMembership.findUnique({
    where: {
      businessId_boardId: {
        businessId: input.businessId,
        boardId: input.boardId,
      },
    },

    select: {
      id: true,
      businessId: true,
      boardId: true,

      business: {
        select: {
          id: true,
          ownerId: true,
          status: true,
        },
      },

      board: {
        select: {
          id: true,
          status: true,
        },
      },
    },
  });

  if (!membership) {
    throw new AppError(
      404,
      "BOARD_MEMBERSHIP_NOT_FOUND",
      "Business has not joined this board."
    );
  }

  if (membership.business.ownerId !== userId) {
    throw new AppError(404, "BUSINESS_NOT_FOUND", "Business not found.");
  }

  if (membership.business.status !== "ACTIVE") {
    throw new AppError(
      409,
      "BUSINESS_NOT_ACTIVE",
      "Business must be active before making a payment."
    );
  }

  if (membership.board.status !== "ACTIVE") {
    throw new AppError(
      409,
      "BOARD_UNAVAILABLE",
      "This board is not accepting bids."
    );
  }

  const quote = await getBidQuote(userId, input.boardId, {
    businessId: input.businessId,
  });

  const minimumAdditional = BigInt(quote.minimumAdditionalBid.paise);

  if (input.amountPaise < minimumAdditional) {
    throw new AppError(
      409,
      "BID_AMOUNT_TOO_LOW",
      "The requested payment is below the current minimum bid.",
      {
        minimumAdditionalPaise: minimumAdditional.toString(),
      }
    );
  }

  const localPayment = await prisma.payment.create({
    data: {
      businessId: input.businessId,

      membershipId: membership.id,

      initiatedById: userId,

      provider: "razorpay",
      idempotencyKey,

      amountPaise: input.amountPaise,

      currency: "INR",
      status: "CREATED",

      expiresAt: paymentExpiray(),
    },
  });

  const amount = toSafeNumber(input.amountPaise);
  try {
    const order = await razorpay.orders.create({
      amount,
      currency: "INR",

      receipt: `bid_${localPayment.id}`,

      notes: {
        paymentId: localPayment.id,
        businessId: input.businessId,
        boardId: input.boardId,
      },
    });

    const updated = await prisma.payment.update({
      where: {
        id: localPayment.id,
      },

      data: {
        providerOrderId: order.id,
        status: "PENDING",
      },

      select: {
        id: true,
        provider: true,
        providerOrderId: true,

        amountPaise: true,
        currency: true,

        status: true,
        expiresAt: true,
      },
    });

    return {
      replayed: false,

      payment: {
        id: updated.id,
        provider: updated.provider,
        orderId: updated.providerOrderId,
        keyId: env.RAZORPAY_KEY_ID,
        amountPaise: updated.amountPaise.toString(),
        currency: updated.currency,
        status: updated.status,
        expiresAt: updated.expiresAt?.toISOString() ?? null,
      },
    };
  } catch (error) {
    await prisma.payment.update({
      where: {
        id: localPayment.id,
      },
      data: {
        status: "FAILED",
        failureReason:
          error instanceof Error
            ? error.message
            : "Razorpay order creation failed.",
      },
    });

    throw new AppError(
      502,
      "PAYMENT_PROVIDER_ERROR",
      "Payment provider could not create the role."
    );
  }
}

type CapturedPaymentInput = {
  providerOrderId: string;
  providerPaymentId: string;
  amountPaise: bigint;
  currency: string;
};

async function refundCapturedPayment(
  paymentId: string,
  providerPaymentId: string,
  amountPaise: bigint,
  reason: string
): Promise<void> {
  try {
    const refund = await razorpay.payments.refund(providerPaymentId, {
      amount: Number(amountPaise),
      notes: {
        paymentId,
        reason,
      },
    });

    await prisma.payment.update({
      where: {
        id: paymentId,
      },
      data: {
        status: "REFUNDED",

        providerRefundId: refund.id,

        refundReason: reason,
        refundedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Razorpay refund failed", {
      paymentId,
      providerPaymentId,
      error,
    });
  }
}

export async function reconcileCapturedPayment(input: CapturedPaymentInput) {
  const result = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: {
        provider_providerOrderId: {
          provider: "RAZORPAY",
          providerOrderId: input.providerOrderId,
        },
      },

      select: {
        id: true,
        businessId: true,
        membershipId: true,

        amountPaise: true,
        currency: true,

        status: true,

        providerPaymentId: true,

        membership: {
          select: {
            id: true,
            boardId: true,
          },
        },

        bid: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!payment) {
      throw new AppError(
        404,
        "PAYMENT_NOT_FOUND",
        "Local payment record was not found."
      );
    }

    if (payment.amountPaise !== input.amountPaise) {
      throw new AppError(
        409,
        "PAYMENT_AMOUNT_MISMATCH",
        "Provider payment amount does not match the local payment."
      );
    }

    if (payment.currency !== input.currency) {
      throw new AppError(
        409,
        "PAYMENT_CURRENCY_MISMATCH",
        "Provider payment currency does not match the local payment."
      );
    }

    if (
      payment.providerPaymentId &&
      payment.providerPaymentId !== input.providerPaymentId
    ) {
      throw new AppError(
        409,
        "PAYMENT_ID_MISMATCH",
        "Payment provider identifier does not match."
      );
    }

    if (payment.status === "REFUNDED" || payment.status === "REFUND_PENDING") {
      return {
        alreadyHandled: true,
        refundRequired: true,
        paymentId: payment.id,
        providerPaymentId: input.providerPaymentId,
        amountPaise: payment.amountPaise,
      };
    }

    if (payment.bid) {
      await tx.payment.update({
        where: {
          id: payment.id,
        },

        data: {
          status: "SUCCEEDED",

          providerPaymentId: input.providerPaymentId,
        },
      });

      return {
        alreadyHandled: true,
        refundRequired: false,
        paymentId: payment.id,
        providerPaymentId: input.providerPaymentId,
        amountPaise: payment.amountPaise,
      };
    }

    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${payment.membership.boardId}, 0)
        )
        `;
    const currentMembership = await tx.boardMembership.findUnique({
      where: {
        id: payment.membershipId,
      },

      select: {
        id: true,
        boardId: true,
        businessId: true,

        totalSpendPaise: true,

        business: {
          select: {
            id: true,
            status: true,
          },
        },

        board: {
          select: {
            id: true,
            status: true,

            minBidPaise: true,
            bidIncrementPaise: true,
          },
        },
      },
    });

    if (!currentMembership) {
      throw new AppError(
        404,
        "BOARD_MEMBERSHIP_NOT_FOUND",
        "Board membership no longer exists."
      );
    }

    if (currentMembership.business.status !== "ACTIVE") {
      throw new AppError(
        409,
        "BUSINESS_NOT_ACTIVE",
        "Business is no longer active."
      );
    }

    if (currentMembership.board.status !== "ACTIVE") {
      throw new AppError(
        409,
        "BOARD_UNAVAILABLE",
        "Board is no longer accepting bids."
      );
    }

    const competitor = await tx.boardMembership.findFirst({
      where: {
        boardId: currentMembership.boardId,

        id: {
          not: currentMembership.id,
        },

        totalSpendPaise: {
          gt: 0n,
        },

        business: {
          status: "ACTIVE",
        },
      },

      orderBy: [
        {
          totalSpendPaise: "desc",
        },
        {
          lastBidAt: "asc",
        },
        {
          id: "asc",
        },
      ],

      select: {
        totalSpendPaise: true,
      },
    });

    let minimumAdditional = 0n;

    if (currentMembership.totalSpendPaise === 0n) {
      minimumAdditional = currentMembership.board.minBidPaise;
    }

    if (competitor) {
      const targetSpend =
        competitor.totalSpendPaise + currentMembership.board.bidIncrementPaise;

      const required =
        targetSpend > currentMembership.totalSpendPaise
          ? targetSpend - currentMembership.totalSpendPaise
          : 0n;

      if (required > minimumAdditional) {
        minimumAdditional = required;
      }
    }

    if (input.amountPaise < minimumAdditional) {
      await tx.payment.update({
        where: {
          id: payment.id,
        },

        data: {
          status: "REFUND_PENDING",

          providerPaymentId: input.providerPaymentId,

          refundReason: "Bid quote became stale before payment was captured. ",
        },
      });

      return {
        alreadyHandled: false,

        refundRequired: true,

        paymentId: payment.id,

        providerPaymentId: input.providerPaymentId,

        amountPaise: payment.amountPaise,
      };
    }

    await tx.payment.update({
      where: {
        id: payment.id,
      },

      data: {
        status: "SUCCEEDED",

        providerPaymentId: input.providerPaymentId,
      },
    });

    const bid = await tx.bid.create({
      data: {
        membershipId: currentMembership.id,

        paymentId: payment.id,
        amountPaise: input.amountPaise,

        status: "ACTIVE",
      },

      select: {
        id: true,
        membershipId: true,
        paymentId: true,
        amountPaise: true,
        status: true,
        createdAt: true,
      },
    });

    const membership = await tx.boardMembership.update({
      where: {
        id: currentMembership.id,
      },

      data: {
        totalSpendPaise: {
          increment: input.amountPaise,
        },

        lastBidAt: new Date(),
      },

      select: {
        id: true,
        totalSpendPaise: true,
        lastBidAt: true,
      },
    });

    return {
      alreadyHandled: false,

      refundeRequired: false,

      paymentId: payment.id,

      providerPaymentId: input.providerPaymentId,

      amountPaise: payment.amountPaise,

      bidId: bid.id,

      totalSpendPaise: membership.totalSpendPaise,
    };
  });

  if (result.refundRequired && result.paymentId && result.providerPaymentId) {
    await refundCapturedPayment(
      result.paymentId,
      result.providerPaymentId,
      result.amountPaise,
      "Bid quote became stale bofore payment was captured."
    );
  }
  return result;
}

type RazorpayPaymentResponse = {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: string;
  captured?: boolean;
};

export async function verifyPaymentForUser(
  userId: string,
  input: VerifyPaymentInput
) {
  const payment = await prisma.payment.findUnique({
    where: {
      provider_providerOrderId: {
        provider: "RAZORPAY",
        providerOrderId: input.razorpayOrderId,
      },
    },

    select: {
      id: true,
      initiatedById: true,

      providerOrderId: true,
      providerPaymentId: true,

      amountPaise: true,
      currency: true,

      status: true,
    },
  });

  if (!payment) {
    throw new AppError(404, "PAYMENT_NOT_FOUND", "Payment not found.");
  }

  if (payment.initiatedById !== userId) {
    throw new AppError(404, "PAYMENT_NOT_FOUND", "Payment not found.");
  }

  if (!payment.providerOrderId) {
    throw new AppError(
      409,
      "PAYMENT_ORDER_MISSING",
      "Payment order has not been created."
    );
  }

  const validSignature = verifyCheckoutSignature(
    payment.providerOrderId,
    input.razorpayPaymentId,
    input.razorpaySignature
  );

  if (!validSignature) {
    throw new AppError(
      400,
      "PAYMENT_SIGNATURE_INVALID",
      "Payment signature is invalid."
    );
  }

  const providerPayment = (await razorpay.payments.fetch(
    input.razorpayPaymentId
  )) as unknown as RazorpayPaymentResponse;

  if (providerPayment.order_id !== payment.providerOrderId) {
    throw new AppError(
      409,
      "PAYMENT_ORDER_MISMATCH",
      "Provider payment does not belong to this order."
    );
  }

  if (providerPayment.amount !== toSafeNumber(payment.amountPaise)) {
    throw new AppError(
      409,
      "PAYMENT_AMOUNT_MISMATCH",
      "Provider payment amount does not match the order."
    );
  }

  if (providerPayment.currency !== payment.currency) {
    throw new AppError(
      409,
      "PAYMENT_CURRENCY_MISMATCH",
      "Provider payment currency does not match the order."
    );
  }

  if (providerPayment.status === "failed") {
    await prisma.payment.update({
      where: {
        id: payment.id,
      },

      data: {
        status: "FAILED",
      },
    });

    return {
      status: "FAILED",
    };
  }

  if (
    providerPayment.status !== "captured" &&
    providerPayment.captured !== true
  ) {
    return {
      status: "PENDING",
    };
  }

  const result = await reconcileCapturedPayment({
    providerOrderId: payment.providerOrderId,

    providerPaymentId: providerPayment.id,

    amountPaise: payment.amountPaise,

    currency: payment.currency,
  });

  return {
    status: result.refundRequired ? "REFUND_PENDING" : "SUCCEEDED",

    bidId: "bidId" in result ? result.bidId : undefined,
  };
}

export async function getPaymentForUser(userId: string, paymentId: string) {
  const payment = await prisma.payment.findUnique({
    where: {
      id: paymentId,
    },

    select: {
      id: true,
      initiatedById: true,

      provider: true,
      providerOrderId: true,
      providerPaymentId: true,

      amountPaise: true,
      currency: true,

      status: true,

      failureReason: true,
      providerRefundId: true,
      refundReason: true,
      refundedAt: true,

      expiresAt: true,

      createdAt: true,
      updatedAt: true,

      bid: {
        select: {
          id: true,
          status: true,
          amountPaise: true,
          createdAt: true,
        },
      },
    },
  });

  if (!payment || payment.initiatedById !== userId) {
    throw new AppError(404, "PAYMENT_NOT_FOUND", "Payment not found.");
  }

  return {
    id: payment.id,

    provider: payment.provider,

    providerOrderId: payment.providerOrderId,

    providerPaymentId: payment.providerPaymentId,

    amountPaise: payment.amountPaise.toString(),

    currency: payment.currency,

    status: payment.status,

    failureReason: payment.failureReason,

    providerRefundId: payment.providerRefundId,

    refundReason: payment.refundReason,

    refundedAt: payment.refundedAt?.toISOString() ?? null,

    expiresAt: payment.expiresAt?.toISOString() ?? null,

    createdAt: payment.createdAt.toISOString(),

    updatedAt: payment.updatedAt.toISOString(),

    bid: payment.bid
      ? {
          id: payment.bid.id,
          status: payment.bid.status,

          amountPaise: payment.bid.amountPaise.toString(),

          createdAt: payment.bid.createdAt.toISOString(),
        }
      : null,
  };
}
