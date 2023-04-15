import type { GatewayReadyDispatchData, WithIntrinsicProps } from "@discordjs/core";
import { GatewayDispatchEvents } from "@discordjs/core";
import EventHandler from "../../../lib/classes/EventHandler.js";
import type ExtendedClient from "../../../lib/extensions/ExtendedClient.js";

export default class Ready extends EventHandler {
	public constructor(client: ExtendedClient) {
		super(client, GatewayDispatchEvents.Ready, false);
	}

	/**
	 * Contains the initial state information.
	 *
	 * https://discord.com/developers/docs/topics/gateway-events#ready
	 */
	public override async run({ shardId, data }: WithIntrinsicProps<GatewayReadyDispatchData>) {
		for (const guild of data.guilds) this.client.guildOwnersCache.set(guild.id, "");

		this.client.logger.info(
			`Logged in as ${data.user.username}#${data.user.discriminator} [${data.user.id}] on Shard ${shardId} with ${data.guilds.length} guilds.`,
		);

		await this.client.logger.webhookLog("console", {
			content: `${this.client.functions.generateTimestamp()} Logged in as ${data.user.username}#${
				data.user.discriminator
			} [${data.user.id}] on Shard ${shardId} with ${data.guilds.length} guilds.`,
			allowed_mentions: { parse: [] },
			username: `${this.client.config.botName} | Console Logs`,
		});
	}
}
