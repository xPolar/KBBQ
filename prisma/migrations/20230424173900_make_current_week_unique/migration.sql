/*
  Warnings:

  - The primary key for the `weekly_activity` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[userId,guildId,currentWeek]` on the table `weekly_activity` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "weekly_activity" DROP CONSTRAINT "weekly_activity_pkey";

-- CreateIndex
CREATE UNIQUE INDEX "weekly_activity_userId_guildId_currentWeek_key" ON "weekly_activity"("userId", "guildId", "currentWeek");
