import { Redis } from "ioredis";
import fs from "node:fs";
import { env } from "../config/env.js";
import { logger } from "./logger.js";
import { prisma } from "./prisma.js";

function createRedisClient(): Redis {
  if (env.REDIS_SOCKET_PATH && fs.existsSync(env.REDIS_SOCKET_PATH)) {
    return new Redis({
      path: env.REDIS_SOCKET_PATH,
      retryStrategy: (times) => Math.min(times * 100, 3000),
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
    });
  }

  return new Redis(env.REDIS_URL, {
    retryStrategy: (times) => Math.min(times * 100, 3000),
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
  });
}

export const redis = createRedisClient();

redis.on("connect", () => {
  logger.info("Redis connected successfully");
});

redis.on("error", (err) => {
  logger.warn({ err }, "Redis connection error, will retry");
});

// Reference timestamp in seconds (~2033) for tie-breaking
export const MAX_TS = 2_000_000_000;

/**
 * Composite score: totalSpendPaise * 1_000_000 + (MAX_TS - lastBidTsSeconds)
 * Tie-breaks by earliest timestamp (smaller timestamp => larger timeOffset => higher score).
 */
export function calculateLeaderboardScore(
  totalSpendPaise: bigint,
  lastBidAt: Date | null
): number {
  const spend = Number(totalSpendPaise);
  const lastBidTsSeconds = Math.floor(
    (lastBidAt ? lastBidAt.getTime() : Date.now()) / 1000
  );
  const timeOffset = Math.max(0, MAX_TS - lastBidTsSeconds);
  return spend * 1_000_000 + timeOffset;
}

export function leaderboardKey(boardId: string): string {
  return `leaderboard:${boardId}`;
}

/**
 * Update Redis leaderboard for a business on a board
 */
export async function updateRedisLeaderboard(
  boardId: string,
  businessId: string,
  totalSpendPaise: bigint,
  lastBidAt: Date | null
): Promise<void> {
  try {
    const score = calculateLeaderboardScore(totalSpendPaise, lastBidAt);
    const key = leaderboardKey(boardId);
    await redis.zadd(key, score, businessId);
  } catch (err) {
    logger.error({ err, boardId, businessId }, "Failed to update Redis leaderboard");
  }
}

/**
 * Reconciler: Rebuilds Redis leaderboard from Postgres source of truth
 */
export async function reconcileBoardLeaderboard(boardId: string): Promise<void> {
  try {
    const memberships = await prisma.boardMembership.findMany({
      where: {
        boardId,
        totalSpendPaise: { gt: 0n },
        business: { status: "ACTIVE" },
      },
      select: {
        businessId: true,
        totalSpendPaise: true,
        lastBidAt: true,
      },
      orderBy: [
        { totalSpendPaise: "desc" },
        { lastBidAt: "asc" },
      ],
    });

    const key = leaderboardKey(boardId);
    await redis.del(key);

    if (memberships.length > 0) {
      const pipeline = redis.pipeline();
      for (const m of memberships) {
        const score = calculateLeaderboardScore(m.totalSpendPaise, m.lastBidAt);
        pipeline.zadd(key, score, m.businessId);
      }
      await pipeline.exec();
    }
  } catch (err) {
    logger.error({ err, boardId }, "Failed to reconcile Redis leaderboard from Postgres");
  }
}

export interface RedisLeaderboardEntry {
  rank: number;
  businessId: string;
  score: number;
}

/**
 * Reads top-N ranks from Redis sorted set in O(log N).
 * If Redis key doesn't exist, rebuilds from Postgres.
 */
export async function getTopRankings(
  boardId: string,
  limit = 100
): Promise<RedisLeaderboardEntry[]> {
  const key = leaderboardKey(boardId);

  try {
    const exists = await redis.exists(key);
    if (!exists) {
      await reconcileBoardLeaderboard(boardId);
    }

    const raw = await redis.zrevrange(key, 0, limit - 1, "WITHSCORES");
    const results: RedisLeaderboardEntry[] = [];

    for (let i = 0; i < raw.length; i += 2) {
      const businessId = raw[i];
      const score = Number.parseFloat(raw[i + 1]);
      results.push({
        rank: Math.floor(i / 2) + 1,
        businessId,
        score,
      });
    }

    return results;
  } catch (err) {
    logger.warn({ err, boardId }, "Redis read failed, falling back to Postgres for leaderboard");
    // Fallback directly to Postgres
    const memberships = await prisma.boardMembership.findMany({
      where: {
        boardId,
        totalSpendPaise: { gt: 0n },
        business: { status: "ACTIVE" },
      },
      select: {
        businessId: true,
        totalSpendPaise: true,
        lastBidAt: true,
      },
      orderBy: [
        { totalSpendPaise: "desc" },
        { lastBidAt: "asc" },
      ],
      take: limit,
    });

    return memberships.map((m, idx) => ({
      rank: idx + 1,
      businessId: m.businessId,
      score: calculateLeaderboardScore(m.totalSpendPaise, m.lastBidAt),
    }));
  }
}

/**
 * Get 1-based rank for a business on a board in O(log N)
 */
export async function getBusinessRank(
  boardId: string,
  businessId: string
): Promise<number | null> {
  const key = leaderboardKey(boardId);
  try {
    const exists = await redis.exists(key);
    if (!exists) {
      await reconcileBoardLeaderboard(boardId);
    }
    const zeroBasedRank = await redis.zrevrank(key, businessId);
    return zeroBasedRank === null ? null : zeroBasedRank + 1;
  } catch (err) {
    logger.warn({ err, boardId, businessId }, "Redis zrevrank failed");
    return null;
  }
}
