import type {
	APIActionRowComponent,
	APIApplicationCommandInteraction,
	APIButtonComponent,
	RESTPostAPIChannelMessageJSONBody,
	APIPartialEmoji,
} from "@discordjs/core";
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
import type { EmojiType } from "@prisma/client";
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
						name: client.languageHandler.defaultLanguage!.get("EMBED_BUTTONS_SUB_COMMAND_GROUP_NAME"),
						description: client.languageHandler.defaultLanguage!.get("EMBED_BUTTONS_SUB_COMMAND_GROUP_DESCRIPTION"),
						name_localizations: client.languageHandler.getFromAllLanguages("EMBED_BUTTONS_SUB_COMMAND_GROUP_NAME"),
						description_localizations: client.languageHandler.getFromAllLanguages(
							"EMBED_BUTTONS_SUB_COMMAND_GROUP_DESCRIPTION",
						),
						type: ApplicationCommandOptionType.SubcommandGroup,
						options: [
							{
								name: client.languageHandler.defaultLanguage!.get("EMBED_BUTTONS_ADD_SUB_COMMAND_NAME"),
								description: client.languageHandler.defaultLanguage!.get("EMBED_BUTTONS_ADD_SUB_COMMAND_DESCRIPTION"),
								name_localizations: client.languageHandler.getFromAllLanguages("EMBED_BUTTONS_ADD_SUB_COMMAND_NAME"),
								description_localizations: client.languageHandler.getFromAllLanguages(
									"EMBED_BUTTONS_ADD_SUB_COMMAND_DESCRIPTION",
								),
								type: ApplicationCommandOptionType.Subcommand,
								options: [
									{
										name: client.languageHandler.defaultLanguage!.get("EMBED_BUTTONS_ADD_SUB_COMMAND_EMBED_NAME"),
										description: client.languageHandler.defaultLanguage!.get(
											"EMBED_BUTTONS_ADD_SUB_COMMAND_EMBED_DESCRIPTION",
										),
										name_localizations: client.languageHandler.getFromAllLanguages(
											"EMBED_BUTTONS_ADD_SUB_COMMAND_EMBED_NAME",
										),
										description_localizations: client.languageHandler.getFromAllLanguages(
											"EMBED_BUTTONS_ADD_SUB_COMMAND_EMBED_DESCRIPTION",
										),
										type: ApplicationCommandOptionType.String,
										required: true,
										autocomplete: true,
									},
									{
										name: client.languageHandler.defaultLanguage!.get("EMBED_BUTTONS_ADD_SUB_COMMAND_LABEL_NAME"),
										description: client.languageHandler.defaultLanguage!.get(
											"EMBED_BUTTONS_ADD_SUB_COMMAND_LABEL_DESCRIPTION",
										),
										name_localizations: client.languageHandler.getFromAllLanguages(
											"EMBED_BUTTONS_ADD_SUB_COMMAND_LABEL_NAME",
										),
										description_localizations: client.languageHandler.getFromAllLanguages(
											"EMBED_BUTTONS_ADD_SUB_COMMAND_LABEL_DESCRIPTION",
										),
										type: ApplicationCommandOptionType.String,
										required: true,
									},
									{
										name: client.languageHandler.defaultLanguage!.get("EMBED_BUTTONS_ADD_SUB_COMMAND_URL_NAME"),
										description: client.languageHandler.defaultLanguage!.get(
											"EMBED_BUTTONS_ADD_SUB_COMMAND_URL_DESCRIPTION",
										),
										name_localizations: client.languageHandler.getFromAllLanguages(
											"EMBED_BUTTONS_ADD_SUB_COMMAND_URL_NAME",
										),
										description_localizations: client.languageHandler.getFromAllLanguages(
											"EMBED_BUTTONS_ADD_SUB_COMMAND_URL_DESCRIPTION",
										),
										type: ApplicationCommandOptionType.String,
										required: true,
									},
									{
										name: client.languageHandler.defaultLanguage!.get("EMBED_BUTTONS_ADD_SUB_COMMAND_EMOJI_NAME"),
										description: client.languageHandler.defaultLanguage!.get(
											"EMBED_BUTTONS_ADD_SUB_COMMAND_EMOJI_DESCRIPTION",
										),
										name_localizations: client.languageHandler.getFromAllLanguages(
											"EMBED_BUTTONS_ADD_SUB_COMMAND_EMOJI_NAME",
										),
										description_localizations: client.languageHandler.getFromAllLanguages(
											"EMBED_BUTTONS_ADD_SUB_COMMAND_EMOJI_DESCRIPTION",
										),
										type: ApplicationCommandOptionType.String,
									},
								],
							},
							{
								name: client.languageHandler.defaultLanguage!.get("EMBED_BUTTONS_REMOVE_SUB_COMMAND_NAME"),
								description: client.languageHandler.defaultLanguage!.get(
									"EMBED_BUTTONS_REMOVE_SUB_COMMAND_DESCRIPTION",
								),
								name_localizations: client.languageHandler.getFromAllLanguages("EMBED_BUTTONS_REMOVE_SUB_COMMAND_NAME"),
								description_localizations: client.languageHandler.getFromAllLanguages(
									"EMBED_BUTTONS_REMOVE_SUB_COMMAND_DESCRIPTION",
								),
								type: ApplicationCommandOptionType.Subcommand,
								options: [
									{
										name: client.languageHandler.defaultLanguage!.get("EMBED_BUTTONS_REMOVE_SUB_COMMAND_EMBED_NAME"),
										description: client.languageHandler.defaultLanguage!.get(
											"EMBED_BUTTONS_REMOVE_SUB_COMMAND_EMBED_DESCRIPTION",
										),
										name_localizations: client.languageHandler.getFromAllLanguages(
											"EMBED_BUTTONS_REMOVE_SUB_COMMAND_EMBED_NAME",
										),
										description_localizations: client.languageHandler.getFromAllLanguages(
											"EMBED_BUTTONS_REMOVE_SUB_COMMAND_EMBED_DESCRIPTION",
										),
										type: ApplicationCommandOptionType.String,
										required: true,
										autocomplete: true,
									},
									{
										name: client.languageHandler.defaultLanguage!.get("EMBED_BUTTONS_REMOVE_SUB_COMMAND_BUTTON_NAME"),
										description: client.languageHandler.defaultLanguage!.get(
											"EMBED_BUTTONS_REMOVE_SUB_COMMAND_BUTTON_DESCRIPTION",
										),
										name_localizations: client.languageHandler.getFromAllLanguages(
											"EMBED_BUTTONS_REMOVE_SUB_COMMAND_BUTTON_NAME",
										),
										description_localizations: client.languageHandler.getFromAllLanguages(
											"EMBED_BUTTONS_REMOVE_SUB_COMMAND_BUTTON_DESCRIPTION",
										),
										type: ApplicationCommandOptionType.String,
										required: true,
										autocomplete: true,
									},
								],
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
		if (
			interaction.arguments.subCommandGroup?.name ===
			this.client.languageHandler.defaultLanguage!.get("EMBED_BUTTONS_SUB_COMMAND_GROUP_NAME")
		) {
			if (
				interaction.arguments.subCommand!.name ===
				this.client.languageHandler.defaultLanguage!.get("EMBED_BUTTONS_ADD_SUB_COMMAND_NAME")
			) {
				const embedName =
					interaction.arguments.strings![
						this.client.languageHandler.defaultLanguage!.get("EMBED_BUTTONS_ADD_SUB_COMMAND_EMBED_NAME")
					]!.value;

				const embed = await this.client.prisma.embed.findUnique({
					where: { embedName_guildId: { embedName, guildId: interaction.guild_id! } },
					include: { messageComponents: true },
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

				const buttonLabel =
					interaction.arguments.strings![
						this.client.languageHandler.defaultLanguage!.get("EMBED_BUTTONS_ADD_SUB_COMMAND_LABEL_NAME")
					]!.value;

				if (buttonLabel.length > 80)
					return this.client.api.interactions.reply(interaction.id, interaction.token, {
						embeds: [
							{
								title: language.get("INVALID_ARGUMENT_TITLE"),
								description: language.get("INVALID_ARGUMENT_LABEL_DESCRIPTION", { length: buttonLabel.length }),
								color: this.client.config.colors.error,
							},
						],
						allowed_mentions: { parse: [] },
					});

				const buttonURL =
					interaction.arguments.strings![
						this.client.languageHandler.defaultLanguage!.get("EMBED_BUTTONS_ADD_SUB_COMMAND_URL_NAME")
					]!.value;

				const emoji =
					interaction.arguments.strings![
						this.client.languageHandler.defaultLanguage!.get("EMBED_BUTTONS_ADD_SUB_COMMAND_EMOJI_NAME")
					]?.value;

				let emojiObject = {} as APIPartialEmoji & {
					type: EmojiType;
				};

				if (emoji) {
					const customEmojiMatch = /^<a?:(?<name>\w+):(?<id>\d+)>$/.exec(emoji);

					if (customEmojiMatch) {
						const response = await fetch(
							`https://discord.storage.googleapis.com/emojis/${customEmojiMatch.groups!.id}`,
						);

						if ([404, 500].includes(response.status))
							return this.client.api.interactions.reply(interaction.id, interaction.token, {
								embeds: [
									{
										title: language.get("INVALID_ARGUMENT_TITLE"),
										description: language.get("INVALID_ARGUMENT_EMOJI_DESCRIPTION"),
										color: this.client.config.colors.error,
									},
								],
								flags: MessageFlags.Ephemeral,
								allowed_mentions: { parse: [] },
							});

						emojiObject = {
							id: customEmojiMatch.groups!.id!,
							name: customEmojiMatch.groups!.name!,
							animated: emoji.startsWith("<a:"),
							type: "CUSTOM",
						};
					} else {
						const defaultEmojiMatch =
							/[\u{1F300}-\u{1F5FF}\u{1F900}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F191}-\u{1F251}\u{1F004}\u{1F0CF}\u{1F170}-\u{1F171}\u{1F17E}-\u{1F17F}\u{1F18E}\u{3030}\u{2B50}\u{2B55}\u{2934}-\u{2935}\u{2B05}-\u{2B07}\u{2B1B}-\u{2B1C}\u{3297}\u{3299}\u{303D}\u{00A9}\u{00AE}\u{2122}\u{23F3}\u{24C2}\u{23E9}-\u{23EF}\u{25B6}\u{23F8}-\u{23FA}]/gu.exec(
								emoji,
							);

						if (!defaultEmojiMatch)
							return this.client.api.interactions.reply(interaction.id, interaction.token, {
								embeds: [
									{
										title: language.get("INVALID_ARGUMENT_TITLE"),
										description: language.get("INVALID_ARGUMENT_EMOJI_DESCRIPTION"),
										color: this.client.config.colors.error,
									},
								],
								flags: MessageFlags.Ephemeral,
								allowed_mentions: { parse: [] },
							});

						emojiObject = {
							id: null,
							name: emoji,
							type: "DEFAULT",
						};
					}
				}

				return Promise.all([
					this.client.prisma.messageComponent.create({
						data: {
							guildId: interaction.guild_id!,
							embedName,
							label: buttonLabel,
							url: buttonURL,
							position: (embed.messageComponents.length as number) + 1,
							emojiId: emojiObject.id,
							emojiName: emojiObject.name,
							emojiType: emojiObject.type,
						},
					}),
					this.client.api.interactions.reply(interaction.id, interaction.token, {
						embeds: [
							{
								title: language.get("EMBED_BUTTON_ADDED_TITLE"),
								description: language.get("EMBED_BUTTON_ADDED_DESCRIPTION", { buttonLabel, embedName }),
								color: this.client.config.colors.success,
							},
						],
						allowed_mentions: { parse: [] },
					}),
				]);
			}

			const componentId =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get("EMBED_BUTTONS_REMOVE_SUB_COMMAND_BUTTON_NAME")
				]!.value;

			const component = await this.client.prisma.messageComponent.delete({ where: { id: componentId } });

			return Promise.all([
				this.client.prisma.messageComponent.updateMany({
					where: { guildId: component.guildId, embedName: component.embedName, position: { gte: component.position } },
					data: { position: { decrement: 1 } },
				}),
				this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("EMBED_BUTTON_REMOVED_TITLE"),
							description: language.get("EMBED_BUTTON_REMOVED_DESCRIPTION"),
							color: this.client.config.colors.success,
						},
					],
					allowed_mentions: { parse: [] },
				}),
			]);
		}

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

			const messageComponents = await this.client.prisma.messageComponent.findMany({
				where: { embedName, guildId: interaction.guild_id! },
				orderBy: { position: "asc" },
			});

			const actionRows: APIActionRowComponent<APIButtonComponent>[] = [];
			let currentActionRow: APIButtonComponent[] = [];

			let index = 0;

			for (const messageComponent of messageComponents) {
				if (index !== 0 && index % 5 === 0) {
					actionRows.push({
						components: currentActionRow,
						type: ComponentType.ActionRow,
					});

					currentActionRow = [];
				}

				const currentComponent = {
					style: ButtonStyle.Link,
					type: ComponentType.Button,
					label: messageComponent.label,
					url: messageComponent.url,
				} as APIButtonComponent;

				if (messageComponent.emojiName) {
					currentComponent.emoji = {
						name: messageComponent.emojiName!,
					};

					if (messageComponent.emojiType === "CUSTOM") currentComponent.emoji.id = messageComponent.emojiId!;
				}

				currentActionRow.push(currentComponent);

				index++;
			}

			if (currentActionRow.length !== 0)
				actionRows.push({
					components: currentActionRow,
					type: ComponentType.ActionRow,
				});

			try {
				const avatar = `https://cdn.discordapp.com/${
					interaction.member?.avatar ?? (interaction.member?.user ?? interaction.user!).avatar
						? interaction.member?.avatar
							? `guilds/${interaction.guild_id}/users/${(interaction.member?.user ?? interaction.user!).id}/avatars/${
									interaction.member.avatar
							  }.png`
							: `avatars/${(interaction.member?.user ?? interaction.user!).id}/${
									(interaction.member?.user ?? interaction.user!).avatar
							  }.png`
						: `embed/avatars/${
								Number.parseInt((interaction.member?.user ?? interaction.user!).discriminator, 10) % 6
						  }.png`
				}`;

				message = await this.client.api.channels.createMessage(
					interaction.arguments.channels![
						this.client.languageHandler.defaultLanguage!.get("EMBED_SEND_SUB_COMMAND_CHANNEL_NAME")
					]!.id,
					JSON.parse(
						JSON.stringify({
							...(embed.messagePayload as RESTPostAPIChannelMessageJSONBody),
							allowed_mentions: { parse: [], users: [(interaction.member?.user ?? interaction.user!).id] },
							components: actionRows,
						})
							.replaceAll("{{user}}", `<@${interaction.member!.user.id}>`)
							.replaceAll("{{tag}}", `${interaction.member!.user.username}#${interaction.member!.user.discriminator}`)
							.replaceAll("{{avatar}}", avatar),
					),
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
