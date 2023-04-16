import type { GatewayPresenceUpdateDispatchData, WithIntrinsicProps } from "@discordjs/core";
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
		const customActivity = data.activities?.find((activity) => activity.type === ActivityType.Custom);
		if (!customActivity) return;

		const presencesInGuild = this.client.guildPresenceCache.get(data.guild_id) ?? new Map();

		if (customActivity.state === presencesInGuild.get(data.user.id)) return;

		const statusRoles = this.client.config.otherConfig.statusRoles[data.guild_id];

		if (!statusRoles) return;

		const statusRoleIds = Object.values(statusRoles);

		let member;

		try {
			member = await this.client.api.guilds.getMember(data.guild_id, data.user.id);
		} catch (error) {
			this.client.logger.debug(1, "error");
			if (error instanceof DiscordAPIError && error.code === RESTJSONErrorCodes.UnknownMember) return;

			throw error;
		}

		const rolesToBeAdded = [];

		for (const [requiredText, roleId] of Object.entries(statusRoles))
			if (customActivity.state?.includes(requiredText)) rolesToBeAdded.push(roleId);

		const newRoles = member.roles.filter((role) => !statusRoleIds.includes(role)).concat(rolesToBeAdded);

		this.client.logger.debug(2, newRoles, rolesToBeAdded);

		if (newRoles === member.roles) return;

		this.client.guildPresenceCache.set(data.guild_id, presencesInGuild.set(data.user.id, customActivity.state));

		this.client.logger.info(
			`Updating status roles for ${data.user.username} in ${
				data.guild_id
			}, they should now have the following roles: ${newRoles.join(", ")}`,
		);

		try {
			return await this.client.api.guilds.editMember(data.guild_id, data.user.id, {
				roles: [...new Set(member.roles.filter((role) => !statusRoleIds.includes(role)).concat(rolesToBeAdded))],
			});
		} catch (error) {
			if (error instanceof DiscordAPIError && error.code === RESTJSONErrorCodes.MissingPermissions) {
				this.client.logger.error(`Missing permissions to edit roles for status roles in ${data.guild_id}!`);

				return;
			}

			throw error;
		}
	}
}
