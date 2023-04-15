import type { APIApplicationCommandInteraction } from "@discordjs/core";
import { ApplicationCommandOptionType, ApplicationCommandType } from "@discordjs/core";
import ApplicationCommand from "../../../../lib/classes/ApplicationCommand.js";
import type Language from "../../../../lib/classes/Language.js";
import type ExtendedClient from "../../../../lib/extensions/ExtendedClient.js";
import type { APIInteractionWithArguments } from "../../../../typings/index.js";

export default class Leaderboard extends ApplicationCommand {
	/**
	 * Create our leaderboard command.
	 *
	 * @param client - Our extended client.
	 */
	public constructor(client: ExtendedClient) {
		super(client, {
			options: {
				name: client.languageHandler.defaultLanguage!.get("LEADERBOARD_COMMAND_NAME"),
				description: client.languageHandler.defaultLanguage!.get("LEADERBOARD_COMMAND_DESCRIPTION"),
				name_localizations: client.languageHandler.getFromAllLanguages("LEADERBOARD_COMMAND_NAME"),
				description_localizations: client.languageHandler.getFromAllLanguages("LEADERBOARD_COMMAND_DESCRIPTION"),
				type: ApplicationCommandType.ChatInput,
				options: [
					{
						name: client.languageHandler.defaultLanguage!.get("LEADERBOARD_LEVELING_SUB_COMMAND_NAME"),
						description: client.languageHandler.defaultLanguage!.get("LEADERBOARD_LEVELING_SUB_COMMAND_DESCRIPTION"),
						name_localizations: client.languageHandler.getFromAllLanguages("LEADERBOARD_LEVELING_SUB_COMMAND_NAME"),
						description_localizations: client.languageHandler.getFromAllLanguages(
							"LEADERBOARD_LEVELING_SUB_COMMAND_DESCRIPTION",
						),
						type: ApplicationCommandOptionType.Subcommand,
					},
					{
						name: client.languageHandler.defaultLanguage!.get("LEADERBOARD_ACTIVITY_SUB_COMMAND_GROUP_NAME"),
						description: client.languageHandler.defaultLanguage!.get(
							"LEADERBOARD_ACTIVITY_SUB_COMMAND_GROUP_DESCRIPTION",
						),
						name_localizations: client.languageHandler.getFromAllLanguages(
							"LEADERBOARD_ACTIVITY_SUB_COMMAND_GROUP_NAME",
						),
						description_localizations: client.languageHandler.getFromAllLanguages(
							"LEADERBOARD_ACTIVITY_SUB_COMMAND_GROUP_DESCRIPTION",
						),
						type: ApplicationCommandOptionType.SubcommandGroup,
						options: [
							{
								name: client.languageHandler.defaultLanguage!.get(
									"LEADERBOARD_ACTIVITY_SUB_COMMAND_GROUP_TEXT_SUB_COMMAND_NAME",
								),
								description: client.languageHandler.defaultLanguage!.get(
									"LEADERBOARD_ACTIVITY_SUB_COMMAND_GROUP_TEXT_SUB_COMMAND_DESCRIPTION",
								),
								name_localizations: client.languageHandler.getFromAllLanguages(
									"LEADERBOARD_ACTIVITY_SUB_COMMAND_GROUP_TEXT_SUB_COMMAND_NAME",
								),
								description_localizations: client.languageHandler.getFromAllLanguages(
									"LEADERBOARD_ACTIVITY_SUB_COMMAND_GROUP_TEXT_SUB_COMMAND_DESCRIPTION",
								),
								type: ApplicationCommandOptionType.Subcommand,
							},
							{
								name: client.languageHandler.defaultLanguage!.get(
									"LEADERBOARD_ACTIVITY_SUB_COMMAND_GROUP_VOICE_SUB_COMMAND_NAME",
								),
								description: client.languageHandler.defaultLanguage!.get(
									"LEADERBOARD_ACTIVITY_SUB_COMMAND_GROUP_VOICE_SUB_COMMAND_DESCRIPTION",
								),
								name_localizations: client.languageHandler.getFromAllLanguages(
									"LEADERBOARD_ACTIVITY_SUB_COMMAND_GROUP_VOICE_SUB_COMMAND_NAME",
								),
								description_localizations: client.languageHandler.getFromAllLanguages(
									"LEADERBOARD_ACTIVITY_SUB_COMMAND_GROUP_VOICE_SUB_COMMAND_DESCRIPTION",
								),
								type: ApplicationCommandOptionType.Subcommand,
							},
						],
					},
				],
				dm_permission: false,
			},
		});
	}

