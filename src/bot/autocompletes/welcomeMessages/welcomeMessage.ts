import type {
	APIApplicationCommandAutocompleteInteraction,
	APIApplicationCommandInteractionDataStringOption,
	APIApplicationCommandOptionChoice,
	APIChannel,
} from "@discordjs/core";
import { RESTJSONErrorCodes } from "@discordjs/core";
import { DiscordAPIError } from "@discordjs/rest";
import AutoComplete from "../../../../lib/classes/AutoComplete.js";
import type Language from "../../../../lib/classes/Language.js";
import type ExtendedClient from "../../../../lib/extensions/ExtendedClient.js";
import type { APIInteractionWithArguments } from "../../../../typings/index.js";

export default class WelcomeMessage extends AutoComplete {
	public constructor(client: ExtendedClient) {
		super(["welcome_message-remove-welcome_message"], client);
	}

	/**
	 * Run this auto complete.
	 *
	 * @param options The options to run this application command.
	 * @param options.interaction The interaction to pre-check.
	 * @param options.language The language to use when replying to the interaction.
	 * @param options.shardId The shard ID to use when replying to the interaction.
	 */
	public override async run({
		interaction,
	}: {
		interaction: APIInteractionWithArguments<APIApplicationCommandAutocompleteInteraction>;
		language: Language;
		shardId: number;
	}) {
		const currentValue = interaction.arguments.focused as APIApplicationCommandInteractionDataStringOption;

		const welcomeMessages = await this.client.prisma.welcomeMessage.findMany({
			where: { guildId: interaction.guild_id! },
		});

		const channelCache: Record<string, APIChannel> = {};

		return this.client.api.interactions.createAutocompleteResponse(interaction.id, interaction.token, {
			choices: welcomeMessages.length
				? (welcomeMessages
						.map(async (welcomeMessage) => {
							if (!channelCache[welcomeMessage.channelId]) {
								try {
									// eslint-disable-next-line require-atomic-updates
									channelCache[welcomeMessage.channelId] = await this.client.api.channels.get(welcomeMessage.channelId);
								} catch (error) {
									if (error instanceof DiscordAPIError && error.code === RESTJSONErrorCodes.UnknownChannel) return null;

									throw error;
								}
							}

							let name = `${channelCache[welcomeMessage.channelId]!.name}: ${welcomeMessage.embedName}`;

							if (name.length > 97) name = `${name.slice(0, 97)}...`;

							return { name, value: welcomeMessage.id };
						})
						.filter(Boolean) as unknown as APIApplicationCommandOptionChoice[])
				: [{ name: currentValue.value, value: currentValue.value }],
		});
	}
}
