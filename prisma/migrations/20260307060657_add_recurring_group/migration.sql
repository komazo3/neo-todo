-- AlterTable
ALTER TABLE "Todo" ADD COLUMN     "recurringGroupId" TEXT;

-- CreateTable
CREATE TABLE "RecurringGroup" (
    "id" TEXT NOT NULL,
    "days" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecurringGroup_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RecurringGroup" ADD CONSTRAINT "RecurringGroup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Todo" ADD CONSTRAINT "Todo_recurringGroupId_fkey" FOREIGN KEY ("recurringGroupId") REFERENCES "RecurringGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
