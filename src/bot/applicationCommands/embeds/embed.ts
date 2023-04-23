import type { APIApplicationCommandInteraction, RESTPostAPIChannelMessageJSONBody } from "@discordjs/core";
import {
	ChannelType,
	RESTJSONErrorCodes,
	MessageFlags,
	ApplicationCommandOptionType,
	ApplicationCommandType,
	PermissionFlagsBits,
	ButtonStyle,
	ComponentType,
} from "@discordjs/core";
import { DiscordAPIError } from "@discordjs/rest";
import ApplicationCommand from "../../../../lib/classes/ApplicationCommand.js";
import type Language from "../../../../lib/classes/Language.js";
import type ExtendedClient from "../../../../lib/extensions/ExtendedClient.js";
import type { APIInteractionWithArguments } from "../../../../typings/index.js";

export default class Embeds extends ApplicationCommand {
	/**
	 * Create our embeds command.
	 *
	 * @param client - Our extended client.
	 */
	public constructor(client: ExtendedClient) {
		super(client, {
			options: {
				name: client.languageHandler.defaultLanguage!.get("EMBED_COMMAND_NAME"),
				description: client.languageHandler.defaultLanguage!.get("EMBED_COMMAND_DESCRIPTION"),
				name_localizations: client.languageHandler.getFromAllLanguages("EMBED_COMMAND_NAME"),
				description_localizations: client.languageHandler.getFromAllLanguages("EMBED_COMMAND_DESCRIPTION"),
				options: [
					{
						name: client.languageHandler.defaultLanguage!.get("EMBED_CREATE_SUB_COMMAND_NAME"),
						description: client.languageHandler.defaultLanguage!.get("EMBED_CREATE_SUB_COMMAND_DESCRIPTION"),
						name_localizations: client.languageHandler.getFromAllLanguages("EMBED_CREATE_SUB_COMMAND_NAME"),
						description_localizations: client.languageHandler.getFromAllLanguages(
							"EMBED_CREATE_SUB_COMMAND_DESCRIPTION",
						),
						type: ApplicationCommandOptionType.Subcommand,
						options: [
							{
								name: client.languageHandler.defaultLanguage!.get("EMBED_CREATE_SUB_COMMAND_NAME_NAME"),
								description: client.languageHandler.defaultLanguage!.get("EMBED_CREATE_SUB_COMMAND_NAME_DESCRIPTION"),
								name_localizations: client.languageHandler.getFromAllLanguages("EMBED_CREATE_SUB_COMMAND_NAME_NAME"),
								description_localizations: client.languageHandler.getFromAllLanguages(
									"EMBED_CREATE_SUB_COMMAND_NAME_DESCRIPTION",
								),
								type: ApplicationCommandOptionType.String,
								required: true,
							},
							{
								name: client.languageHandler.defaultLanguage!.get("EMBED_CREATE_SUB_COMMAND_DATA_NAME"),
								description: client.languageHandler.defaultLanguage!.get("EMBED_CREATE_SUB_COMMAND_DATA_DESCRIPTION"),
								name_localizations: client.languageHandler.getFromAllLanguages("EMBED_CREATE_SUB_COMMAND_DATA_NAME"),
								description_localizations: client.languageHandler.getFromAllLanguages(
									"EMBED_CREATE_SUB_COMMAND_DATA_DESCRIPTION",
								),
								type: ApplicationCommandOptionType.String,
								required: true,
							},
						],
					},
					{
						name: client.languageHandler.defaultLanguage!.get("EMBED_DELETE_SUB_COMMAND_NAME"),
						description: client.languageHandler.defaultLanguage!.get("EMBED_DELETE_SUB_COMMAND_DESCRIPTION"),
						name_localizations: client.languageHandler.getFromAllLanguages("EMBED_DELETE_SUB_COMMAND_NAME"),
						description_localizations: client.languageHandler.getFromAllLanguages(
							"EMBED_DELETE_SUB_COMMAND_DESCRIPTION",
						),
						type: ApplicationCommandOptionType.Subcommand,
						options: [
							{
								name: client.languageHandler.defaultLanguage!.get("EMBED_CREATE_SUB_COMMAND_NAME_NAME"),
								description: client.languageHandler.defaultLanguage!.get("EMBED_DELETE_SUB_COMMAND_NAME_DESCRIPTION"),
								name_localizations: client.languageHandler.getFromAllLanguages("EMBED_CREATE_SUB_COMMAND_NAME_NAME"),
								description_localizations: client.languageHandler.getFromAllLanguages(
									"EMBED_DELETE_SUB_COMMAND_NAME_DESCRIPTION",
								),
								type: ApplicationCommandOptionType.String,
								autocomplete: true,
								required: true,
							},
						],
					},
					{
						name: client.languageHandler.defaultLanguage!.get("EMBED_SEND_SUB_COMMAND_NAME"),
						description: client.languageHandler.defaultLanguage!.get("EMBED_SEND_SUB_COMMAND_DESCRIPTION"),
						name_localizations: client.languageHandler.getFromAllLanguages("EMBED_SEND_SUB_COMMAND_NAME"),
						description_localizations: client.languageHandler.getFromAllLanguages("EMBED_SEND_SUB_COMMAND_DESCRIPTION"),
						type: ApplicationCommandOptionType.Subcommand,
						options: [
							{
								name: client.languageHandler.defaultLanguage!.get("EMBED_CREATE_SUB_COMMAND_NAME_NAME"),
								description: client.languageHandler.defaultLanguage!.get("EMBED_SEND_SUB_COMMAND_NAME_DESCRIPTION"),
								name_localizations: client.languageHandler.getFromAllLanguages("EMBED_CREATE_SUB_COMMAND_NAME_NAME"),
								description_localizations: client.languageHandler.getFromAllLanguages(
									"EMBED_SEND_SUB_COMMAND_NAME_DESCRIPTION",
								),
								type: ApplicationCommandOptionType.String,
								autocomplete: true,
								required: true,
							},
							{
								name: client.languageHandler.defaultLanguage!.get("EMBED_SEND_SUB_COMMAND_CHANNEL_NAME"),
								description: client.languageHandler.defaultLanguage!.get("EMBED_SEND_SUB_COMMAND_CHANNEL_DESCRIPTION"),
								name_localizations: client.languageHandler.getFromAllLanguages("EMBED_SEND_SUB_COMMAND_CHANNEL_NAME"),
								description_localizations: client.languageHandler.getFromAllLanguages(
									"EMBED_SEND_SUB_COMMAND_CHANNEL_DESCRIPTION",
								),
								type: ApplicationCommandOptionType.Channel,
								channel_types: [ChannelType.GuildText],
								required: true,
							},
						],
					},
					{
						name: client.languageHandler.defaultLanguage!.get("EMBED_LIST_SUB_COMMAND_NAME"),
						description: client.languageHandler.defaultLanguage!.get("EMBED_LIST_SUB_COMMAND_DESCRIPTION"),
						name_localizations: client.languageHandler.getFromAllLanguages("EMBED_LIST_SUB_COMMAND_NAME"),
						description_localizations: client.languageHandler.getFromAllLanguages("EMBED_LIST_SUB_COMMAND_DESCRIPTION"),
						type: ApplicationCommandOptionType.Subcommand,
					},
				],
				type: ApplicationCommandType.ChatInput,
				dm_permission: false,
				default_member_permissions: PermissionFlagsBits.ManageGuild.toString(),
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
		this.client.logger.debug(interaction.arguments);

		if (
			interaction.arguments.subCommand!.name ===
			this.client.languageHandler.defaultLanguage!.get("EMBED_CREATE_SUB_COMMAND_NAME")
		) {
			const embedName =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get("EMBED_CREATE_SUB_COMMAND_NAME_NAME")
				]!.value;
			let messagePayload;

			try {
				messagePayload = JSON.parse(
					interaction.arguments.strings![
						this.client.languageHandler.defaultLanguage!.get("EMBED_CREATE_SUB_COMMAND_DATA_NAME")
					]!.value,
				);
			} catch (error) {
				if (error instanceof SyntaxError)
					return this.client.api.interactions.reply(interaction.id, interaction.token, {
						embeds: [
							{
								title: language.get("INVALID_ARGUMENT_TITLE"),
								description: language.get("INVALID_ARGUMENT_JSON_DESCRIPTION"),
								color: this.client.config.colors.error,
							},
						],
						flags: MessageFlags.Ephemeral,
						allowed_mentions: { parse: [] },
					});

				throw error;
			}

			return Promise.all([
				this.client.prisma.embed.upsert({
					where: {
						embedName_guildId: {
							embedName,
							guildId: interaction.guild_id!,
						},
					},
					create: {
						embedName,
						messagePayload,
						guildId: interaction.guild_id!,
					},
					update: {
						embedName,
						messagePayload,
						guildId: interaction.guild_id!,
					},
				}),
				this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("EMBED_CREATED_TITLE"),
							description: language.get("EMBED_CREATED_DESCRIPTION", {
								name: embedName,
								channel: interaction.channel.name,
							}),
							color: this.client.config.colors.success,
						},
					],
					allowed_mentions: { parse: [] },
				}),
			]);
		} else if (
			interaction.arguments.subCommand!.name ===
			this.client.languageHandler.defaultLanguage!.get("EMBED_DELETE_SUB_COMMAND_NAME")
		) {
			const embedName =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get("EMBED_CREATE_SUB_COMMAND_NAME_NAME")
				]!.value;

			return Promise.all([
				this.client.prisma.embed.delete({
					where: {
						embedName_guildId: {
							embedName,
							guildId: interaction.guild_id!,
						},
					},
				}),
				this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("EMBED_DELETED_TITLE"),
							description: language.get("EMBED_DELETED_DESCRIPTION", {
								name: embedName,
							}),
							color: this.client.config.colors.success,
						},
					],
					allowed_mentions: { parse: [] },
				}),
			]);
		} else if (
			interaction.arguments.subCommand!.name ===
			this.client.languageHandler.defaultLanguage!.get("EMBED_SEND_SUB_COMMAND_NAME")
		) {
			const embedName =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get("EMBED_CREATE_SUB_COMMAND_NAME_NAME")
				]!.value;

			const embed = await this.client.prisma.embed.findUnique({
				where: { embedName_guildId: { embedName, guildId: interaction.guild_id! } },
			});

			if (!embed) return this.client.api.interactions.reply(interaction.id, interaction.token, {});

			let message;

			try {
				message = await this.client.api.channels.createMessage(
					interaction.arguments.channels![
						this.client.languageHandler.defaultLanguage!.get("EMBED_SEND_SUB_COMMAND_CHANNEL_NAME")
					]!.id,
					{ ...(embed.messagePayload as RESTPostAPIChannelMessageJSONBody), allowed_mentions: { parse: [] } },
				);
			} catch (error) {
				if (error instanceof DiscordAPIError && error.code === RESTJSONErrorCodes.RequestBodyContainsInvalidJSON)
					return this.client.api.interactions.reply(interaction.id, interaction.token, {
						embeds: [
							{
								title: language.get("INVALID_ARGUMENT_TITLE"),
								description: language.get("INVALID_ARGUMENT_JSON_DESCRIPTION"),
								color: this.client.config.colors.error,
							},
						],
						allowed_mentions: { parse: [] },
						flags: MessageFlags.Ephemeral,
					});

				throw error;
			}

			return this.client.api.interactions.reply(interaction.id, interaction.token, {
				embeds: [
					{
						title: language.get("EMBED_SENT_TITLE"),
						description: language.get("EMBED_SENT_DESCRIPTION", {
							name: embedName,
							channelId: message.channel_id,
						}),
						color: this.client.config.colors.success,
					},
				],
				components: [
					{
						components: [
							{
								style: ButtonStyle.Link,
								type: ComponentType.Button,
								url: `https://discord.com/channels/${interaction.guild_id!}/${message.channel_id}/${message.id}`,
								label: language.get("JUMP_TO_MESSAGE_BUTTON_LABEL"),
							},
						],
						type: ComponentType.ActionRow,
					},
				],
				allowed_mentions: { parse: [] },
			});
		}

		const embeds = await this.client.prisma.embed.findMany({ where: { guildId: interaction.guild_id! } });

		return this.client.api.interactions.reply(interaction.id, interaction.token, {
			embeds: [
				{
					title: language.get("EMBED_LIST_TITLE"),
					description: embeds.length
						? embeds.map((embed) => `\`${embed.embedName}\``).join(", ")
						: language.get("EMBED_LIST_DESCRIPTION_NONE"),
					color: this.client.config.colors.success,
				},
			],
			allowed_mentions: { parse: [] },
		});
	}
}
