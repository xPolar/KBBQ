import process from "node:process";
import type { GatewayPresenceUpdateData } from "@discordjs/core";
import { ActivityType, GatewayIntentBits, PermissionFlagsBits } from "@discordjs/core";

export default {
	/**
	 * The prefix the bot will use for text commands, the prefix is different depending on the NODE_ENV.
	 */
	prefixes: process.env.NODE_ENV === "production" ? ["k!"] : ["bk!"],
	/**
	 * The name the bot should use across the bot.
	 */
	botName: "kbbq",

	/**
	 * The bot's current version, this is the first 7 characters from the current Git commit hash.
	 */
	version: "???",
	/**
	 * A list of users that are marked as administrators of the bot, these users have access to eval commands.
	 */
	admins: ["619284841187246090"],
	/* The ID for the test guild  */
	testGuildId: "800213121822097459",

	/**
	 * The presence that should be displayed when the bot starts running.
	 */
	presence: {
		status: "online",
		activities: [
			{
				type: ActivityType.Watching,
				name: "your levels.",
			},
		],
	} as GatewayPresenceUpdateData,

	/**
	 * The hastebin server that we should use for uploading logs.
	 */
	hastebin: "https://haste.polars.cloud",

	/**
	 * An object of the type Record<string, string>, the key corelating to when the value (a hexadecimal code) should be used.
	 */
	colors: {
		primary: 0x5865f2,
		success: 0x57f287,
		warning: 0xfee75c,
		error: 0xed4245,
	},

	/**
	 * The list of intents the bot requires to function.
	 */
	intents:
		GatewayIntentBits.Guilds |
		GatewayIntentBits.GuildModeration |
		GatewayIntentBits.GuildMembers |
		GatewayIntentBits.GuildMessages |
		GatewayIntentBits.DirectMessages |
		GatewayIntentBits.MessageContent |
		GatewayIntentBits.GuildVoiceStates |
		GatewayIntentBits.GuildPresences,
	/**
	 * A list of permissions that the bot needs to function at all.
	 */
	requiredPermissions: PermissionFlagsBits.EmbedLinks | PermissionFlagsBits.SendMessages,

	otherConfig: {
		levelRoles: {
			"800213121822097459": {
				15: "846146319051522049",
				30: "846146457714950174",
				45: "846146513281220609",
				60: "846146566079512646",
				75: "846146608885137450",
				90: "846146645518188576",
				105: "846146731145429003",
				120: "846146731145429003",
			},
		} as Record<string, Record<number, string>>,
		statusRoles: {
			"800213121822097459": {
				".gg/kbbq": "1096496698349584505",
			},
			"925264080250494977": {
				"polar.blue": "964472970594648095",
			},
		} as Record<string, Record<string, string>>,
	},
};
