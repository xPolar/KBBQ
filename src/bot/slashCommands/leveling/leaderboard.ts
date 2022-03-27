import { CommandInteraction, GuildMember } from "discord.js";
import SlashCommand from "../../../../lib/classes/SlashCommand.js";
import BetterClient from "../../../../lib/extensions/BetterClient.js";

export default class Leaderboard extends SlashCommand {
    constructor(client: BetterClient) {
        super("leaderboard", client, {
            description: "View the leaderboard.",
            guildOnly: true,
            options: [
                {
                    name: "weekly",
                    description: "Get the weekly leaderboard.",
                    type: "SUB_COMMAND_GROUP",
                    options: [
                        {
                            name: "text",
                            description: "Get the weekly text leaderboard.",
                            type: "SUB_COMMAND"
                        },
                        {
                            name: "voice",
                            description: "Get the weekly voice leaderboard.",
                            type: "SUB_COMMAND"
                        }
                    ]
                }
            ]
        });
    }

    override async run(interaction: CommandInteraction) {
        await interaction.deferReply({ fetchReply: true });

        if (interaction.options.getSubcommand(false) === "text") {
            return interaction.editReply(
                this.client.functions.generatePrimaryMessage({
                    title: "Text Leaderboard",
                    description:
                        await this.client.functions.generateWeeklyLeadeboardMessage(
                            interaction.member as GuildMember,
                            "text"
                        )
                })
            );
        } else if (interaction.options.getSubcommand(false) === "voice") {
            return interaction.editReply(
                this.client.functions.generatePrimaryMessage({
                    title: "Voice Leaderboard",
                    description:
                        await this.client.functions.generateWeeklyLeadeboardMessage(
                            interaction.member as GuildMember,
                            "voice"
                        )
                })
            );
        }

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
