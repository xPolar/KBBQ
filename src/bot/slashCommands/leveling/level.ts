import { CommandInteraction, GuildMember } from "discord.js";
import SlashCommand from "../../../../lib/classes/SlashCommand.js";
import BetterClient from "../../../../lib/extensions/BetterClient.js";

export default class Level extends SlashCommand {
    constructor(client: BetterClient) {
        super("level", client, {
            description: `Check your or another user's level.`,
            guildOnly: true
        });
    }

    override async run(interaction: CommandInteraction) {
        const document = (await this.client.cache.getLevelDocument(
            interaction.user.id
        )) || {
            userId: interaction.user.id,
            experience: 0,
            level: 0
        };
        return interaction.reply({
            files: [
                await this.client.functions.generateLevelCard(
                    interaction.member! as GuildMember,
                    document
                )
            ]
        });
    }
}
