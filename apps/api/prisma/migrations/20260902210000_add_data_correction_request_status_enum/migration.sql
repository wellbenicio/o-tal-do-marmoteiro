/*
  Warnings:

  - The `status` column on the `DataCorrectionRequest` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "DataCorrectionRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'ADJUSTED', 'REJECTED');

-- AlterTable
ALTER TABLE "DataCorrectionRequest" DROP COLUMN "status",
ADD COLUMN     "status" "DataCorrectionRequestStatus" NOT NULL DEFAULT 'PENDING';
