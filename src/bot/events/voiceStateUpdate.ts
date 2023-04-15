import type { GatewayVoiceStateUpdateDispatchData, WithIntrinsicProps } from "@discordjs/core";
import { GatewayDispatchEvents } from "@discordjs/core";
import EventHandler from "../../../lib/classes/EventHandler.js";
import type ExtendedClient from "../../../lib/extensions/ExtendedClient.js";

export default class VoiceStateUpdate extends EventHandler {
	public constructor(client: ExtendedClient) {
		super(client, GatewayDispatchEvents.VoiceStateUpdate, false);
	}

	/**
	 * Someone joined, left, or moved a voice channel.
	 *
	 * https://discord.com/developers/docs/topics/gateway-events#voice-state-update
	 */
	public override async run({ data }: WithIntrinsicProps<GatewayVoiceStateUpdateDispatchData>) {
		let usersInVoiceInGuild = this.client.usersInVoice.get(data.guild_id!);

		if (!usersInVoiceInGuild)
			usersInVoiceInGuild = this.client.usersInVoice.set(data.guild_id!, new Set()).get(data.guild_id!)!;

		if (
			usersInVoiceInGuild.has(data.user_id) &&
			(!data.channel_id || data.self_deaf || data.self_mute || data.deaf || data.mute)
		)
			usersInVoiceInGuild.delete(data.user_id);
		else if (!usersInVoiceInGuild.has(data.user_id) && data.channel_id) usersInVoiceInGuild.add(data.user_id);

		this.client.usersInVoice.set(data.guild_id!, usersInVoiceInGuild);
	}
}
