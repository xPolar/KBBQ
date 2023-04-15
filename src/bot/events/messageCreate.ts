import type { GatewayMessageCreateDispatchData, WithIntrinsicProps } from "@discordjs/core";
import { GatewayDispatchEvents } from "@discordjs/core";
import EventHandler from "../../../lib/classes/EventHandler.js";
import type ExtendedClient from "../../../lib/extensions/ExtendedClient.js";

export default class MessageCreate extends EventHandler {
	/**
	 * A map of user IDs and the time they last received experience.
	 */
	private readonly experienceCooldown: Map<string, number>;

	public constructor(client: ExtendedClient) {
		super(client, GatewayDispatchEvents.MessageCreate);

		this.experienceCooldown = new Map();
	}

	/**
	 * Handle the creation of a new interaction.
	 *
	 * https://discord.com/developers/docs/topics/gateway-events#interaction-create
	 */
	public override async run({ shardId, data: message }: WithIntrinsicProps<GatewayMessageCreateDispatchData>) {
		if (message.author.bot) return;

		if (message.guild_id) {
			const currentWeek = this.client.functions.getWeekOfYear();
			const userActivity = await this.client.prisma.weeklyActivity.findUnique({
				where: { userId_guildId: { guildId: message.guild_id!, userId: message.author.id } },
			});

			await this.client.prisma.weeklyActivity.upsert({
				where: { userId_guildId: { guildId: message.guild_id!, userId: message.author.id } },
				create: {
					messages: 1,
					currentWeek,
					guildId: message.guild_id!,
					userId: message.author.id,
					minutesInVoice: 0,
				},
				update:
					currentWeek === userActivity?.currentWeek ? { messages: { increment: 1 } } : { messages: 1, currentWeek },
			});

			if (Date.now() < (this.experienceCooldown.get(message.author.id) || 0)) return;

			this.experienceCooldown.set(message.author.id, Date.now() + 1_000 * 60);

			const updatedUserLevel = await this.client.prisma.userLevel.upsert({
				where: { userId_guildId: { guildId: message.guild_id!, userId: message.author.id } },
				create: { userId: message.author.id, level: 1, experience: 0, guildId: message.guild_id! },
				update: { experience: { increment: (Math.floor(Math.random() * 16) + 15) * 1 } }, // Change the 1 at the end to change the multiplier.
			});

			const calculatedLevel = this.client.functions.calculateLevelFromExperience(updatedUserLevel.experience);

			if (updatedUserLevel.level !== calculatedLevel && calculatedLevel !== 0) {
				const [rolesAdded, rolesRemoved] = await this.client.functions.distributeLevelRoles(
					message.member!,
					updatedUserLevel,
				);

				const rolesModified = rolesAdded.length || rolesRemoved.length;
				let levelUpMessage = ``;

				if (rolesModified) {
					if (!(rolesAdded.length && rolesRemoved.length)) levelUpMessage += " and";
					if (rolesAdded.length)
						levelUpMessage += ` earned the ${rolesAdded.map((role) => `<@&${role.id}>`).join(", ")} role${
							rolesAdded.length > 1 ? "s" : ""
						}`;
					if (rolesAdded.length && rolesRemoved.length) levelUpMessage += " and";
					if (rolesRemoved.length)
						levelUpMessage += ` lost the ${rolesRemoved.map((role) => `<@&${role.id}>`).join(", ")} role${
							rolesRemoved.length > 1 ? "s" : ""
						}`;
				}

				await this.client.prisma.userLevel.update({
					where: { userId_guildId: { userId: message.author.id, guildId: message.guild_id! } },
					data: { level: calculatedLevel },
				});

				this.client.logger.info(
					`${message.author.username}#${message.author.discriminator} has leveled ${
						updatedUserLevel.level > calculatedLevel ? "down" : "up"
					} to level ${calculatedLevel} from ${updatedUserLevel.level} (${updatedUserLevel.experience} experience) ${
						rolesModified ? levelUpMessage : ""
					}!`,
				);

				await this.client.api.channels.createMessage(message.channel_id, {
					content: `<@${message.author.id}> has leveled ${
						updatedUserLevel.level > calculatedLevel ? "down" : "up"
					} to level ${calculatedLevel}${rolesModified ? levelUpMessage : ""}!`,
					message_reference: {
						message_id: message.id,
						fail_if_not_exists: false,
					},
					allowed_mentions: { parse: [], replied_user: true },
				});
			}
		}

		return this.client.textCommandHandler.handleTextCommand({ data: message, shardId });
	}
}
