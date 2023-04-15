import { ApplicationCommandType } from "@discordjs/core";
import type { APIContextMenuInteraction, APIUserApplicationCommandInteractionData } from "@discordjs/core";
import type { UserLevel } from "@prisma/client";
import ApplicationCommand from "../../../../lib/classes/ApplicationCommand.js";
import type Language from "../../../../lib/classes/Language.js";
import type ExtendedClient from "../../../../lib/extensions/ExtendedClient.js";
import type { APIInteractionWithArguments } from "../../../../typings/index.js";

export default class LevelContextMenuCommand extends ApplicationCommand {
	/**
	 * Create our level command.
	 *
	 * @param client Our extended client.
	 */
	public constructor(client: ExtendedClient) {
		super(client, {
			options: {
				name: client.languageHandler.defaultLanguage!.get("LEVEL_USER_COMMAND_NAME"),
				name_localizations: client.languageHandler.getFromAllLanguages("LEVEL_USER_COMMAND_NAME"),
				type: ApplicationCommandType.User,
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
	}: {
		interaction: APIInteractionWithArguments<APIContextMenuInteraction>;
		language: Language;
		shardId: number;
	}) {
		await this.client.api.interactions.defer(interaction.id, interaction.token, {});

		const user = (interaction.data as APIUserApplicationCommandInteractionData).resolved.users[
			interaction.data.target_id
		]!;
		const member = (interaction.data as APIUserApplicationCommandInteractionData).resolved.members![
			interaction.data.target_id
		]!;

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
