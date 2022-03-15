import {
    BaseGuildVoiceChannel,
    Collection,
    GuildMember,
    Snowflake,
    TextChannel,
    VoiceState
} from "discord.js";
import BetterClient from "../extensions/BetterClient.js";

export default class VoiceLeveling {
    private readonly client: BetterClient;

    private membersInVoiceChat: Collection<Snowflake, GuildMember>;

    private interval?: NodeJS.Timer;

    private levelUpTextChannel?: TextChannel;

    private readonly levelRoleKeys: Record<Snowflake, number>;

    constructor(client: BetterClient) {
        this.client = client;
        this.membersInVoiceChat = new Collection<Snowflake, GuildMember>();

        this.levelRoleKeys = {};
        Object.entries(this.client.config.otherConfig.levelRoles).forEach(
            ([key, value]) => (this.levelRoleKeys[value] = parseInt(key, 10))
        );
    }

    public startVoiceLeveling() {
        this.client.channels.cache
            .filter(
                channel =>
                    ["GUILD_VOICE", "GUILD_STAGE_VOICE"].includes(
                        channel.type
                    ) && (channel as BaseGuildVoiceChannel).members.size > 0
            )
            .forEach(
                channel =>
                    (this.membersInVoiceChat = this.membersInVoiceChat.concat(
                        (channel as BaseGuildVoiceChannel).members
                    ))
            );
        this.interval = setInterval(this.incrementExperience.bind(this), 60000);
        this.client.on("voiceStateUpdate", this.handleNewVoiceState.bind(this));
    }

    public stopVoiceLeveling() {
        clearInterval(this.interval!);
        this.client.off(
            "voiceStateUpdate",
            this.handleNewVoiceState.bind(this)
        );
        this.membersInVoiceChat = new Collection<Snowflake, GuildMember>();
    }

    private handleNewVoiceState(
        oldVoiceState: VoiceState,
        newVoiceState: VoiceState
    ) {
        if (!newVoiceState.member) return;
        if (oldVoiceState.channel === null && newVoiceState.channel !== null)
            this.membersInVoiceChat.set(
                newVoiceState.member.id,
                newVoiceState.member
            );
        else if (
            oldVoiceState.channel !== null &&
            newVoiceState.channel === null
        )
            this.membersInVoiceChat.delete(newVoiceState.member.id);
    }

    private async incrementExperience() {
        const amount = Math.floor(Math.random() * (10 - 5) + 5) * 2;
        const updatedDocuments =
            await this.client.cache.massUpdateLevelDocument(
                this.membersInVoiceChat
                    .filter(
                        member =>
                            (!member.voice.selfDeaf &&
                                !member.voice.selfMute &&
                                !member.user.bot) ||
                            member.voice.channel?.type === "GUILD_STAGE_VOICE"
                    )
                    .map(member => ({
                        filter: { userId: member.id },
                        update: {
                            $inc: { experience: amount },
                            $setOnInsert: {
                                level: 0
                            }
                        },
                        upsert: true
                    }))
            );
        for (const document of updatedDocuments.filter(
            doc =>
                doc &&
                doc.level !==
                    this.client.functions.calculateLevelFromExperience(
                        doc.experience
                    )
        )) {
            // @ts-ignore - This is used idk why ts is yelling.
            let message = "";
            const member = this.levelUpTextChannel?.guild.members.cache.get(
                document?.userId || ""
            );
            if (
                member &&
                member?.voice.channel?.type === "GUILD_VOICE" &&
                document
            ) {
                const [rolesAdded, rolesRemoved] =
                    // eslint-disable-next-line no-await-in-loop
                    await this.client.functions.distributeLevelRoles(
                        member,
                        document
                    );
                const rolesModified = rolesAdded.length || rolesRemoved.length;
                if (rolesModified) {
                    if (!(rolesAdded.length && rolesRemoved.length))
                        message += " and";
                    if (rolesAdded.length)
                        message += ` earned the ${rolesAdded
                            .map(role => role.name)
                            .join(", ")} role${
                            rolesAdded.length > 1 ? "s" : ""
                        }`;
                    if (rolesAdded.length && rolesRemoved.length)
                        message += " and";
                    if (rolesRemoved.length)
                        message += ` lost the ${rolesRemoved
                            .map(role => role.name)
                            .join(", ")} role${
                            rolesRemoved.length > 1 ? "s" : ""
                        }`;
                }
                const level =
                    this.client.functions.calculateLevelFromExperience(
                        document.experience
                    );
                // eslint-disable-next-line no-await-in-loop
                await this.client.cache.updateLevelDocument({
                    filter: { userId: member.id },
                    update: {
                        $set: {
                            level
                        }
                    }
                });
                this.client.logger.info(
                    `${member.user.tag} has gone ${level} day${
                        level === 1 ? "" : "s"
                    } without touching grass${rolesModified ? message : ""}!`
                );
                // eslint-disable-next-line no-await-in-loop
                await member.send({
                    content: `You've gone ${level} day${
                        level === 1 ? "" : "s"
                    } without touching grass${rolesModified ? message : ""}!`,
                    allowedMentions: { parse: ["users"] }
                });
            }
        }
        this.client.dataDog.gauge(
            "voice.members",
            this.membersInVoiceChat.size
        );
        this.client.dataDog.gauge(
            "voice.validMembers",
            updatedDocuments.length
        );
        this.client.dataDog.increment(
            "voice.minutes",
            this.membersInVoiceChat.size
        );
        this.client.logger.info(
            `Incremented voiceExperience by ${amount} for ${updatedDocuments.length} members`
        );
    }
}
