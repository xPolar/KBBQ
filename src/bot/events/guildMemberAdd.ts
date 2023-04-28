import { setTimeout } from "node:timers";
import type {
	APIActionRowComponent,
	APIButtonComponent,
	GatewayGuildMemberAddDispatchData,
	RESTPostAPIChannelMessageJSONBody,
	WithIntrinsicProps,
} from "@discordjs/core";
import { ButtonStyle, ComponentType, GatewayDispatchEvents } from "@discordjs/core";
import EventHandler from "../../../lib/classes/EventHandler.js";
import type ExtendedClient from "../../../lib/extensions/ExtendedClient.js";

export default class GuildDelete extends EventHandler {
	public constructor(client: ExtendedClient) {
		super(client, GatewayDispatchEvents.GuildMemberAdd, false);
	}

	/**
	 * New user joined a guild
	 *
	 * https://discord.com/developers/docs/topics/gateway-events#guild-member-add
	 */
	public override async run({ data }: WithIntrinsicProps<GatewayGuildMemberAddDispatchData>) {
		const welcomeMessages = await this.client.prisma.welcomeMessage.findMany({ where: { guildId: data.guild_id } });

		if (!welcomeMessages.length) return;

		const promises = [];

		for (const welcomeMessage of welcomeMessages) {
			const embed = await this.client.prisma.embed.findUnique({
				where: { embedName_guildId: { embedName: welcomeMessage.embedName, guildId: data.guild_id } },
			});

			if (!embed) {
				await this.client.prisma.welcomeMessage.delete({ where: { id: welcomeMessage.id } });
				continue;
			}

			const messageComponents = await this.client.prisma.messageComponent.findMany({
				where: { embedName: embed.embedName, guildId: data.guild_id },
				orderBy: { position: "asc" },
			});

			const actionRows: APIActionRowComponent<APIButtonComponent>[] = [];
			let currentActionRow: APIButtonComponent[] = [];

			let index = 0;

			for (const messageComponent of messageComponents) {
				if (index !== 0 && index % 5 === 0) {
					actionRows.push({
						components: currentActionRow,
						type: ComponentType.ActionRow,
					});

					currentActionRow = [];
				}

				currentActionRow.push({
					style: ButtonStyle.Link,
					type: ComponentType.Button,
					label: messageComponent.label,
					url: messageComponent.url,
				});

				index++;
			}

			if (currentActionRow.length !== 0)
				actionRows.push({
					components: currentActionRow,
					type: ComponentType.ActionRow,
				});

			const avatar = `https://cdn.discordapp.com/${
				data.avatar ?? data.user!.avatar
					? data.avatar
						? `guilds/${data.guild_id}/users/${data.user!.id}/avatars/${data.avatar}.png`
						: `avatars/${data.user!.id}/${data.user!.avatar}.png`
					: `embed/avatars/${Number.parseInt(data.user!.discriminator, 10) % 6}.png`
			}`;

			promises.push(
				this.client.api.channels
					.createMessage(
						welcomeMessage.channelId,
						JSON.parse(
							JSON.stringify({
								...(embed.messagePayload as RESTPostAPIChannelMessageJSONBody),
								allowed_mentions: { parse: [], users: [data.user!.id] },
								components: actionRows,
							})
								.replaceAll("{{user}}", `<@${data.user!.id}>`)
								.replaceAll("{{tag}}", `${data.user!.username}#${data.user!.discriminator}`)
								.replaceAll("{{avatar}}", avatar),
						),
					)
					// eslint-disable-next-line promise/prefer-await-to-then
					.then((message) => {
						if (welcomeMessage.expiry)
							setTimeout(
								async () => this.client.api.channels.deleteMessage(message.channel_id, message.id),
								welcomeMessage.expiry,
							);
					}),
			);
		}

		return Promise.all(promises);
	}
}
