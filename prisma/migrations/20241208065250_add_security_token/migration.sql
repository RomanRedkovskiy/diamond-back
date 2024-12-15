/*
  Warnings:

  - You are about to drop the column `account_id` on the `log` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "log" DROP CONSTRAINT "log_account_id_fkey";

-- AlterTable
ALTER TABLE "log" DROP COLUMN "account_id",
ADD COLUMN     "user_id" BIGINT;

-- CreateTable
CREATE TABLE "SecurityToken" (
    "id" BIGSERIAL NOT NULL,
    "token" VARCHAR(128) NOT NULL,
    "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" BIGINT,

    CONSTRAINT "SecurityToken_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "log" ADD CONSTRAINT "log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityToken" ADD CONSTRAINT "SecurityToken_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
