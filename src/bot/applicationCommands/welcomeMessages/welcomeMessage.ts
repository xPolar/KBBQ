import type { APIApplicationCommandInteraction } from "@discordjs/core";
import { ApplicationCommandOptionType, ChannelType, ApplicationCommandType } from "@discordjs/core";
import ApplicationCommand from "../../../../lib/classes/ApplicationCommand.js";
import type Language from "../../../../lib/classes/Language.js";
import type ExtendedClient from "../../../../lib/extensions/ExtendedClient.js";
import type { APIInteractionWithArguments } from "../../../../typings/index.js";

export default class WelcomeMessage extends ApplicationCommand {
	/**
	 * Create our status role command.
	 *
	 * @param client - Our extended client.
	 */
	public constructor(client: ExtendedClient) {
		super(client, {
			options: {
				name: client.languageHandler.defaultLanguage!.get("WELCOME_MESSAGE_COMMAND_NAME"),
				description: client.languageHandler.defaultLanguage!.get("WELCOME_MESSAGE_COMMAND_DESCRIPTION"),
				name_localizations: client.languageHandler.getFromAllLanguages("WELCOME_MESSAGE_COMMAND_NAME"),
				description_localizations: client.languageHandler.getFromAllLanguages("WELCOME_MESSAGE_COMMAND_DESCRIPTION"),
				type: ApplicationCommandType.ChatInput,
				options: [
					{
						name: client.languageHandler.defaultLanguage!.get("WELCOME_MESSAGE_CREATE_SUB_COMMAND_NAME"),
						description: client.languageHandler.defaultLanguage!.get("WELCOME_MESSAGE_CREATE_SUB_COMMAND_DESCRIPTION"),
						name_localizations: client.languageHandler.getFromAllLanguages("WELCOME_MESSAGE_CREATE_SUB_COMMAND_NAME"),
						description_localizations: client.languageHandler.getFromAllLanguages(
							"WELCOME_MESSAGE_CREATE_SUB_COMMAND_DESCRIPTION",
						),
						type: ApplicationCommandOptionType.Subcommand,
						options: [
							{
								name: client.languageHandler.defaultLanguage!.get("WELCOME_MESSAGE_CREATE_SUB_COMMAND_CHANNEL_NAME"),
								description: client.languageHandler.defaultLanguage!.get(
									"WELCOME_MESSAGE_CREATE_SUB_COMMAND_CHANNEL_DESCRIPTION",
								),
								name_localizations: client.languageHandler.getFromAllLanguages(
									"WELCOME_MESSAGE_CREATE_SUB_COMMAND_CHANNEL_NAME",
								),
								description_localizations: client.languageHandler.getFromAllLanguages(
									"WELCOME_MESSAGE_CREATE_SUB_COMMAND_CHANNEL_DESCRIPTION",
								),
								type: ApplicationCommandOptionType.Channel,
								channel_types: [ChannelType.GuildText],
								required: true,
							},
							{
								name: client.languageHandler.defaultLanguage!.get("WELCOME_MESSAGE_CREATE_SUB_COMMAND_EMBED_NAME"),
								description: client.languageHandler.defaultLanguage!.get(
									"WELCOME_MESSAGE_CREATE_SUB_COMMAND_EMBED_DESCRIPTION",
								),
								name_localizations: client.languageHandler.getFromAllLanguages(
									"WELCOME_MESSAGE_CREATE_SUB_COMMAND_EMBED_NAME",
								),
								description_localizations: client.languageHandler.getFromAllLanguages(
									"WELCOME_MESSAGE_CREATE_SUB_COMMAND_EMBED_DESCRIPTION",
								),
								type: ApplicationCommandOptionType.String,
								required: true,
								autocomplete: true,
							},
						],
					},
					{
						name: client.languageHandler.defaultLanguage!.get("WELCOME_MESSAGE_REMOVE_SUB_COMMAND_NAME"),
						description: client.languageHandler.defaultLanguage!.get("WELCOME_MESSAGE_REMOVE_SUB_COMMAND_DESCRIPTION"),
						name_localizations: client.languageHandler.getFromAllLanguages("WELCOME_MESSAGE_REMOVE_SUB_COMMAND_NAME"),
						description_localizations: client.languageHandler.getFromAllLanguages(
							"WELCOME_MESSAGE_REMOVE_SUB_COMMAND_DESCRIPTION",
						),
						type: ApplicationCommandOptionType.Subcommand,
						options: [
							{
								name: client.languageHandler.defaultLanguage!.get(
									"WELCOME_MESSAGE_REMOVE_SUB_COMMAND_WELCOME_MESSAGE_NAME",
								),
								description: client.languageHandler.defaultLanguage!.get(
									"WELCOME_MESSAGE_REMOVE_SUB_COMMAND_WELCOME_MESSAGE_DESCRIPTION",
								),
								name_localizations: client.languageHandler.getFromAllLanguages(
									"WELCOME_MESSAGE_REMOVE_SUB_COMMAND_WELCOME_MESSAGE_NAME",
								),
								description_localizations: client.languageHandler.getFromAllLanguages(
									"WELCOME_MESSAGE_REMOVE_SUB_COMMAND_WELCOME_MESSAGE_DESCRIPTION",
								),
								type: ApplicationCommandOptionType.String,
								required: true,
								autocomplete: true,
							},
						],
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
		language,
	}: {
		interaction: APIInteractionWithArguments<APIApplicationCommandInteraction>;
		language: Language;
		shardId: number;
	}) {
		if (
			interaction.arguments.subCommand!.name ===
			this.client.languageHandler.defaultLanguage!.get("WELCOME_MESSAGE_CREATE_SUB_COMMAND_NAME")
		) {
			const embedName =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get("WELCOME_MESSAGE_CREATE_SUB_COMMAND_EMBED_NAME")
				]!.value;

			const embed = await this.client.prisma.embed.findUnique({
				where: { embedName_guildId: { embedName, guildId: interaction.guild_id! } },
			});

			if (!embed)
				return this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("INVALID_ARGUMENT_TITLE"),
							description: language.get("INVALID_ARGUMENT_EMBED_DESCRIPTION"),
							color: this.client.config.colors.error,
						},
					],
					allowed_mentions: { parse: [] },
				});

			return Promise.all([
				this.client.prisma.welcomeMessage.create({
					data: {
						channelId:
							interaction.arguments.channels![
								this.client.languageHandler.defaultLanguage!.get("WELCOME_MESSAGE_CREATE_SUB_COMMAND_CHANNEL_NAME")
							]!.id,
						embedName,
						guildId: interaction.guild_id!,
					},
				}),
				this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("WELCOME_MESSAGE_CREATED_TITLE"),
							description: language.get("WELCOME_MESSAGE_CREATED_DESCRIPTION", {
								channelMention: `<#${
									interaction.arguments.channels![
										this.client.languageHandler.defaultLanguage!.get("WELCOME_MESSAGE_CREATE_SUB_COMMAND_CHANNEL_NAME")
									]!.id
								}>`,
								embedName,
							}),
							color: this.client.config.colors.success,
						},
					],
					allowed_mentions: { parse: [] },
				}),
			]);
		}

		return Promise.all([
			this.client.prisma.welcomeMessage.delete({
				where: {
					id: interaction.arguments.strings![
						this.client.languageHandler.defaultLanguage!.get("WELCOME_MESSAGE_REMOVE_SUB_COMMAND_WELCOME_MESSAGE_NAME")
					]!.value,
				},
			}),
			this.client.api.interactions.reply(interaction.id, interaction.token, {
				embeds: [
					{
						title: language.get("WELCOME_MESSAGE_DELETED_TITLE"),
						description: language.get("WELCOME_MESSAGE_DELETED_DESCRIPTION"),
						color: this.client.config.colors.success,
					},
				],
				allowed_mentions: { parse: [] },
			}),
		]);
	}
}
