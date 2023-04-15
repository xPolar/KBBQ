import type { APIApplicationCommandInteraction } from "@discordjs/core";
import { ApplicationCommandOptionType, ApplicationCommandType, PermissionFlagsBits } from "@discordjs/core";
import ApplicationCommand from "../../../../lib/classes/ApplicationCommand.js";
import type Language from "../../../../lib/classes/Language.js";
import type ExtendedClient from "../../../../lib/extensions/ExtendedClient.js";
import type { APIInteractionWithArguments } from "../../../../typings/index.js";

export default class EditEXP extends ApplicationCommand {
	/**
	 * Create our edit experience command.
	 *
	 * @param client - Our extended client.
	 */
	public constructor(client: ExtendedClient) {
		super(client, {
			options: {
				name: client.languageHandler.defaultLanguage!.get("EDIT_EXPERIENCE_COMMAND_NAME"),
				description: client.languageHandler.defaultLanguage!.get("EDIT_EXPERIENCE_COMMAND_DESCRIPTION"),
				name_localizations: client.languageHandler.getFromAllLanguages("EDIT_EXPERIENCE_COMMAND_NAME"),
				description_localizations: client.languageHandler.getFromAllLanguages("EDIT_EXPERIENCE_COMMAND_DESCRIPTION"),
				type: ApplicationCommandType.ChatInput,
				options: [
					{
						name: client.languageHandler.defaultLanguage!.get("EDIT_EXPERIENCE_MEMBER_NAME"),
						description: client.languageHandler.defaultLanguage!.get("EDIT_EXPERIENCE_MEMBER_DESCRIPTION"),
						name_localizations: client.languageHandler.getFromAllLanguages("EDIT_EXPERIENCE_MEMBER_NAME"),
						description_localizations: client.languageHandler.getFromAllLanguages("EDIT_EXPERIENCE_MEMBER_DESCRIPTION"),
						type: ApplicationCommandOptionType.User,
						required: true,
					},
					{
						name: client.languageHandler.defaultLanguage!.get("EDIT_EXPERIENCE_OPERATION_NAME"),
						description: client.languageHandler.defaultLanguage!.get("EDIT_EXPERIENCE_OPERATION_DESCRIPTION"),
						name_localizations: client.languageHandler.getFromAllLanguages("EDIT_EXPERIENCE_OPERATION_NAME"),
						description_localizations: client.languageHandler.getFromAllLanguages(
							"EDIT_EXPERIENCE_OPERATION_DESCRIPTION",
						),
						type: ApplicationCommandOptionType.String,
						choices: [
							{
								name: client.languageHandler.defaultLanguage!.get("EDIT_EXPERIENCE_OPERATION_CHOICES_ADD"),
								value: client.languageHandler.defaultLanguage!.get("EDIT_EXPERIENCE_OPERATION_CHOICES_ADD"),
								name_localizations: client.languageHandler.getFromAllLanguages("EDIT_EXPERIENCE_OPERATION_CHOICES_ADD"),
							},
							{
								name: client.languageHandler.defaultLanguage!.get("EDIT_EXPERIENCE_OPERATION_CHOICES_REMOVE"),
								value: client.languageHandler.defaultLanguage!.get("EDIT_EXPERIENCE_OPERATION_CHOICES_REMOVE"),
								name_localizations: client.languageHandler.getFromAllLanguages(
									"EDIT_EXPERIENCE_OPERATION_CHOICES_REMOVE",
								),
							},
							{
								name: client.languageHandler.defaultLanguage!.get("EDIT_EXPERIENCE_OPERATION_CHOICES_SET"),
								value: client.languageHandler.defaultLanguage!.get("EDIT_EXPERIENCE_OPERATION_CHOICES_SET"),
								name_localizations: client.languageHandler.getFromAllLanguages("EDIT_EXPERIENCE_OPERATION_CHOICES_SET"),
							},
						],
						required: true,
					},
					{
						name: client.languageHandler.defaultLanguage!.get("EDIT_EXPERIENCE_AMOUNT_NAME"),
						description: client.languageHandler.defaultLanguage!.get("EDIT_EXPERIENCE_AMOUNT_DESCRIPTION"),
						name_localizations: client.languageHandler.getFromAllLanguages("EDIT_EXPERIENCE_AMOUNT_NAME"),
						description_localizations: client.languageHandler.getFromAllLanguages("EDIT_EXPERIENCE_AMOUNT_DESCRIPTION"),
						type: ApplicationCommandOptionType.Integer,
						required: true,
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
		const user =
			interaction.arguments.users![this.client.languageHandler.defaultLanguage!.get("EDIT_EXPERIENCE_MEMBER_NAME")]!;
		const operation =
			interaction.arguments.strings![
				this.client.languageHandler.defaultLanguage!.get("EDIT_EXPERIENCE_OPERATION_NAME")
			]!;
		const amount =
			interaction.arguments.integers![this.client.languageHandler.defaultLanguage!.get("EDIT_EXPERIENCE_AMOUNT_NAME")]!;

		const result = await this.client.prisma.userLevel.upsert({
			where: { userId_guildId: { guildId: interaction.guild_id!, userId: user.id } },
			create: {
				userId: user.id,
				guildId: interaction.guild_id!,
				experience: amount.value,
				level: 0,
			},
			update:
				operation.value === this.client.languageHandler.defaultLanguage!.get("EDIT_EXPERIENCE_OPERATION_CHOICES_SET")
					? {
							experience: amount.value,
					  }
					: {
							experience: {
								increment:
									operation.value ===
									this.client.languageHandler.defaultLanguage!.get("EDIT_EXPERIENCE_OPERATION_CHOICES_ADD")
										? amount.value
										: -amount.value,
							},
					  },
		});

		return this.client.api.interactions.reply(interaction.id, interaction.token, {
			embeds: [
				{
					title: language.get("EDIT_EXPERIENCE_EMBED_TITLE"),
					description:
						operation.value ===
						this.client.languageHandler.defaultLanguage!.get("EDIT_EXPERIENCE_OPERATION_CHOICES_SET")
							? language.get("EDIT_EXPERIENCE_EMBED_DESCRIPTION_SET", {
									amount: amount.value.toLocaleString(),
									user: `<@${user.id}>`,
							  })
							: language.get("EDIT_EXPERIENCE_EMBED_DESCRIPTION_INCREMENT", {
									amount: amount.value.toLocaleString(),
									user: `<@${user.id}>`,
									operation: operation.value,
									toOrFrom:
										operation.value ===
										this.client.languageHandler.defaultLanguage!.get("EDIT_EXPERIENCE_OPERATION_CHOICES_ADD")
											? "to"
											: "from",
									experience: result.experience.toLocaleString(),
							  }),
					color: this.client.config.colors.success,
				},
			],
			allowed_mentions: { parse: [], replied_user: true },
		});
	}
}
