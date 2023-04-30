/*
  Warnings:

  - A unique constraint covering the columns `[guildId,channelId,embedName]` on the table `welcome_messages` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "message_components" ADD COLUMN     "emoji" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "welcome_messages_guildId_channelId_embedName_key" ON "welcome_messages"("guildId", "channelId", "embedName");
