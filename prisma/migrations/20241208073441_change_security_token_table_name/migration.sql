/*
  Warnings:

  - You are about to drop the `SecurityToken` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "SecurityToken" DROP CONSTRAINT "SecurityToken_user_id_fkey";

-- DropTable
DROP TABLE "SecurityToken";

-- CreateTable
CREATE TABLE "security_token" (
    "id" BIGSERIAL NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" BIGINT,

    CONSTRAINT "security_token_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "security_token" ADD CONSTRAINT "security_token_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
