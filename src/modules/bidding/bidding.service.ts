import { prisma } from "../../lib/prisma";
import { AppError } from "../../lib/app-error";

import { paiseToInr } from "./bidding.money";

type QuoteInput = {
  businessId: string;
};
export async function getBidQuote(
  userId: string,
  boardId: string,
  input: QuoteInput
) {
  const board = await prisma.board.findUnique({
    where: {
      id: boardId,
    },
    select: {
      id: true,
      key: true,
      name: true,
      status: true,

      minBidPaise: true,
      bidIncrementPaise: true,
    },
  });

  if (!board) {
    throw new AppError(404, "BOARD_NOT_FOUND", "Board not found.");
  }

  if (board.status !== "ACTIVE") {
    throw new AppError(
      409,
      "BOARD_UNAVAILABLE",
      "This board is not currently acepting bids."
    );
  }

  const membership = await prisma.boardMembership.findUnique({
    where: {
      businessId_boardId: {
        businessId: input.businessId,
        boardId,
      },
    },

    select: {
      id: true,
      businessId: true,
      boardId: true,

      totalSpendPaise: true,
      lastBidAt: true,

      business: {
        select: {
          id: true,
          ownerId: true,
          name: true,
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
      "Business must be active before it can bid."
    );
  }

  const competitor = await prisma.boardMembership.findFirst({
    where: {
      boardId,

      businessId: {
        not: membership.businessId,
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
      id: true,
      totalSpendPaise: true,

      business: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  const currentSpend = membership.totalSpendPaise;

  let minimumAdditional = 0n;

  if (currentSpend == 0n) {
    minimumAdditional = board.minBidPaise;
  }

  if (competitor) {
    const targetSpend = competitor.totalSpendPaise + board.bidIncrementPaise;

    const additionalRequired =
      targetSpend > currentSpend ? targetSpend - currentSpend : 0n;

    if (additionalRequired > minimumAdditional) {
      minimumAdditional = additionalRequired;
    }
  }

  const alreadyLeading =
    competitor === null || currentSpend > competitor.totalSpendPaise;

  return {
    board: {
      id: board.id,
      key: board.key,
      name: board.name,
    },

    business: {
      id: membership.business.id,
      name: membership.business.name,
    },

    currentSpend: {
      paise: currentSpend.toString(),
      inr: paiseToInr(currentSpend),
    },

    competitor: competitor
      ? {
          businessId: competitor.business.id,

          businessName: competitor.business.name,

          totalSpend: {
            paise: competitor.totalSpendPaise.toString(),

            inr: paiseToInr(competitor.totalSpendPaise),
          },
        }
      : null,
    alreadyLeading,

    minimumAdditionalBid: {
      paise: minimumAdditional.toString(),

      inr: paiseToInr(minimumAdditional),
    },

    rules: {
      minimumFirstBidPaise: board.minBidPaise.toString(),
      bidIncrementPaise: board.bidIncrementPaise.toString(),
    },

    generatedAt: new Date().toISOString(),
  };
}

type LeaderboardEntry = {
  rank: number;

  business: {
    id: string;
    name: string;
    slug: string;
  };

  totalSpend: {
    paise: string;
    inr: string;
  };

  lastBidAt: string | null;
};

export async function getLeaderboard(
  boardId: string,
  limit: number
): Promise<{
  board: {
    id: string;
    key: string;
    name: string;
  };
  entries: LeaderboardEntry[];
}> {
  const board = await prisma.board.findUnique({
    where: {
      id: boardId,
    },

    select: {
      id: true,
      key: true,
      name: true,
      status: true,
    },
  });

  if (!board) {
    throw new AppError(404, "BOARD_NOT_FOUND", "Board not found.");
  }

  if (board.status !== "ACTIVE") {
    throw new AppError(404, "BOARD_NOT_FOUND", "Board not found.");
  }

  const membership = await prisma.boardMembership.findMany({
    where: {
      boardId,
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

    take: limit,

    select: {
      id: true,

      totalSpendPaise: true,
      lastBidAt: true,

      business: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  const entries: LeaderboardEntry[] = membership.map((membership, index) => ({
    rank: index + 1,

    business: {
      id: membership.business.id,
      name: membership.business.name,
      slug: membership.business.slug,
    },

    totalSpend: {
      paise: membership.totalSpendPaise.toString(),

      inr: paiseToInr(membership.totalSpendPaise),
    },

    lastBidAt: membership.lastBidAt?.toISOString() ?? null,
  }));

  return {
    board: {
      id: board.id,
      key: board.key,
      name: board.name,
    },
    entries,
  };
}

type ApplyVerifiedBidInput = {
  boardId: string;
  membershipId: string;
  paymentId: string;
  amountPaise: bigint;
};

export async function ApplyVerifiedBid(input: ApplyVerifiedBidInput) {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashextextended(${input.boardId},0)
        )`;

    const payment = await tx.payment.findUnique({
      where: {
        id: input.paymentId,
      },

      select: {
        id: true,
        businessId: true,
        amountPaise: true,
        status: true,

        bid: {
          select: {
            id: true,
            amountPaise: true,
            status: true,
          },
        },
      },
    });

    if (!payment) {
      throw new AppError(404, "PAYMENT_NOT_FOUND", "Payment not found.");
    }

    if (payment.bid) {
      return {
        alreadyApplied: true,
        bid: payment.bid,
      };
    }

    if (payment.status !== "SUCCEEDED") {
      throw new AppError(
        409,
        "PAYMENT_NOT_VERIFIED",
        "Payment has not been successfully verified."
      );
    }

    if (payment.amountPaise !== input.amountPaise) {
      throw new AppError(
        409,
        "PAYMENT_AMOUNT_MISMATCH",
        "Payment amount does not match the bid amount."
      );
    }

    if (input.amountPaise <= 0n) {
      throw new AppError(
        400,
        "INVALID_BID_AMOUNT",
        "Bid amount must be greater than zero."
      );
    }

    const membership = await tx.boardMembership.findUnique({
      where: {
        id: input.membershipId,
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

    if (!membership) {
      throw new AppError(
        404,
        "BOARD_MEMBERSHIP_NOT_FOUND",
        "Board membership not found."
      );
    }

    if (membership.boardId !== input.boardId) {
      throw new AppError(
        409,
        "BOARD_MISMATCH",
        "Membership does not belong to this board."
      );
    }

    if (membership.businessId !== payment.businessId) {
      throw new AppError(
        409,
        "PAYMENT_BUSINESS_MISMATCH",
        "Payment does not belong to this business."
      );
    }

    if(membership.board.status !== "ACTIVE") {
        throw new AppError (409,"BOARD_UNAVAILABLE","This board is no longer accepting bids.",

        );
    }

    if(membership.business.status !== "ACTIVE") {
        throw new AppError(
        409,"BUSINESS_NOT_ACTIVE","Business is not allowed to bid.",
    );
    }


    const competitor = await tx.boardMembership.findFirst({

    })
  });
}
