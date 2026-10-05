import { Prisma } from "../../generated/prisma/client";
import { hasPrismaErrorCode } from "./board.service";

import { prisma } from "../../lib/prisma";
import { AppError } from "../../lib/app-error";

import type { JoinBoardInput } from "./membership.schemas";

const membershipSelect = {
  id: true,

  business: {
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,

      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      country: true,
      state: true,
      city: true,
    },
  },

  board: {
    select: {
      id: true,
      key: true,
      name: true,
      country: true,
      state: true,
      city: true,
      status: true,

      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  },
  createdAt: true,
  updatedAt: true,
} as const;

function normalizeLocation(value: string | null): string | null {
  return value?.trim().toLowerCase() ?? null;
}

function validateGeographicEligibility(
  business: {
    country: string;
    state: string | null;
    city: string | null;
  },
  board: {
    country: string | null;
    state: string | null;
    city: string | null;
  }
): void {
  if (
    board.country &&
    normalizeLocation(business.country) !== normalizeLocation(board.country)
  ) {
    throw new AppError(
      409,
      "BUSINESS_OUTSIDE_BOARD",
      "Business is not eligible for this board."
    );
  }

  if (
    board.state &&
    normalizeLocation(business.state) !== normalizeLocation(board.state)
  ) {
    throw new AppError(
      409,
      "BUSINESS_OUTSIDE_BOARD",
      "Business is not eligible for this board."
    );
  }

  if (
    board.city &&
    normalizeLocation(business.city) !== normalizeLocation(board.city)
  ) {
    throw new AppError(
      409,
      "BUSINESS_OUTSIDE_BOARD",
      "Business is not eligble for this board."
    );
  }
}

export async function joinBoard(
  userId: string,
  boardId: string,
  input: JoinBoardInput
) {
  const business = await prisma.business.findUnique({
    where: {
      id: input.businessId,
    },

    select: {
      id: true,
      ownerId: true,
      status: true,

      categoryId: true,

      country: true,
      state: true,
      city: true,
    },
  });

  if (!business) {
    throw new AppError(404, "BUSINESS_NOT_FOUND", "Business not found.");
  }

  const board = await prisma.board.findUnique({
    where: {
      id: boardId,
    },

    select: {
      id: true,
      categoryId: true,

      country: true,
      state: true,
      city: true,

      status: true,
    },
  });

  if (!board) {
    throw new AppError(
      404,
      "BOARD_UNAVAILABLE",
      "This board is not currently accepting memberships."
    );
  }

  if (business.categoryId !== board.categoryId) {
    throw new AppError(
      409,
      "CATEGORY_MISMATCH",
      "Business category does not match the board."
    );
  }

  validateGeographicEligibility(business, board);

  try {
    const membership = await prisma.boardMembership.upsert({
      where: {
        businessId_boardId: {
          businessId: business.id,
          boardId: board.id,
        },
      },
      update: {},

      create: {
        businessId: business.id,
        boardId: board.id,
      },

      select: membershipSelect,
    });

    return membership;
  } catch (error) {
    if (hasPrismaErrorCode(error) && error.code === "P2002") {
      const existing = await prisma.boardMembership.findUnique({
        where: {
          businessId_boardId: {
            businessId: business.id,
            boardId: board.id,
          },
        },

        select: membershipSelect,
      });

      if (existing) {
        return existing;
      }

      throw error;
    }
  }
}
