import type { APIGuildMember, APIRole, GatewayPresenceUpdateDispatchData, WithIntrinsicProps } from "@discordjs/core";
import { RESTJSONErrorCodes, ActivityType, GatewayDispatchEvents } from "@discordjs/core";
import { DiscordAPIError } from "@discordjs/rest";
import EventHandler from "../../../lib/classes/EventHandler.js";
import type ExtendedClient from "../../../lib/extensions/ExtendedClient.js";

export default class PresenceUpdate extends EventHandler {
	public constructor(client: ExtendedClient) {
		super(client, GatewayDispatchEvents.PresenceUpdate, false);
	}

	/**
	 * User was updated.
	 *
	 * https://discord.com/developers/docs/topics/gateway-events#presence-update
	 */
	public override async run({ data }: WithIntrinsicProps<GatewayPresenceUpdateDispatchData>) {
		const presencesInGuild = this.client.guildPresenceCache.get(data.guild_id) ?? new Map();
		const cachedPresence = presencesInGuild.get(data.user.id);

		let customActivity = data.activities?.find((activity) => activity.type === ActivityType.Custom) ?? { state: "" };
		if (!customActivity.state) customActivity = { state: "" };

		if (customActivity.state === cachedPresence) return;

		this.client.guildPresenceCache.set(data.guild_id, presencesInGuild.set(data.user.id, customActivity.state));

		if (!this.client.guildRolesCache.get(data.guild_id)) {
			const guildRoles = new Map();

			for (const guildRole of await this.client.api.guilds.getRoles(data.guild_id))
				guildRoles.set(guildRole.id, guildRole);

			this.client.guildRolesCache.set(data.guild_id, guildRoles);
		}

		const validStatusRoles: APIRole[] = [];
		const statusRolesMemberShouldHave: APIRole[] = [];
		const guildRoles = this.client.guildRolesCache.get(data.guild_id)!;
		const statusRoles = this.client.config.otherConfig.statusRoles[data.guild_id];

		if (!statusRoles) return;

		for (const [requiredText, roleId] of Object.entries(statusRoles)) {
			const validRole = guildRoles.get(roleId);
			if (!validRole) continue;

			validStatusRoles.push(validRole);

			if (customActivity.state?.toLowerCase().includes(requiredText.toLowerCase()))
				statusRolesMemberShouldHave.push(validRole);
		}

		let member: APIGuildMember;

		try {
			member = await this.client.api.guilds.getMember(data.guild_id, data.user.id);
		} catch (error) {
			if (error instanceof DiscordAPIError && error.code === RESTJSONErrorCodes.UnknownMember) return;

			throw error;
		}

		const rolesAdded = statusRolesMemberShouldHave.filter((role) => !member.roles.includes(role.id));
		const rolesRemoved = validStatusRoles.filter(
			(role) => !statusRolesMemberShouldHave.includes(role) && member.roles.includes(role.id),
		);
		const roleIdsRemoved = rolesRemoved.map((role) => role.id);

		const rolesModified = rolesAdded.length || rolesRemoved.length;

		if (!rolesModified) return;

		try {
			await this.client.api.guilds.editMember(data.guild_id, data.user.id, {
				roles: [
					...new Set(
						member.roles.filter((role) => !roleIdsRemoved.includes(role)).concat(rolesAdded.map((role) => role.id)),
					),
				],
			});
		} catch (error) {
			if (error instanceof DiscordAPIError && error.code === RESTJSONErrorCodes.MissingPermissions) {
				this.client.logger.error(`Missing permissions to edit roles for guild ${data.guild_id}`);

				return;
			}

			throw error;
		}

		let message = ``;

		if (rolesModified) {
			if (rolesAdded.length)
				message += ` added the ${rolesAdded.map((role) => role.name).join(", ")} role${
					rolesAdded.length > 1 ? "s" : ""
				}`;
			if (rolesAdded.length && rolesRemoved.length) message += " and";
			if (rolesRemoved.length)
				message += ` removed the ${rolesRemoved.map((role) => role.name).join(", ")} role${
					rolesRemoved.length > 1 ? "s" : ""
				}`;
		}

		this.client.logger.debug(
			`Updated status roles for ${member.user?.username}#${member.user?.discriminator} (${data.user.id}) in ${data.guild_id}${message}`,
		);
	}
}
