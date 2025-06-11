/*
  Warnings:

  - You are about to drop the column `intent_id` on the `Order` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[order_id]` on the table `Order` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Order_intent_id_key";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "intent_id",
ADD COLUMN     "order_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Order_order_id_key" ON "Order"("order_id");
