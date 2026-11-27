import { randomUUID } from "node:crypto";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../lib/app-error.js";
import { logger } from "../../lib/logger.js";
import { env } from "../../config/env.js";
import { generateManageToken, hashManageToken } from "../../lib/manage-token.js";
import {
  getTopRankings,
  getBusinessRank,
  updateRedisLeaderboard,
  calculateLeaderboardScore,
} from "../../lib/redis.js";
import { razorpay } from "../payments/razorpay.js";
import { paiseToInr } from "./bidding.money.js";
import { slugify, createFallbackBusinessSlug, createUniqueallbackSlug } from "../../lib/slug.js";
import type { PlaceBidInput, QuoteInput } from "./bidding.schemas.js";

function paymentExpiry(): Date {
  return new Date(Date.now() + env.PAYMENT_ORDER_TTL_MINUTES * 60 * 1000);
}

export async function placeBid(userId: string | null, input: PlaceBidInput) {
  // 1. Resolve Board
  let board = null;

  if (input.boardId) {
    board = await prisma.board.findUnique({
      where: { id: input.boardId },
      include: { category: true },
    });
  } else if (input.categorySlug) {
    const category = await prisma.category.findUnique({
      where: { slug: input.categorySlug },
    });
    if (!category) {
      throw new AppError(404, "CATEGORY_NOT_FOUND", `Category '${input.categorySlug}' not found.`);
    }

    const scope = input.scope || "NATIONAL";
    let key: string;
    let name: string;
    let minBidPaise = 50000n; // Default ₹500 for National

    if (scope === "NATIONAL") {
      key = `${category.slug}-national`;
      name = `${category.name} - National`;
      minBidPaise = 50000n;
    } else {
      if (!input.state) {
        throw new AppError(400, "STATE_REQUIRED", "State is required for state boards.");
      }
      key = `${category.slug}-${input.state.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
      name = `${category.name} - ${input.state}`;
      minBidPaise = 10000n; // Default ₹100 for State
    }

    board = await prisma.board.upsert({
      where: { key },
      update: {},
      create: {
        categoryId: category.id,
        key,
        name,
        scope,
        state: scope === "STATE" ? input.state : null,
        country: "IN",
        minBidPaise,
        bidIncrementPaise: 100n,
        status: "ACTIVE",
      },
      include: { category: true },
    });
  }

  if (!board) {
    throw new AppError(400, "BOARD_REQUIRED", "Either boardId or categorySlug must be provided.");
  }

  if (board.status !== "ACTIVE") {
    throw new AppError(409, "BOARD_UNAVAILABLE", "This board is not currently accepting bids.");
  }

  // 2. Resolve or Create Business
  let business = null;
  let oneTimeManageToken: string | null = null;

  if (input.manageToken) {
    // Anonymous raising bid via manageToken
    const tokenHash = hashManageToken(input.manageToken);
    business = await prisma.business.findUnique({
      where: { manageTokenHash: tokenHash },
    });
    if (!business) {
      throw new AppError(404, "BUSINESS_NOT_FOUND", "No listing found for the provided manage token.");
    }
    if (business.status !== "ACTIVE") {
      throw new AppError(403, "BUSINESS_UNAVAILABLE", "This listing is not active.");
    }
  } else if (input.businessId) {
    // Authenticated owner raising bid via businessId
    if (!userId) {
      throw new AppError(401, "AUTHENTICATION_REQUIRED", "Authentication or a valid manage token is required to bid on an existing listing.");
    }
    business = await prisma.business.findUnique({
      where: { id: input.businessId },
    });
    if (!business) {
      throw new AppError(404, "BUSINESS_NOT_FOUND", "Business not found.");
    }
    if (!business.ownerId || business.ownerId !== userId) {
      throw new AppError(403, "FORBIDDEN", "You do not own this business.");
    }
    if (business.status !== "ACTIVE") {
      throw new AppError(403, "BUSINESS_UNAVAILABLE", "This listing is not active.");
    }
  } else {
    // New business creation
    if (!input.name || !input.name.trim()) {
      throw new AppError(400, "NAME_REQUIRED", "Business name is required.");
    }

    let ownerId: string | null = null;
    let manageTokenHash: string | null = null;

    if (userId) {
      // Authenticated user
      ownerId = userId;
      manageTokenHash = null;
      oneTimeManageToken = null;
    } else {
      // Anonymous user: gets one-time manageToken
      oneTimeManageToken = generateManageToken();
      manageTokenHash = hashManageToken(oneTimeManageToken);
    }

    const baseSlug = slugify(input.name) || createFallbackBusinessSlug();
    let slug = baseSlug;

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        business = await prisma.business.create({
          data: {
            name: input.name.trim(),
            slug,
            description: input.description ?? null,
            website: input.website ?? null,
            contactEmail: input.contactEmail ?? null,
            contactPhone: input.contactPhone ?? null,
            categoryId: board.categoryId,
            ownerId,
            manageTokenHash,
            country: "IN",
            state: board.state ?? input.state ?? null,
            status: "ACTIVE",
          },
        });
        break;
      } catch (err: any) {
        if (err.code === "P2002") {
          slug = createUniqueallbackSlug(baseSlug);
          continue;
        }
        throw err;
      }
    }

    if (!business) {
      throw new AppError(500, "CREATION_FAILED", "Could not create business listing.");
    }
  }

  // 3. Resolve or Create Board Membership
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
      totalSpendPaise: 0n,
    },
  });

  // 4. Validate Minimum Bid
  const currentSpend = membership.totalSpendPaise;
  let minAdditional = 0n;

  if (currentSpend === 0n) {
    minAdditional = board.minBidPaise;
  }

  const competitor = await prisma.boardMembership.findFirst({
    where: {
      boardId: board.id,
      businessId: { not: business.id },
      totalSpendPaise: { gt: 0n },
      business: { status: "ACTIVE" },
    },
    orderBy: [
      { totalSpendPaise: "desc" },
      { lastBidAt: "asc" },
      { id: "asc" },
    ],
    select: { totalSpendPaise: true },
  });

  if (competitor) {
    const targetSpend = competitor.totalSpendPaise + board.bidIncrementPaise;
    const required = targetSpend > currentSpend ? targetSpend - currentSpend : 0n;
    if (required > minAdditional) {
      minAdditional = required;
    }
  }

  // Enforce minimum bid on first placement
  if (currentSpend === 0n && input.amountPaise < minAdditional) {
    throw new AppError(
      400,
      "BID_AMOUNT_TOO_LOW",
      `Minimum initial bid for this board is ${paiseToInr(minAdditional)}.`,
      { minimumAdditionalPaise: minAdditional.toString() }
    );
  } else if (input.amountPaise < board.bidIncrementPaise) {
    throw new AppError(
      400,
      "BID_AMOUNT_TOO_LOW",
      `Minimum bid increment is ${paiseToInr(board.bidIncrementPaise)}.`,
      { minimumAdditionalPaise: board.bidIncrementPaise.toString() }
    );
  }

  // 5. Create Payment record in Postgres
  const idempotencyKey = input.idempotencyKey || `bid_${randomUUID()}`;

  const existingPayment = await prisma.payment.findUnique({
    where: { idempotencyKey },
  });

  if (existingPayment) {
    return {
      paymentId: existingPayment.id,
      orderId: existingPayment.providerOrderId,
      keyId: env.RAZORPAY_KEY_ID,
      amountPaise: existingPayment.amountPaise.toString(),
      currency: existingPayment.currency,
      businessId: existingPayment.businessId,
      boardId: board.id,
      manageToken: oneTimeManageToken ?? undefined,
    };
  }

  const payment = await prisma.payment.create({
    data: {
      businessId: business.id,
      membershipId: membership.id,
      initiatedById: userId ?? null,
      provider: "razorpay",
      idempotencyKey,
      amountPaise: input.amountPaise,
      currency: "INR",
      status: "CREATED",
      expiresAt: paymentExpiry(),
    },
  });

  // 6. Create Razorpay order
  let providerOrderId: string;
  try {
    const amountNumber = Number(input.amountPaise);
    if (!Number.isSafeInteger(amountNumber) || amountNumber <= 0) {
      throw new AppError(400, "INVALID_AMOUNT", "Bid amount exceeds safe gateway range.");
    }
    const order = await razorpay.orders.create({
      amount: amountNumber,
      currency: "INR",
      receipt: `bid_${payment.id.slice(0, 20)}`,
      notes: {
        paymentId: payment.id,
        businessId: business.id,
        boardId: board.id,
      },
    });
    providerOrderId = order.id;
  } catch (err) {
    if (env.NODE_ENV === "test") {
      logger.warn({ err }, "Razorpay API bypassed in test mode; using synthetic order ID");
      providerOrderId = `order_test_${randomUUID().replace(/-/g, "").slice(0, 14)}`;
    } else {
      logger.error({ err, paymentId: payment.id }, "Razorpay order creation failed");
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED", failureReason: "Razorpay order creation failed" },
      });
      throw new AppError(
        502,
        "PAYMENT_GATEWAY_ERROR",
        "Unable to initialize payment with Razorpay. Please try again."
      );
    }
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      providerOrderId,
      status: "PENDING",
    },
  });

  return {
    paymentId: payment.id,
    orderId: providerOrderId,
    keyId: env.RAZORPAY_KEY_ID,
    amountPaise: input.amountPaise.toString(),
    currency: "INR",
    businessId: business.id,
    boardId: board.id,
    manageToken: oneTimeManageToken ?? undefined, // returned once!
  };
}

export async function getBidQuote(boardId: string, input: QuoteInput) {
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    select: {
      id: true,
      key: true,
      name: true,
      scope: true,
      state: true,
      status: true,
      minBidPaise: true,
      bidIncrementPaise: true,
    },
  });

  if (!board) {
    throw new AppError(404, "BOARD_NOT_FOUND", "Board not found.");
  }

  let businessId = input.businessId;

  if (!businessId && input.manageToken) {
    const tokenHash = hashManageToken(input.manageToken);
    const biz = await prisma.business.findUnique({
      where: { manageTokenHash: tokenHash },
      select: { id: true },
    });
    if (biz) businessId = biz.id;
  }

  let currentSpend = 0n;
  let business = null;

  if (businessId) {
    const membership = await prisma.boardMembership.findUnique({
      where: {
        businessId_boardId: {
          businessId,
          boardId,
        },
      },
      include: {
        business: {
          select: { id: true, name: true, slug: true, status: true },
        },
      },
    });

    if (membership) {
      currentSpend = membership.totalSpendPaise;
      business = membership.business;
    }
  }

  const competitor = await prisma.boardMembership.findFirst({
    where: {
      boardId,
      ...(businessId ? { businessId: { not: businessId } } : {}),
      totalSpendPaise: { gt: 0n },
      business: { status: "ACTIVE" },
    },
    orderBy: [
      { totalSpendPaise: "desc" },
      { lastBidAt: "asc" },
      { id: "asc" },
    ],
    select: {
      id: true,
      totalSpendPaise: true,
      business: {
        select: { id: true, name: true, slug: true },
      },
    },
  });

  let minimumAdditional = 0n;

  if (currentSpend === 0n) {
    minimumAdditional = board.minBidPaise;
  }

  if (competitor) {
    const targetSpend = competitor.totalSpendPaise + board.bidIncrementPaise;
    const additionalRequired = targetSpend > currentSpend ? targetSpend - currentSpend : 0n;
    if (additionalRequired > minimumAdditional) {
      minimumAdditional = additionalRequired;
    }
  }

  const alreadyLeading = competitor === null || currentSpend > competitor.totalSpendPaise;

  return {
    board: {
      id: board.id,
      key: board.key,
      name: board.name,
      scope: board.scope,
      state: board.state,
    },
    business: business ? { id: business.id, name: business.name } : null,
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

export type LeaderboardEntry = {
  rank: number;
  business: {
    id: string;
    name: string;
    slug: string;
    website: string | null;
    description: string | null;
  };
  totalSpend: {
    paise: string;
    inr: string;
  };
  lastBidAt: string | null;
};

/**
 * Leaderboard read model served from Redis in O(log N)
 */
export async function getLeaderboard(
  boardId: string,
  limit = 50
): Promise<{
  board: {
    id: string;
    key: string;
    name: string;
    scope: string;
    state: string | null;
    minBidPaise: string;
    bidIncrementPaise: string;
  };
  entries: LeaderboardEntry[];
}> {
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    select: {
      id: true,
      key: true,
      name: true,
      scope: true,
      state: true,
      status: true,
      minBidPaise: true,
      bidIncrementPaise: true,
    },
  });

  if (!board || board.status !== "ACTIVE") {
    throw new AppError(404, "BOARD_NOT_FOUND", "Board not found.");
  }

  // Read top ranks from Redis Sorted Set in O(log N)
  const redisEntries = await getTopRankings(board.id, limit);

  if (redisEntries.length === 0) {
    return {
      board: {
        id: board.id,
        key: board.key,
        name: board.name,
        scope: board.scope,
        state: board.state,
        minBidPaise: board.minBidPaise.toString(),
        bidIncrementPaise: board.bidIncrementPaise.toString(),
      },
      entries: [],
    };
  }

  // Fetch business & membership details for the top ranking businesses
  const businessIds = redisEntries.map((e) => e.businessId);

  const memberships = await prisma.boardMembership.findMany({
    where: {
      boardId: board.id,
      businessId: { in: businessIds },
    },
    include: {
      business: {
        select: {
          id: true,
          name: true,
          slug: true,
          website: true,
          description: true,
          status: true,
        },
      },
    },
  });

  const membershipMap = new Map(memberships.map((m) => [m.businessId, m]));

  const entries: LeaderboardEntry[] = redisEntries
    .map((re) => {
      const m = membershipMap.get(re.businessId);
      if (!m || m.business.status !== "ACTIVE") return null;

      return {
        rank: re.rank,
        business: {
          id: m.business.id,
          name: m.business.name,
          slug: m.business.slug,
          website: m.business.website,
          description: m.business.description,
        },
        totalSpend: {
          paise: m.totalSpendPaise.toString(),
          inr: paiseToInr(m.totalSpendPaise),
        },
        lastBidAt: m.lastBidAt?.toISOString() ?? null,
      };
    })
    .filter((e): e is LeaderboardEntry => e !== null);

  return {
    board: {
      id: board.id,
      key: board.key,
      name: board.name,
      scope: board.scope,
      state: board.state,
      minBidPaise: board.minBidPaise.toString(),
      bidIncrementPaise: board.bidIncrementPaise.toString(),
    },
    entries,
  };
}
