/*
  Warnings:

  - Changed the type of `status` on the `tickets` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."TicketStatus" AS ENUM ('SOLD', 'EXPIRED', 'REDEEMED');

-- AlterTable
ALTER TABLE "public"."tickets" DROP COLUMN "status",
ADD COLUMN     "status" "public"."TicketStatus" NOT NULL;
