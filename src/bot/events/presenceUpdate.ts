// eslint-disable-next-line no-warning-comments
// TODO: Fix this file, it's a mess

import type {
	APIActionRowComponent,
	APIButtonComponent,
	APIGuildMember,
	APIRole,
	GatewayPresenceUpdateDispatchData,
	RESTPostAPIChannelMessageJSONBody,
	WithIntrinsicProps,
} from "@discordjs/core";
import { ButtonStyle, ComponentType, RESTJSONErrorCodes, ActivityType, GatewayDispatchEvents } from "@discordjs/core";
import { DiscordAPIError } from "@discordjs/rest";
import type { Embed } from "@prisma/client";
import EventHandler from "../../../lib/classes/EventHandler.js";
import type ExtendedClient from "../../../lib/extensions/ExtendedClient.js";

export default class PresenceUpdate extends EventHandler {
	/**
	 * A cache of when a user was last thanked for changing their status for each embed.
	 */
	private readonly lastSentCache: Record<string, Record<string, number>>;

	public constructor(client: ExtendedClient) {
		super(client, GatewayDispatchEvents.PresenceUpdate, false);

		this.lastSentCache = {};
	}

	/**
	 * User was updated.
	 *
	 * https://discord.com/developers/docs/topics/gateway-events#presence-update
	 */
	public override async run({ data }: WithIntrinsicProps<GatewayPresenceUpdateDispatchData>) {
		const cachedPresencesInGuild = this.client.guildPresenceCache.get(data.guild_id) ?? new Map<string, string>();
		const cachedUserPresence = cachedPresencesInGuild.get(data.user.id);

		const customActivity = data.activities?.find((activity) => activity.type === ActivityType.Custom);

		if (cachedUserPresence && !customActivity?.state?.length) {
			cachedPresencesInGuild.delete(data.user.id);
			this.client.guildPresenceCache.set(data.guild_id, cachedPresencesInGuild);

			const rolesInGuild = this.client.guildRolesCache.get(data.guild_id) ?? new Map<string, APIRole>();

			const validStatusRoleIds = new Set<string>();

			const statusRoles = await this.client.prisma.statusRole.findMany({ where: { guildId: data.guild_id } });

			if (!statusRoles.length) return;

			for (const statusRole of statusRoles) {
				const validRole = rolesInGuild.get(statusRole.roleId);
				if (!validRole) {
					await this.client.prisma.statusRole.delete({ where: { id: statusRole.id } });

					continue;
				}

				validStatusRoleIds.add(validRole.id);
			}

			if (!validStatusRoleIds.size) return;

			let member: APIGuildMember;

			try {
				// eslint-disable-next-line no-warning-comments
				member = await this.client.api.guilds.getMember(data.guild_id, data.user.id); // TODO: Fetching EVERY time is inefficient, we fetch members tens of times a minute, see if we can fix this
			} catch (error) {
				if (error instanceof DiscordAPIError && error.code === RESTJSONErrorCodes.UnknownMember) return;

				throw error;
			}

			const newRoles = member.roles.filter((roleId) => !validStatusRoleIds.has(roleId));

			if (newRoles.length === member.roles.length) return;

			try {
				await this.client.api.guilds.editMember(data.guild_id, data.user.id, {
					roles: member.roles.filter((roleId) => !validStatusRoleIds.has(roleId)),
				});

				this.client.logger.info(
					`User ${data.user.id} cleared their status, their status was previously ${cachedUserPresence}.`,
				);

				return;
			} catch (error) {
				if (error instanceof DiscordAPIError && error.code === RESTJSONErrorCodes.MissingPermissions) {
					this.client.logger.error(`Missing permissions to edit roles for guild ${data.guild_id}`);
					return;
				}

				throw error;
			}
		}

		if (!customActivity?.state) return;

		cachedPresencesInGuild.set(data.user.id, customActivity.state);
		this.client.guildPresenceCache.set(data.guild_id, cachedPresencesInGuild);

		if (cachedUserPresence === customActivity.state) return;

		const rolesInGuild = this.client.guildRolesCache.get(data.guild_id) ?? new Map<string, APIRole>();

		const validStatusRoleIds = new Set<string>();
		const rolesIdsToAdd = new Set<string>();

		let removeOldRoles = false;

		// eslint-disable-next-line no-warning-comments
		const statusRoles = await this.client.prisma.statusRole.findMany({ where: { guildId: data.guild_id } }); // TODO: Cache this, currently we are doing a query for EVERY time that someone sets a custom presence that isn't cached. (This is hundreds to thousands a minute)

		if (!statusRoles.length) return;

		const messagesToSend: Record<string, Embed[]> = {};

		for (const statusRole of statusRoles) {
			const validRole = rolesInGuild.get(statusRole.roleId);
			if (!validRole) {
				await this.client.prisma.statusRole.delete({ where: { id: statusRole.id } });

				continue;
			}

			validStatusRoleIds.add(validRole.id);

			if (customActivity.state.toLowerCase().includes(statusRole.requiredText.toLowerCase())) {
				rolesIdsToAdd.add(validRole.id);

				if (statusRole.embedName && statusRole.channelId) {
					const embed = await this.client.prisma.embed.findUnique({
						where: { embedName_guildId: { embedName: statusRole.embedName, guildId: data.guild_id } },
					});

					if (embed) {
						if (!messagesToSend[statusRole.channelId]) messagesToSend[statusRole.channelId] = [];

						messagesToSend[statusRole.channelId]!.push(embed);
					}
				}
			}

			if (!removeOldRoles && cachedUserPresence?.toLowerCase().includes(statusRole.requiredText.toLowerCase()))
				removeOldRoles = true;
		}

		if (!validStatusRoleIds.size || (!rolesIdsToAdd.size && !removeOldRoles)) return;

		let member: APIGuildMember;

		try {
			member = await this.client.api.guilds.getMember(data.guild_id, data.user.id);
		} catch (error) {
			if (error instanceof DiscordAPIError && error.code === RESTJSONErrorCodes.UnknownMember) return;

			throw error;
		}

		let newMember: APIGuildMember;

		try {
			newMember = await this.client.api.guilds.editMember(data.guild_id, data.user.id, {
				roles: member.roles.filter((roleId) => !validStatusRoleIds.has(roleId)).concat([...rolesIdsToAdd]),
			});

			this.client.logger.info(
				`User ${data.user.id} updated their status, it is now ${
					customActivity.state
				}, I have removed all status roles from them${
					rolesIdsToAdd.size ? `, then I added the following roles: ${[...rolesIdsToAdd].map((roleId) => roleId)}` : `.`
				}`,
			);
		} catch (error) {
			if (error instanceof DiscordAPIError && error.code === RESTJSONErrorCodes.MissingPermissions) {
				this.client.logger.error(`Missing permissions to edit roles for guild ${data.guild_id}`);
				return;
			}

			throw error;
		}

		// eslint-disable-next-line @typescript-eslint/require-array-sort-compare
		const newMemberRoles = newMember.roles.sort();
		// eslint-disable-next-line @typescript-eslint/require-array-sort-compare
		const memberRoles = member.roles.sort();

		if (
			!messagesToSend ||
			(memberRoles.length === newMemberRoles.length &&
				memberRoles.every((role, index) => role === newMemberRoles[index]))
		)
			return;

		return Promise.all(
			Object.entries(messagesToSend).flatMap(([channelId, messagePayloads]) => {
				return messagePayloads.map(async (messagePayload) => {
					if ((this.lastSentCache[messagePayload.embedName]?.[data.user.id] ?? 0) > Date.now()) return;

					const messageComponents = await this.client.prisma.messageComponent.findMany({
						where: { embedName: messagePayload.embedName, guildId: data.guild_id },
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

						const currentComponent = {
							style: ButtonStyle.Link,
							type: ComponentType.Button,
							label: messageComponent.label,
							url: messageComponent.url,
						} as APIButtonComponent;

						if (messageComponent.emojiName) {
							currentComponent.emoji = {
								name: messageComponent.emojiName!,
							};

							if (messageComponent.emojiType === "CUSTOM") currentComponent.emoji.id = messageComponent.emojiId!;
						}

						currentActionRow.push(currentComponent);

						index++;
					}

					if (currentActionRow.length !== 0)
						actionRows.push({
							components: currentActionRow,
							type: ComponentType.ActionRow,
						});

					try {
						await this.client.api.channels.createMessage(channelId, {
							...JSON.parse(
								JSON.stringify({
									...(messagePayload.messagePayload as RESTPostAPIChannelMessageJSONBody),
									components: actionRows,
								} as RESTPostAPIChannelMessageJSONBody).replaceAll("{{user}}", `<@${data.user.id}>`),
							),
							allowed_mentions: { parse: [], users: [data.user.id] },
						});

						if (!this.lastSentCache[messagePayload.embedName]) this.lastSentCache[messagePayload.embedName] = {};
						this.lastSentCache[messagePayload.embedName]![data.user.id] = Date.now() + 24 * 60 * 60 * 1_000;
					} catch (error) {
						if (error instanceof DiscordAPIError) {
							if (error.code === RESTJSONErrorCodes.MissingPermissions) {
								this.client.logger.error(`Missing permissions to send messages in channel ${channelId}`);

								return;
							} else if (error.code === RESTJSONErrorCodes.RequestBodyContainsInvalidJSON) {
								this.client.logger.error(`Invalid JSON in embed for guild ${data.guild_id}`);

								return;
							}
						}

						throw error;
					}
				});
			}),
		);
	}
}
