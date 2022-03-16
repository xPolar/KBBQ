import { CommandInteraction, GuildMember } from "discord.js";
import SlashCommand from "../../../../lib/classes/SlashCommand.js";
import BetterClient from "../../../../lib/extensions/BetterClient.js";

export default class Level extends SlashCommand {
    constructor(client: BetterClient) {
        super("level", client, {
            description: `Check your or another user's level.`,
            guildOnly: true,
            options: [
                {
                    name: "member",
                    description: "The member you want to view the level of.",
                    type: "USER"
                }
            ]
        });
    }

    override async run(interaction: CommandInteraction) {
        const user = interaction.options.getUser("member") || interaction.user;
        const member =
            interaction.guild!.members.cache.get(user.id) ||
            interaction.member!;
        const document = (await this.client.cache.getLevelDocument(
            member.user.id
        )) || {
            userId: member.user.id,
            experience: 0,
            level: 0
        };
        return interaction.editReply({
            files: [
                await this.client.functions.generateLevelCard(
                    member as GuildMember,
                    document
                )
            ]
        });
    }
}
