import type {
	APIApplicationCommandAutocompleteInteraction,
	APIApplicationCommandInteractionDataStringOption,
} from "@discordjs/core";
import AutoComplete from "../../../../lib/classes/AutoComplete.js";
import type Language from "../../../../lib/classes/Language.js";
import type ExtendedClient from "../../../../lib/extensions/ExtendedClient.js";
import type { APIInteractionWithArguments } from "../../../../typings/index.js";

export default class Component extends AutoComplete {
	public constructor(client: ExtendedClient) {
		super(["embed-buttons-remove-button"], client);
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
		const embedName =
			interaction.arguments.strings![
				this.client.languageHandler.defaultLanguage!.get("EMBED_BUTTONS_ADD_SUB_COMMAND_EMBED_NAME")
			]!.value;

		if (!embedName)
			return this.client.api.interactions.createAutocompleteResponse(interaction.id, interaction.token, {
				choices: [{ name: currentValue.value, value: currentValue.value }],
			});

		const components = await this.client.prisma.messageComponent.findMany({
			where: { guildId: interaction.guild_id!, embedName },
			orderBy: { position: "asc" },
		});

		return this.client.api.interactions.createAutocompleteResponse(interaction.id, interaction.token, {
			choices: components.length
				? components.map((component) => {
						let name = `${component.label}: ${component.url}`;

						if (name.length > 97) name = `${name.slice(0, 97)}...`;

						return { name, value: component.id };
				  })
				: [{ name: currentValue.value, value: currentValue.value }],
		});
	}
}
