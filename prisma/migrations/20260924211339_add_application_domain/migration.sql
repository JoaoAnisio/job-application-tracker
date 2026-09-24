/*
  Warnings:

  - You are about to drop the column `vancancy` on the `application` table. All the data in the column will be lost.
  - Added the required column `vacancy` to the `application` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "application" DROP COLUMN "vancancy",
ADD COLUMN     "vacancy" TEXT NOT NULL;
