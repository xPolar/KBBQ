-- CreateTable
CREATE TABLE "message_components" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "embedName" TEXT NOT NULL,

    CONSTRAINT "message_components_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "welcome_messages" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "embedName" TEXT NOT NULL,

    CONSTRAINT "welcome_messages_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "message_components" ADD CONSTRAINT "message_components_embedName_guildId_fkey" FOREIGN KEY ("embedName", "guildId") REFERENCES "embeds"("embedName", "guildId") ON DELETE RESTRICT ON UPDATE CASCADE;
