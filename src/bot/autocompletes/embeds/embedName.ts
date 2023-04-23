import type { APIApplicationCommandAutocompleteInteraction } from "@discordjs/core";
import AutoComplete from "../../../../lib/classes/AutoComplete.js";
import type Language from "../../../../lib/classes/Language.js";
import type ExtendedClient from "../../../../lib/extensions/ExtendedClient.js";
import type { APIInteractionWithArguments } from "../../../../typings/index.js";

export default class EmbedName extends AutoComplete {
	public constructor(client: ExtendedClient) {
		super(["embed-delete-name", "embed-send-name"], client);
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
		const currentValue =
			interaction.arguments.strings![
				this.client.languageHandler.defaultLanguage!.get("EMBED_CREATE_SUB_COMMAND_NAME_NAME")
			]!;

		const embeds = await this.client.prisma.embed.findMany({
			where: { embedName: { contains: currentValue.value }, guildId: interaction.guild_id! },
		});

		return this.client.api.interactions.createAutocompleteResponse(interaction.id, interaction.token, {
			choices: embeds.length
				? embeds.map((embed) => ({ name: embed.embedName, value: embed.embedName }))
				: [{ name: currentValue.value, value: currentValue.value }],
		});
	}
}
