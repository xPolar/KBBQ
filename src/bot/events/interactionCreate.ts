import type { APIInteraction, WithIntrinsicProps } from "@discordjs/core";
import { GatewayDispatchEvents, InteractionType } from "@discordjs/core";
import EventHandler from "../../../lib/classes/EventHandler.js";
import type ExtendedClient from "../../../lib/extensions/ExtendedClient.js";

export default class InteractionCreate extends EventHandler {
	public constructor(client: ExtendedClient) {
		super(client, GatewayDispatchEvents.InteractionCreate);
	}

	/**
	 * Handle the creation of a new interaction.
	 *
	 * https://discord.com/developers/docs/topics/gateway-events#interaction-create
	 */
	public override async run({ shardId, data }: WithIntrinsicProps<APIInteraction>) {
		// This is very cursed, but it works.
		const dd = data.data as any;

		this.client.submitMetric("interactions_created", "inc", 1, {
			name: dd?.name ?? dd?.custom_id ?? "null",
			type: data.type.toString(),
			shard: shardId.toString(),
		});

		this.client.submitMetric("user_locales", "inc", 1, {
			locale: (data.member?.user ?? data.user!).locale ?? this.client.languageHandler.defaultLanguage!.id,
			shard: shardId.toString(),
		});

		if (data.type === InteractionType.ApplicationCommand)
			return this.client.applicationCommandHandler.handleApplicationCommand({
				data,
				shardId,
			});
		else if (data.type === InteractionType.ApplicationCommandAutocomplete)
			return this.client.autoCompleteHandler.handleAutoComplete({
				data,
				shardId,
			});
	}
}
