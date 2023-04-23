import type {
	APIApplicationCommandAutocompleteInteraction,
	APIApplicationCommandInteractionDataStringOption,
} from "@discordjs/core";
import AutoComplete from "../../../../lib/classes/AutoComplete.js";
import type Language from "../../../../lib/classes/Language.js";
import type ExtendedClient from "../../../../lib/extensions/ExtendedClient.js";
import type { APIInteractionWithArguments } from "../../../../typings/index.js";

export default class StatusRoles extends AutoComplete {
	public constructor(client: ExtendedClient) {
		super(["status_role-delete-status_role"], client);
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

		const guildRoles = this.client.guildRolesCache.get(interaction.guild_id!);

		if (!guildRoles)
			return this.client.api.interactions.createAutocompleteResponse(interaction.id, interaction.token, {
				choices: [],
			});

		const statusRoles = (
			await this.client.prisma.statusRole.findMany({
				where: { guildId: interaction.guild_id! },
			})
		).filter((statusRole) => guildRoles.get(statusRole.roleId));

		return this.client.api.interactions.createAutocompleteResponse(interaction.id, interaction.token, {
			choices: statusRoles.length
				? statusRoles.map((statusRole) => {
						const role = guildRoles.get(statusRole.roleId)!;
						let name = `${statusRole.requiredText}: ${role.name}`;

						if (name.length > 97) name = `${name.slice(0, 97)}...`;

						return {
							name,
							value: statusRole.id,
						};
				  })
				: [{ name: currentValue.value, value: currentValue.value }],
		});
	}
}
