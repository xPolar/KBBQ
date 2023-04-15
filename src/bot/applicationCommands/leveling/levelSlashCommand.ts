import type { APIApplicationCommandInteraction } from "@discordjs/core";
import { ApplicationCommandOptionType } from "@discordjs/core";
import type { UserLevel } from "@prisma/client";
import ApplicationCommand from "../../../../lib/classes/ApplicationCommand.js";
import type Language from "../../../../lib/classes/Language.js";
import type ExtendedClient from "../../../../lib/extensions/ExtendedClient.js";
import type { APIInteractionWithArguments } from "../../../../typings/index.js";

export default class LevelSlashCommand extends ApplicationCommand {
	/**
	 * Create our level command.
	 *
	 * @param client Our extended client.
	 */
	public constructor(client: ExtendedClient) {
		super(client, {
			options: {
				name: client.languageHandler.defaultLanguage!.get("LEVEL_COMMAND_NAME"),
				description: client.languageHandler.defaultLanguage!.get("LEVEL_COMMAND_DESCRIPTION"),
				name_localizations: client.languageHandler.getFromAllLanguages("LEVEL_COMMAND_NAME"),
				description_localizations: client.languageHandler.getFromAllLanguages("LEVEL_COMMAND_DESCRIPTION"),
				options: [
					{
						name: client.languageHandler.defaultLanguage!.get("LEVEL_MEMBER_NAME"),
						description: client.languageHandler.defaultLanguage!.get("LEVEL_MEMBER_DESCRIPTION"),
						name_localizations: client.languageHandler.getFromAllLanguages("LEVEL_MEMBER_NAME"),
						description_localizations: client.languageHandler.getFromAllLanguages("LEVEL_MEMBER_DESCRIPTION"),
						type: ApplicationCommandOptionType.User,
					},
				],
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
	}: {
		interaction: APIInteractionWithArguments<APIApplicationCommandInteraction>;
		language: Language;
		shardId: number;
	}) {
		await this.client.api.interactions.defer(interaction.id, interaction.token, {});

		const user =
			interaction.arguments.users![this.client.languageHandler.defaultLanguage!.get("LEVEL_MEMBER_NAME")]! ||
			interaction.member?.user;
		const member =
			interaction.arguments.members?.[this.client.languageHandler.defaultLanguage!.get("LEVEL_MEMBER_NAME")] ??
			interaction.member;

		let userLevel = await this.client.prisma.userLevel.findUnique({
			where: {
				userId_guildId: {
					guildId: interaction.guild_id!,
					userId: user.id,
				},
			},
		});

		if (!userLevel)
			userLevel = {
				guildId: interaction.guild_id!,
				userId: user.id,
				experience: 0,
				level: 0,
			} satisfies UserLevel;

		return this.client.api.interactions.editReply(interaction.application_id, interaction.token, {
			files: [
				{
					data: await this.client.functions.generateLevelCard({ user, userLevel, member }),
					name: "levelCard.png",
				},
			],
			attachments: [
				{
					id: "0",
					filename: "levelCard.png",
				},
			],
		});
	}
}
