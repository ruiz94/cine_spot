/*
  Warnings:

  - You are about to drop the column `discountType` on the `discounts` table. All the data in the column will be lost.
  - Added the required column `discountMethod` to the `discounts` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `discounts` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."DiscountMethod" AS ENUM ('PERCENTAGE', 'FIXED', 'POINTS');

-- CreateEnum
CREATE TYPE "public"."DiscountType" AS ENUM ('BIRTHDAY', 'SEASONAL', 'POINTS');

-- AlterTable
ALTER TABLE "public"."discounts" DROP COLUMN "discountType",
ADD COLUMN     "discountMethod" "public"."DiscountMethod" NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "public"."DiscountType" NOT NULL;
