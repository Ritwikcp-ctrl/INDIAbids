import { Prisma } from "../../generated/prisma/client";

import { prisma } from "../../lib/prisma";
import { AppError } from "../../lib/app-error";

import { createBoardKey } from "./board-key";
import type { CreateBoardInput, ListBoardsQuery } from "./board.schema";

const boardSelect = {
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

  createdAt: true,
  updatedA: true,
} as const;

export async function createfBoard(input: CreateBoardInput) {
  const category = await prisma.category.findUnique({
    where: {
      id: input.categoryId,
    },

    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  if (!category) {
    throw new AppError(
      404,
      "CATEGORY_NOT_FOUND",
      "Selected category does not exist."
    );
  }

  const key = createBoardKey({
    categorySlug: category.slug,
    country: input.country,
    state: input.state,
    city: input.city,
  });
  // const nameparts = [
  //    category.name,
  //    input.city,
  //    input.state,
  //    input.country === "IN"? "India":input.country,
  // ].filter(Boolean);

  const name = input.city
    ? `${category.name}-${input.city}`
    : input.state
      ? `${category.name}-${input.state}`
      : `${category.name}-India`;

  try {
    return await prisma.board.create({
      data: {
        categoryId: category.id,

        key,
        name,
        country: input.country,
        state: input.state ?? null,
        city: input.city ?? null,

        status: "ACTIVE",
      },
      select: boardSelect,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new AppError(
        409,
        "BOARD_ALREADY_EXIST",
        `Board "${name}" already exists.`
      );
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      throw new AppError(
        404,
        "CATEGORY_NOT_FOUND",
        "Selected category does not exist. "
      );
    }
    throw error;
  }
}

export async function listBoards(query: ListBoardsQuery) {
  return prisma.board.findMany({
    where: {
      status: "ACTIVE",
      ...(query.category
        ? {
            category: {
              slug: query.category,
            },
          }
        : {}),

      ...(query.state
        ? {
            state: {
              equals: query.state,
              mode: "insensitive",
            },
          }
        : {}),

      ...(query.city
        ? {
            city: {
              equals: query.city,
              mode: "insensitive",
            },
          }
        : {}),
    },

    orderBy: {
      name: "asc",
    },

    select: boardSelect,
  });
}

export async function getBoardByKey(key: string) {
  const board = await prisma.board.findFirst({
    where: {
      key,
      status: "ACTIVE",
    },
    select: boardSelect,
  });

  if (!board) {
    throw new AppError(404, "BOARD_NOT_FOUND", "Board not found.");
  }

  return board;
}
