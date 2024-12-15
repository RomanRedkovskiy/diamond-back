/*
  Warnings:

  - The `type` column on the `log` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "LogType" AS ENUM ('INVEST', 'INTEREST', 'FINAL_PAYOUT');

-- AlterTable
ALTER TABLE "log" DROP COLUMN "type",
ADD COLUMN     "type" "LogType" NOT NULL DEFAULT 'INVEST';