	/**
	 * Run this application command.
	 *
	 * @param options - The options for this command.
	 * @param options.shardId - The shard ID that this interaction was received on.
	 * @param options.language - The language to use when replying to the interaction.
	 * @param options.interaction -  The interaction to run this command on.
	 */
	public override async run({
		interaction,
		language,
		shardId,
	}: {
		interaction: APIInteractionWithArguments<APIApplicationCommandInteraction>;
		language: Language;
		shardId: number;
	}) {
		if (
			interaction.arguments.subCommand?.name ===
			this.client.languageHandler.defaultLanguage!.get("LEADERBOARD_LEVELING_SUB_COMMAND_NAME")
		) {
			const sortedUserLevels = await this.client.prisma.userLevel.findMany({
				where: { guildId: interaction.guild_id! },
				orderBy: { level: "desc" },
			});

			this.client.submitMetric("user_levels", "set", sortedUserLevels.length, {
				guildId: interaction.guild_id!,
				shard: shardId.toString(),
			});

			const top10UserLevels = sortedUserLevels.slice(0, 10);

			let leaderboardMessage = top10UserLevels
				.map(
					(userLevel, index) =>
						`**${(index + 1).toLocaleString(language.id)}.** <@${userLevel.userId}>: **${language.get(
							"LEVEL",
						)}:** ${this.client.functions
							.calculateLevelFromExperience(userLevel.experience)
							.toLocaleString(language.id)} **${language.get("EXPERIENCE")}:** ${userLevel.experience.toLocaleString(
							language.id,
						)}`,
				)
				.join("\n");

			if (!leaderboardMessage.includes(interaction.member!.user.id)) {
				const userIndex = sortedUserLevels.findIndex((userLevel) => userLevel.userId === interaction.member!.user.id);

				if (userIndex !== -1) {
					leaderboardMessage += "\n━━━━━━━━━━━━━━";

					for (let index = -1; index <= 1; index++) {
						if (
							sortedUserLevels[userIndex + index] &&
							!leaderboardMessage.includes(sortedUserLevels[userIndex + index]!.userId)
						)
							leaderboardMessage += `**\n${(userIndex + index + 1).toLocaleString(language.id)}.** <@${
								sortedUserLevels[userIndex + index]!.userId
							}> **${language.get("LEVEL")}** ${this.client.functions
								.calculateLevelFromExperience(sortedUserLevels[userIndex + index]!.experience)
								.toLocaleString(language.id)} **${language.get("EXPERIENCE")}:** ${sortedUserLevels[
								userIndex + index
							]!.experience.toLocaleString(language.id)}`;
					}
				}
			}

			return this.client.api.interactions.reply(interaction.id, interaction.token, {
				embeds: [
					{
						title: language.get("LEADERBOARD_LEVELING_EMBED_TITLE"),
						description: leaderboardMessage,
						color: this.client.config.colors.primary,
					},
				],
			});
		}

		let type: "MESSAGES" | "VOICE";

		if (
			interaction.arguments.subCommand?.name ===
			this.client.languageHandler.defaultLanguage!.get("LEADERBOARD_ACTIVITY_SUB_COMMAND_GROUP_TEXT_SUB_COMMAND_NAME")
		)
			type = "MESSAGES";
		else type = "VOICE";

		const sortedWeeklyActivity = await this.client.prisma.weeklyActivity.findMany({
			where: {
				guildId: interaction.guild_id!,
				currentWeek: this.client.functions.getWeekOfYear(),
			},
			orderBy: type === "MESSAGES" ? { messages: "desc" } : { minutesInVoice: "desc" },
		});

		this.client.submitMetric("user_activity", "set", sortedWeeklyActivity.length, {
			currentWeek: this.client.functions.getWeekOfYear(),
			guildId: interaction.guild_id!,
			shard: shardId.toString(),
			type: type.toLowerCase(),
		});

		const top10WeeklyActivity = sortedWeeklyActivity.slice(0, 10);

		let leaderboardMessage = top10WeeklyActivity
			.map(
				(weeklyActivity, index) =>
					`**${(index + 1).toLocaleString(language.id)}.** <@${weeklyActivity.userId}>: ${(type === "MESSAGES"
						? weeklyActivity.messages
						: weeklyActivity.minutesInVoice
					).toLocaleString(language.id)} ${language.get(type)}`,
			)
			.join("\n");

		if (!leaderboardMessage.includes(interaction.member!.user.id)) {
			const userIndex = sortedWeeklyActivity.findIndex(
				(weeklyActivity) => weeklyActivity.userId === interaction.member!.user.id,
			);

			if (userIndex !== -1) {
				leaderboardMessage += "\n━━━━━━━━━━━━━━";

				for (let index = -1; index <= 1; index++) {
					if (
						sortedWeeklyActivity[userIndex + index] &&
						!leaderboardMessage.includes(sortedWeeklyActivity[userIndex + index]!.userId)
					)
						leaderboardMessage += `**\n${(userIndex + index + 1).toLocaleString(language.id)}.** ${(type === "MESSAGES"
							? sortedWeeklyActivity[userIndex + index]!.messages
							: sortedWeeklyActivity[userIndex + index]!.minutesInVoice
						).toLocaleString(language.id)} ${language.get(type)}`;
				}
			}
		}

		return this.client.api.interactions.reply(interaction.id, interaction.token, {
			embeds: [
				{
					title: language.get(
						type === "MESSAGES" ? "LEADERBOARD_WEEKLY_TEXT_EMBED_TITLE" : "LEADERBOARD_WEEKLY_VOICE_EMBED_TITLE",
					),
					description: leaderboardMessage,
					color: this.client.config.colors.primary,
				},
			],
		});
	}
}
