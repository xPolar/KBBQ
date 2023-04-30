/*
  Warnings:

  - You are about to drop the column `emoji` on the `message_components` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "EmojiType" AS ENUM ('CUSTOM', 'DEFAULT');

-- AlterTable
ALTER TABLE "message_components" DROP COLUMN "emoji",
ADD COLUMN     "emojiId" TEXT,
ADD COLUMN     "emojiName" TEXT,
ADD COLUMN     "emojiType" "EmojiType";
