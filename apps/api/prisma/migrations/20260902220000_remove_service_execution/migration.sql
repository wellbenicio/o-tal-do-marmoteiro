/*
  Warnings:

  - You are about to drop the `ServiceExecution` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ServiceExecution" DROP CONSTRAINT "ServiceExecution_orderId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceExecution" DROP CONSTRAINT "ServiceExecution_performedByAdminId_fkey";

-- DropTable
DROP TABLE "ServiceExecution";
