const metrics = {
	commands_used: {
		help: "The usage of each command.",
		labelNames: ["command", "type", "success", "shard"] as const,
	},
	autocomplete_responses: {
		help: "The number of autocomplete responses sent.",
		labelNames: ["name", "shard"] as const,
	},
	interactions_created: {
		help: "The number of interactions created.",
		labelNames: ["name", "type", "shard"] as const,
	},
	user_locales: {
		help: "What users have their language set to.",
		labelNames: ["locale", "shard"] as const,
	},
	guild_count: {
		help: "The number of guilds the server is in.",
		labelNames: ["shard"] as const,
	},
	latency: {
		help: "The latency of the bot.",
		labelNames: ["shard"] as const,
	},
	websocket_events: {
		help: "The number of websocket events the bot has received.",
		labelNames: ["type", "shard"] as const,
	},
	minutes_in_voice: {
		help: "The number of total minutes people have spent in voice channels.",
		labelNames: ["guildId"] as const,
	},
	users_in_voice: {
		help: "The number of users in voice channels.",
		labelNames: ["guildId"] as const,
	},
	user_levels: {
		help: "The total number of users who have a level.",
		labelNames: ["guildId", "shard"] as const,
	},
	user_activity: {
		help: "The total number of users who have activity.",
		labelNames: ["guildId", "shard", "currentWeek", "type"] as const,
	},
};

export default metrics;
