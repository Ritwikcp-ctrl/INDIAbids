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
