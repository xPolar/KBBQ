-- CreateEnum
CREATE TYPE "CommandType" AS ENUM ('TEXT_COMMAND', 'APPLICATION_COMMAND');

-- CreateTable
CREATE TABLE "command_cooldowns" (
    "userId" TEXT NOT NULL,
    "commandName" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "commandType" "CommandType" NOT NULL,

    CONSTRAINT "command_cooldowns_pkey" PRIMARY KEY ("commandName","commandType","userId")
);

-- CreateTable
CREATE TABLE "user_languages" (
    "userId" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,

    CONSTRAINT "user_languages_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "user_levels" (
    "userId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "experience" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,

    CONSTRAINT "user_levels_pkey" PRIMARY KEY ("userId","guildId")
);

-- CreateTable
CREATE TABLE "weekly_activity" (
    "userId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "currentWeek" TEXT NOT NULL,
    "messages" INTEGER NOT NULL,
    "minutesInVoice" INTEGER NOT NULL,

    CONSTRAINT "weekly_activity_pkey" PRIMARY KEY ("userId","guildId")
);
