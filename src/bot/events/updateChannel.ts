import type { GatewayChannelUpdateDispatchData, WithIntrinsicProps } from "@discordjs/core";
import { ChannelType, GatewayDispatchEvents } from "@discordjs/core";
import EventHandler from "../../../lib/classes/EventHandler.js";
import type ExtendedClient from "../../../lib/extensions/ExtendedClient.js";

export default class ChannelUpdate extends EventHandler {
	/**
	 * The bad words that we want to filter out.
	 */
	private badWords = [""];

	public constructor(client: ExtendedClient) {
		super(client, GatewayDispatchEvents.ChannelUpdate, false);
	}

	/**
	 * Channel was updated.
	 *
	 * https://discord.com/developers/docs/topics/gateway-events#channel-update
	 */
	public override async run({ data }: WithIntrinsicProps<GatewayChannelUpdateDispatchData>) {
		if (data.type !== ChannelType.GuildVoice) return;

		if (!this.badWords.some((word) => data.name.toLowerCase().includes(word.toLowerCase()))) return;

		return Promise.all([
			this.client.api.channels.delete(data.id),
			this.client.api.channels.createMessage(`803689395726450728`, {
				content: `Channel **${data.name}** was deleted because it contained a bad word.`,
			}),
		]);
	}
}
