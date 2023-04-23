/*
  Warnings:

  - You are about to drop the `status_log_channels` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "status_log_channels";

-- CreateTable
CREATE TABLE "status_roles" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "requiredText" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "channelId" TEXT,
    "embedName" TEXT,

    CONSTRAINT "status_roles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "status_roles_guildId_roleId_requiredText_key" ON "status_roles"("guildId", "roleId", "requiredText");
