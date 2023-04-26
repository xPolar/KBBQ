import type { APIApplicationCommandInteraction } from "@discordjs/core";
import {
	PermissionFlagsBits,
	ApplicationCommandOptionType,
	ChannelType,
	ApplicationCommandType,
} from "@discordjs/core";
import ApplicationCommand from "../../../../lib/classes/ApplicationCommand.js";
import type Language from "../../../../lib/classes/Language.js";
import type ExtendedClient from "../../../../lib/extensions/ExtendedClient.js";
import type { APIInteractionWithArguments } from "../../../../typings/index.js";

export default class StatusRole extends ApplicationCommand {
	/**
	 * Create our status role command.
	 *
	 * @param client - Our extended client.
	 */
	public constructor(client: ExtendedClient) {
		super(client, {
			options: {
				name: client.languageHandler.defaultLanguage!.get("STATUS_ROLE_COMMAND_NAME"),
				description: client.languageHandler.defaultLanguage!.get("STATUS_ROLE_COMMAND_DESCRIPTION"),
				name_localizations: client.languageHandler.getFromAllLanguages("STATUS_ROLE_COMMAND_NAME"),
				description_localizations: client.languageHandler.getFromAllLanguages("STATUS_ROLE_COMMAND_DESCRIPTION"),
				type: ApplicationCommandType.ChatInput,
				options: [
					{
						name: client.languageHandler.defaultLanguage!.get("STATUS_ROLE_CREATE_SUB_COMMAND_NAME"),
						description: client.languageHandler.defaultLanguage!.get("STATUS_ROLE_CREATE_SUB_COMMAND_DESCRIPTION"),
						name_localizations: client.languageHandler.getFromAllLanguages("STATUS_ROLE_CREATE_SUB_COMMAND_NAME"),
						description_localizations: client.languageHandler.getFromAllLanguages(
							"STATUS_ROLE_CREATE_SUB_COMMAND_DESCRIPTION",
						),
						type: ApplicationCommandOptionType.Subcommand,
						options: [
							{
								name: client.languageHandler.defaultLanguage!.get("STATUS_ROLE_CREATE_SUB_COMMAND_ROLE_NAME"),
								description: client.languageHandler.defaultLanguage!.get(
									"STATUS_ROLE_CREATE_SUB_COMMAND_ROLE_DESCRIPTION",
								),
								name_localizations: client.languageHandler.getFromAllLanguages(
									"STATUS_ROLE_CREATE_SUB_COMMAND_ROLE_NAME",
								),
								description_localizations: client.languageHandler.getFromAllLanguages(
									"STATUS_ROLE_CREATE_SUB_COMMAND_ROLE_DESCRIPTION",
								),
								type: ApplicationCommandOptionType.Role,
								required: true,
							},
							{
								name: client.languageHandler.defaultLanguage!.get("STATUS_ROLE_CREATE_SUB_COMMAND_TEXT_NAME"),
								description: client.languageHandler.defaultLanguage!.get(
									"STATUS_ROLE_CREATE_SUB_COMMAND_TEXT_DESCRIPTION",
								),
								name_localizations: client.languageHandler.getFromAllLanguages(
									"STATUS_ROLE_CREATE_SUB_COMMAND_TEXT_NAME",
								),
								description_localizations: client.languageHandler.getFromAllLanguages(
									"STATUS_ROLE_CREATE_SUB_COMMAND_TEXT_DESCRIPTION",
								),
								type: ApplicationCommandOptionType.String,
								required: true,
							},
							{
								name: client.languageHandler.defaultLanguage!.get("STATUS_ROLE_CREATE_SUB_COMMAND_CHANNEL_NAME"),
								description: client.languageHandler.defaultLanguage!.get(
									"STATUS_ROLE_CREATE_SUB_COMMAND_CHANNEL_DESCRIPTION",
								),
								name_localizations: client.languageHandler.getFromAllLanguages(
									"STATUS_ROLE_CREATE_SUB_COMMAND_CHANNEL_NAME",
								),
								description_localizations: client.languageHandler.getFromAllLanguages(
									"STATUS_ROLE_CREATE_SUB_COMMAND_CHANNEL_DESCRIPTION",
								),
								type: ApplicationCommandOptionType.Channel,
								channel_types: [ChannelType.GuildText],
							},
							{
								name: client.languageHandler.defaultLanguage!.get("STATUS_ROLE_CREATE_SUB_COMMAND_EMBED_NAME"),
								description: client.languageHandler.defaultLanguage!.get(
									"STATUS_ROLE_CREATE_SUB_COMMAND_EMBED_DESCRIPTION",
								),
								name_localizations: client.languageHandler.getFromAllLanguages(
									"STATUS_ROLE_CREATE_SUB_COMMAND_EMBED_NAME",
								),
								description_localizations: client.languageHandler.getFromAllLanguages(
									"STATUS_ROLE_CREATE_SUB_COMMAND_EMBED_DESCRIPTION",
								),
								type: ApplicationCommandOptionType.String,
								autocomplete: true,
							},
						],
					},
					{
						name: client.languageHandler.defaultLanguage!.get("STATUS_ROLE_DELETE_SUB_COMMAND_NAME"),
						description: client.languageHandler.defaultLanguage!.get("STATUS_ROLE_DELETE_SUB_COMMAND_DESCRIPTION"),
						name_localizations: client.languageHandler.getFromAllLanguages("STATUS_ROLE_DELETE_SUB_COMMAND_NAME"),
						description_localizations: client.languageHandler.getFromAllLanguages(
							"STATUS_ROLE_DELETE_SUB_COMMAND_DESCRIPTION",
						),
						type: ApplicationCommandOptionType.Subcommand,
						options: [
							{
								name: client.languageHandler.defaultLanguage!.get(
									"STATUS_ROLE_DELETE_SUB_COMMAND_STATUS_ROLE_CHOICE_NAME",
								),
								description: client.languageHandler.defaultLanguage!.get(
									"STATUS_ROLE_DELETE_SUB_COMMAND_STATUS_ROLE_CHOICE_DESCRIPTION",
								),
								name_localizations: client.languageHandler.getFromAllLanguages(
									"STATUS_ROLE_DELETE_SUB_COMMAND_STATUS_ROLE_CHOICE_NAME",
								),
								description_localizations: client.languageHandler.getFromAllLanguages(
									"STATUS_ROLE_DELETE_SUB_COMMAND_STATUS_ROLE_CHOICE_DESCRIPTION",
								),
								type: ApplicationCommandOptionType.String,
								autocomplete: true,
								required: true,
							},
						],
					},
					{
						name: client.languageHandler.defaultLanguage!.get("STATUS_ROLE_LIST_SUB_COMMAND_NAME"),
						description: client.languageHandler.defaultLanguage!.get("STATUS_ROLE_LIST_SUB_COMMAND_DESCRIPTION"),
						name_localizations: client.languageHandler.getFromAllLanguages("STATUS_ROLE_LIST_SUB_COMMAND_NAME"),
						description_localizations: client.languageHandler.getFromAllLanguages(
							"STATUS_ROLE_LIST_SUB_COMMAND_DESCRIPTION",
						),
						type: ApplicationCommandOptionType.Subcommand,
					},
				],
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
		if (
			interaction.arguments.subCommand!.name ===
			this.client.languageHandler.defaultLanguage!.get("STATUS_ROLE_CREATE_SUB_COMMAND_NAME")
		) {
			const roleId =
				interaction.arguments.roles![
					this.client.languageHandler.defaultLanguage!.get("STATUS_ROLE_CREATE_SUB_COMMAND_ROLE_NAME")
				]!.id;
			const requiredText =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get("STATUS_ROLE_CREATE_SUB_COMMAND_TEXT_NAME")
				]!.value;

			const embedName =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get("STATUS_ROLE_CREATE_SUB_COMMAND_EMBED_NAME")
				]?.value ?? null;
			const channelId =
				interaction.arguments.channels![
					this.client.languageHandler.defaultLanguage!.get("STATUS_ROLE_CREATE_SUB_COMMAND_CHANNEL_NAME")
				]?.id ?? null;

			if ((embedName && !channelId) || (!embedName && channelId))
				return this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("INVALID_ARGUMENT_TITLE"),
							description: language.get(
								embedName && !channelId
									? "STATUS_ROLE_CHANNEL_MISSING_DESCRIPTION"
									: "STATUS_ROLE_EMBED_MISSING_DESCRIPTION",
							),
							color: this.client.config.colors.error,
						},
					],
					allowed_mentions: { parse: [] },
				});

			return Promise.all([
				this.client.prisma.statusRole.upsert({
					where: {
						guildId_roleId_requiredText: {
							guildId: interaction.guild_id!,
							roleId,
							requiredText,
						},
					},
					create: {
						guildId: interaction.guild_id!,
						roleId,
						requiredText,
						channelId,
						embedName,
					},
					update: {
						embedName,
						channelId,
					},
				}),
				this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("STATUS_ROLE_CREATED_TITLE"),
							description: language.get("STATUS_ROLE_CREATED_DESCRIPTION"),
							color: this.client.config.colors.success,
						},
					],
					allowed_mentions: { parse: [] },
				}),
			]);
		} else if (
			interaction.arguments.subCommand!.name ===
			this.client.languageHandler.defaultLanguage!.get("STATUS_ROLE_DELETE_SUB_COMMAND_NAME")
		) {
			return Promise.all([
				this.client.prisma.statusRole.delete({
					where: {
						id: interaction.arguments.strings![
							this.client.languageHandler.defaultLanguage!.get("STATUS_ROLE_DELETE_SUB_COMMAND_STATUS_ROLE_CHOICE_NAME")
						]!.value,
					},
				}),
				this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("STATUS_ROLE_DELETED_TITLE"),
							description: language.get("STATUS_ROLE_DELETED_DESCRIPTION"),
							color: this.client.config.colors.success,
						},
					],
					allowed_mentions: { parse: [] },
				}),
			]);
		}

		const statusRoles = await this.client.prisma.statusRole.findMany({ where: { guildId: interaction.guild_id! } });

		return this.client.api.interactions.reply(interaction.id, interaction.token, {
			embeds: [
				{
					title: language.get("EMBED_LIST_TITLE"),
					description: statusRoles.length
						? statusRoles.map((statusRole) => `\`${statusRole.requiredText}\`: <@&${statusRole.roleId}>`).join("\n")
						: language.get("EMBED_LIST_DESCRIPTION_NONE"),
					color: this.client.config.colors.success,
				},
			],
			allowed_mentions: { parse: [] },
		});
	}
}
