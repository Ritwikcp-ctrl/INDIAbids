import { Prisma } from "../../generated/prisma/client";

import { prisma } from "../../lib/prisma";
import { AppError } from "../../lib/app-error";

import {
  createFallbackBusinessSlug,
  createUniqueallbackSlug,
  slugify,
} from "../../lib/slug";

import type {
  CreateBusinessInput,
  UpdateBusinessInput,
} from "./business.schemas";

const businessSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,

  website: true,
  logoUrl: true,

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
  updateAt: true,
} as const;

// type CreateBusinessInput = {
//   name: string;
//   description?: string | null;
//   website?: string | null;
//   logoUrl?: string | null;
//   categoryId: string;
//   state?: string | null;
//   city?: string | null;
// };
// type UpdateBusinessInput = {
//   name?: string ;
//   description?: string ;
//   website: string ;
//   logoUrl: string ;
//   state: string ;
//   city: string ;
// };

export async function createBusiness(
  ownerId: string,
  input: CreateBusinessInput
) {
  const category = await prisma.category.findUnique({
    where: {
      id: input.categoryId,
    },

    select: {
      id: true,
    },
  });

  if (!category) {
    throw new AppError(
      404,
      "CATEGORY_NOT_FOUND",
      "Selected category does not exist."
    );
  }

  const baseSlug = slugify(input.name) || createFallbackBusinessSlug();

  let slug = baseSlug;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await prisma.business.create({
        data: {
          ownerId,
          categoryId: input.categoryId,

          name: input.name,
          slug,
          description: input.description ?? null,

          website: input.website ?? null,

          logoUrl: input.logoUrl ?? null,
          country: "IN",

          state: input.state ?? null,

          city: input.city ?? null,
          status: "PENDING",
        },

        select: businessSelect,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        slug = createUniqueallbackSlug(baseSlug);
        continue;
      }

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2003"
      ) {
        throw new AppError(
          404,
          "CATEGORY_NOT_FOUND",
          "Selected category does not exists."
        );
      }

      throw error;
    }
  }

  throw new AppError(
    500,
    "SLUG_GENERATION_FAILED",
    "Could not generate a unique business URL."
  );
}

export async function listMyBusinesses(ownerId: string) {
  return prisma.business.findMany({
    where: {
      ownerId,
    },
    orderBy: [
      {
        createdAt: "desc",
      },
      {
        id: "desc",
      },
    ],

    select: businessSelect,
  });
}

export async function getPublicBusinessBySlug(slug: string) {
  const business = await prisma.business.findFirst({
    where: {
      slug,
      status: "ACTIVE",
    },

    select: businessSelect,
  });

  if (!business) {
    throw new AppError(404, "BUSINESS_NOT_FOUND.", "Business not found.");
  }

  return business;
}

export async function updateBusiness(
  ownerId: string,
  businessId: string,
  input: UpdateBusinessInput
) {
  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.business.updateMany({
      where: {
        id: businessId,
        ownerId,

        status: {
          in: ["PENDING", "ACTIVE"],
        },
      },

      data: {
        ...(input.name !== undefined
          ? {
              name: input.name,
            }
          : {}),

        ...(input.description !== undefined
          ? {
              description: input.description,
            }
          : {}),

        ...(input.website !== undefined
          ? {
              website: input.website,
            }
          : {}),

        ...(input.logoUrl !== undefined
          ? {
              logoUrl: input.logoUrl,
            }
          : {}),

        ...(input.state !== undefined
          ? {
              state: input.state,
            }
          : {}),

        ...(input.city !== undefined
          ? {
              city: input.city,
            }
          : {}),
      },
    });

    if (updated.count !== 1) {
      throw new AppError(404, "BUSINESS_NOT_FOUND", "Business not found.");
    }

    return tx.business.findUnique({
      where: {
        id: businessId,
      },

      select: businessSelect,
    });
  });

  if (!result) {
    throw new AppError(404, "BUSINESS_NOT_FOUND", "Business not found.");
  }
  return result;
}
