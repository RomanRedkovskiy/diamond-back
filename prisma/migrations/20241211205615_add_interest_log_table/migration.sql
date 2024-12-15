-- CreateTable
CREATE TABLE "interest_log" (
    "id" BIGSERIAL NOT NULL,
    "amount" DECIMAL(38,2) NOT NULL,
    "user_id" BIGINT,
    "log_id" BIGINT,
    "type" "LogType" NOT NULL DEFAULT 'INTEREST',
    "date_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interest_log_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "interest_log" ADD CONSTRAINT "interest_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interest_log" ADD CONSTRAINT "interest_log_log_id_fkey" FOREIGN KEY ("log_id") REFERENCES "log"("id") ON DELETE SET NULL ON UPDATE CASCADE;
