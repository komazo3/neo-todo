/*
  Warnings:

  - You are about to drop the column `deadline` on the `Todo` table. All the data in the column will be lost.
  - Added the required column `deadlineDate` to the `Todo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deadlineTime` to the `Todo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Todo" DROP COLUMN "deadline",
ADD COLUMN     "deadlineDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "deadlineTime" TIME NOT NULL;
