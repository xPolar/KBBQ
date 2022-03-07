import { ClientEvents, Snowflake } from "discord.js";
import EventHandler from "../../../lib/classes/EventHandler.js";
import BetterMessage from "../../../lib/extensions/BetterMessage.js";
import BetterClient from "../../../lib/extensions/BetterClient";

export default class MessageCreate extends EventHandler {
    private readonly expCooldown: Record<Snowflake, number>;

    private readonly levelRoleKeys: Record<Snowflake, number>;

    constructor(client: BetterClient, name: keyof ClientEvents) {
        super(client, name);

        this.expCooldown = {};
        this.levelRoleKeys = {};
        Object.entries(this.client.config.otherConfig.levelRoles).forEach(
            ([key, value]) => (this.levelRoleKeys[value] = parseInt(key, 10))
        );
    }

    override async run(message: BetterMessage) {
        this.client.dataDog.increment("events", 1, ["event:messageCreate"]);
        this.client.dataDog.increment("messagesSeen");
        if (message.author.bot) return;
        // @ts-ignore
        else if (this.client.mongo.topology.s.state === "connected")
            await this.client.textCommandHandler.handleCommand(message);
        if (
            message.inGuild() &&
            (process.env.NODE_ENV === "production" ||
                (process.env.NODE_ENV === "development" &&
                    this.client.config.admins.includes(message.author.id))) &&
            Date.now() > (this.expCooldown[message.author.id] || 0)
        ) {
            this.expCooldown[message.author.id] = Date.now() + 60000;
            // const leveling =
            await this.client.cache.updateLevelDocument({
                filter: { userId: message.author.id },
                update: {
                    $inc: {
                        experience: Math.floor(Math.random() * 16) + 15
                    },
                    $setOnInsert: {
                        level: 0
                    }
                },
                upsert: true
            });
            // if (
            //     leveling &&
            //     leveling.level !==
            //         this.client.functions.calculateLevelFromExperience(
            //             leveling.experience
            //         )
            // ) {
            //     const [rolesAdded, rolesRemoved] =
            //         await this.client.functions.distributeLevelRoles(
            //             message.member!,
            //             leveling
            //         );
            //     const rolesModified = rolesAdded.length || rolesRemoved.length;
            //     let roleMessage = "";
            //     if (rolesModified) {
            //         if (!(rolesAdded.length && rolesRemoved.length))
            //             roleMessage += " and";
            //         if (rolesAdded.length)
            //             roleMessage += ` earned the ${rolesAdded
            //                 .map(role => role.toString())
            //                 .join(", ")} role${
            //                 rolesAdded.length > 1 ? "s" : ""
            //             }`;
            //         if (rolesAdded.length && rolesRemoved.length)
            //             roleMessage += " and";
            //         if (rolesRemoved.length)
            //             roleMessage += ` lost the ${rolesRemoved
            //                 .map(role => role.toString())
            //                 .join(", ")} role${
            //                 rolesRemoved.length > 1 ? "s" : ""
            //             }`;
            //     }
            //     const level =
            //         this.client.functions.calculateLevelFromExperience(
            //             leveling.experience
            //         );
            //     await this.client.cache.updateLevelDocument({
            //         filter: { userId: message.author.id },
            //         update: {
            //             $set: {
            //                 level
            //             }
            //         }
            //     });
            //     this.client.logger.info(
            //         `${message.author.tag} has gone ${level} day${
            //             level === 1 ? "" : "s"
            //         } without touching grass${
            //             rolesModified ? roleMessage : ""
            //         }!`.replace("`", "")
            //     );
            //     await message.reply({
            //         content: `${message.author.toString()} has gone ${level} day${
            //             level === 1 ? "" : "s"
            //         } without touching grass${
            //             rolesModified ? roleMessage : ""
            //         }!`,
            //         allowedMentions: { parse: ["users"] }
            //     });
            // }
        }
    }
}
