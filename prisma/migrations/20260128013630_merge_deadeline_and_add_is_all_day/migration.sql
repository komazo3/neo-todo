/*
  Warnings:

  - You are about to drop the column `deadlineTime` on the `Todo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Todo" DROP COLUMN "deadlineTime",
ADD COLUMN     "isAllDay" BOOLEAN NOT NULL DEFAULT false;
