-- CreateTable
CREATE TABLE "embeds" (
    "embedName" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "messagePayload" JSONB NOT NULL,

    CONSTRAINT "embeds_pkey" PRIMARY KEY ("embedName","guildId")
);

-- CreateTable
CREATE TABLE "status_log_channels" (
    "guildId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,

    CONSTRAINT "status_log_channels_pkey" PRIMARY KEY ("guildId")
);
