import type { APIApplicationCommandInteraction } from "@discordjs/core";
import { ApplicationCommandOptionType, ApplicationCommandType, PermissionFlagsBits } from "@discordjs/core";
import ApplicationCommand from "../../../../lib/classes/ApplicationCommand.js";
import type Language from "../../../../lib/classes/Language.js";
import type ExtendedClient from "../../../../lib/extensions/ExtendedClient.js";
import type { APIInteractionWithArguments } from "../../../../typings/index.js";

export default class FakeBan extends ApplicationCommand {
	/**
	 * Create our fake ban command.
	 *
	 * @param client - Our extended client.
	 */
	public constructor(client: ExtendedClient) {
		super(client, {
			options: {
				name: client.languageHandler.defaultLanguage!.get("FAKE_BAN_COMMAND_NAME"),
				description: client.languageHandler.defaultLanguage!.get("FAKE_BAN_COMMAND_DESCRIPTION"),
				name_localizations: client.languageHandler.getFromAllLanguages("FAKE_BAN_COMMAND_NAME"),
				description_localizations: client.languageHandler.getFromAllLanguages("FAKE_BAN_COMMAND_DESCRIPTION"),
				type: ApplicationCommandType.ChatInput,
				options: [
					{
						name: client.languageHandler.defaultLanguage!.get("FAKE_BAN_MEMBER_NAME"),
						description: client.languageHandler.defaultLanguage!.get("FAKE_BAN_MEMBER_DESCRIPTION"),
						name_localizations: client.languageHandler.getFromAllLanguages("FAKE_BAN_MEMBER_NAME"),
						description_localizations: client.languageHandler.getFromAllLanguages("FAKE_BAN_MEMBER_DESCRIPTION"),
						type: ApplicationCommandOptionType.User,
						required: true,
					},
				],
				dm_permission: false,
				default_member_permissions: PermissionFlagsBits.BanMembers.toString(),
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
			interaction.arguments.users![this.client.languageHandler.defaultLanguage!.get("FAKE_BAN_MEMBER_NAME")]!;

		return this.client.api.interactions.reply(interaction.id, interaction.token, {
			content: language.get("FAKE_BAN_MESSAGE", { user: `<@${user.id}>` }),
			allowed_mentions: { parse: [], users: [user.id], replied_user: true },
		});
	}
}
