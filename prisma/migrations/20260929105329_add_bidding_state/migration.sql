-- AlterTable
ALTER TABLE "Board" ADD COLUMN     "bidIncrementPaise" BIGINT NOT NULL DEFAULT 100,
ADD COLUMN     "minBidPaise" BIGINT NOT NULL DEFAULT 10000;

-- AlterTable
ALTER TABLE "BoardMembership" ADD COLUMN     "lastBidAt" TIMESTAMP(3),
ADD COLUMN     "totalSpendPaise" BIGINT NOT NULL DEFAULT 0;
