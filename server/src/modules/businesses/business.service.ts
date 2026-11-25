import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../lib/app-error.js";
import { hashManageToken } from "../../lib/manage-token.js";
import { getBusinessRank } from "../../lib/redis.js";
import {
  createFallbackBusinessSlug,
  createUniqueallbackSlug,
  slugify,
} from "../../lib/slug.js";

import type {
  CreateBusinessInput,
  UpdateBusinessInput,
} from "./business.schemas.js";

export const businessSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  website: true,
  contactEmail: true,
  contactPhone: true,
  logoUrl: true,
  country: true,
  state: true,
  city: true,
  status: true,
  ownerId: true,
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
  memberships: {
    select: {
      id: true,
      totalSpendPaise: true,
      lastBidAt: true,
      board: {
        select: {
          id: true,
          name: true,
          key: true,
          scope: true,
          state: true,
          minBidPaise: true,
          bidIncrementPaise: true,
        },
      },
    },
  },
  createdAt: true,
  updatedAt: true,
} as const;

export async function createBusiness(
  ownerId: string | null,
  input: CreateBusinessInput & { manageTokenHash?: string | null }
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
          ownerId: ownerId ?? null,
          manageTokenHash: input.manageTokenHash ?? null,
          categoryId: input.categoryId,
          name: input.name,
          slug,
          description: input.description ?? null,
          website: input.website ?? null,
          contactEmail: input.contactEmail ?? null,
          contactPhone: input.contactPhone ?? null,
          logoUrl: input.logoUrl ?? null,
          country: "IN",
          state: input.state ?? null,
          city: input.city ?? null,
          status: "ACTIVE",
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
  const businesses = await prisma.business.findMany({
    where: {
      ownerId,
    },
    orderBy: [
      { createdAt: "desc" },
      { id: "desc" },
    ],
    select: businessSelect,
  });

  // Attach live ranks from Redis
  return Promise.all(
    businesses.map(async (b) => {
      const membershipsWithRank = await Promise.all(
        b.memberships.map(async (m) => {
          const rank = await getBusinessRank(m.board.id, b.id);
          return {
            ...m,
            totalSpendPaise: m.totalSpendPaise.toString(),
            board: {
              ...m.board,
              minBidPaise: m.board.minBidPaise.toString(),
              bidIncrementPaise: m.board.bidIncrementPaise.toString(),
            },
            rank,
          };
        })
      );
      return {
        ...b,
        memberships: membershipsWithRank,
      };
    })
  );
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
    throw new AppError(404, "BUSINESS_NOT_FOUND", "Business not found.");
  }

  const membershipsWithRank = await Promise.all(
    business.memberships.map(async (m) => {
      const rank = await getBusinessRank(m.board.id, business.id);
      return {
        ...m,
        totalSpendPaise: m.totalSpendPaise.toString(),
        board: {
          ...m.board,
          minBidPaise: m.board.minBidPaise.toString(),
          bidIncrementPaise: m.board.bidIncrementPaise.toString(),
        },
        rank,
      };
    })
  );

  return {
    ...business,
    memberships: membershipsWithRank,
  };
}

export async function getBusinessByManageToken(token: string) {
  const tokenHash = hashManageToken(token);

  const business = await prisma.business.findUnique({
    where: {
      manageTokenHash: tokenHash,
    },
    select: businessSelect,
  });

  if (!business) {
    throw new AppError(
      404,
      "BUSINESS_NOT_FOUND",
      "Listing not found or this manage link has expired/been claimed."
    );
  }

  const membershipsWithRank = await Promise.all(
    business.memberships.map(async (m) => {
      const rank = await getBusinessRank(m.board.id, business.id);
      return {
        ...m,
        totalSpendPaise: m.totalSpendPaise.toString(),
        board: {
          ...m.board,
          minBidPaise: m.board.minBidPaise.toString(),
          bidIncrementPaise: m.board.bidIncrementPaise.toString(),
        },
        rank,
      };
    })
  );

  return {
    ...business,
    memberships: membershipsWithRank,
  };
}

export async function claimBusinessByManageToken(userId: string, token: string) {
  const tokenHash = hashManageToken(token);

  const existing = await prisma.business.findUnique({
    where: {
      manageTokenHash: tokenHash,
    },
    select: {
      id: true,
      ownerId: true,
    },
  });

  if (!existing) {
    throw new AppError(
      404,
      "BUSINESS_NOT_FOUND",
      "Listing not found or has already been claimed."
    );
  }

  // Claim: set ownerId to userId, null manageTokenHash (old anonymous URL 404s)
  const updated = await prisma.business.update({
    where: {
      id: existing.id,
    },
    data: {
      ownerId: userId,
      manageTokenHash: null,
    },
    select: businessSelect,
  });

  return {
    ...updated,
    memberships: updated.memberships.map((m) => ({
      ...m,
      totalSpendPaise: m.totalSpendPaise.toString(),
      board: {
        ...m.board,
        minBidPaise: m.board.minBidPaise.toString(),
        bidIncrementPaise: m.board.bidIncrementPaise.toString(),
      },
    })),
  };
}

export async function updateBusiness(
  identifier: { ownerId?: string; manageToken?: string },
  businessId: string,
  input: UpdateBusinessInput
) {
  let whereClause: Prisma.BusinessWhereInput = { id: businessId };

  if (identifier.ownerId) {
    whereClause = { id: businessId, ownerId: identifier.ownerId };
  } else if (identifier.manageToken) {
    whereClause = {
      id: businessId,
      manageTokenHash: hashManageToken(identifier.manageToken),
    };
  } else {
    throw new AppError(401, "AUTHENTICATION_REQUIRED", "Authentication or manage token required.");
  }

  const existing = await prisma.business.findFirst({
    where: whereClause,
    select: { id: true },
  });

  if (!existing) {
    throw new AppError(404, "BUSINESS_NOT_FOUND", "Business not found or access denied.");
  }

  const updated = await prisma.business.update({
    where: { id: existing.id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.website !== undefined ? { website: input.website } : {}),
      ...(input.contactEmail !== undefined ? { contactEmail: input.contactEmail } : {}),
      ...(input.contactPhone !== undefined ? { contactPhone: input.contactPhone } : {}),
      ...(input.logoUrl !== undefined ? { logoUrl: input.logoUrl } : {}),
      ...(input.state !== undefined ? { state: input.state } : {}),
      ...(input.city !== undefined ? { city: input.city } : {}),
    },
    select: businessSelect,
  });

  return {
    ...updated,
    memberships: updated.memberships.map((m) => ({
      ...m,
      totalSpendPaise: m.totalSpendPaise.toString(),
      board: {
        ...m.board,
        minBidPaise: m.board.minBidPaise.toString(),
        bidIncrementPaise: m.board.bidIncrementPaise.toString(),
      },
    })),
  };
}
