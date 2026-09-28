/*
  Warnings:

  - A unique constraint covering the columns `[key]` on the table `Board` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Business" ALTER COLUMN "website" DROP NOT NULL,
ALTER COLUMN "logoUrl" DROP NOT NULL,
ALTER COLUMN "state" DROP NOT NULL,
ALTER COLUMN "city" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Board_key_key" ON "Board"("key");

-- CreateIndex
CREATE INDEX "Board_status_idx" ON "Board"("status");
