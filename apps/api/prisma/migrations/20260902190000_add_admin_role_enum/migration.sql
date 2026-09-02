/*
  Warnings:

  - The `role` column on the `AdminUser` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('ADMIN');

-- AlterTable
ALTER TABLE "AdminUser" DROP COLUMN "role",
ADD COLUMN     "role" "AdminRole" NOT NULL DEFAULT 'ADMIN';
