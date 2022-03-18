import { CommandInteraction, GuildMember } from "discord.js";
import SlashCommand from "../../../../lib/classes/SlashCommand.js";
import BetterClient from "../../../../lib/extensions/BetterClient.js";

export default class Leaderboard extends SlashCommand {
    constructor(client: BetterClient) {
        super("leaderboard", client, {
            description: "View the leaderboard.",
            guildOnly: true
        });
    }

    override async run(interaction: CommandInteraction) {
        await interaction.deferReply({ fetchReply: true });
        return interaction.editReply(
            this.client.functions.generatePrimaryMessage({
                title: "Level Leaderboard",
                description:
                    await this.client.functions.generateLeaderboardMessage(
                        interaction.member as GuildMember
                    )
            })
        );
    }
}
