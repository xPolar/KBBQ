import TextCommand from "../../../../lib/classes/TextCommand.js";
import BetterClient from "../../../../lib/extensions/BetterClient.js";
import BetterMessage from "../../../../lib/extensions/BetterMessage.js";

export default class FakeBan extends TextCommand {
    constructor(client: BetterClient) {
        super("ban", client, {
            description: "Fake ban a user from the server.",
            permissions: ["BAN_MEMBERS"]
        });
    }

    override async run(message: BetterMessage, args: string[]) {
        if (!args.length)
            return message.reply(
                this.client.functions.generateErrorMessage({
                    title: "Missing Argument",
                    description: "Please provide a user to ban!"
                })
            );

        const user = await this.client.functions.parseUser(args.shift());

        if (!user)
            return message.reply(
                this.client.functions.generateErrorMessage({
                    title: "Invalid Argument",
                    description: "Please provide a valid user!"
                })
            );

        return message.reply({
            content: `I have queued the ban on ${user.toString()}, this may take a while.`,
            allowedMentions: { users: [user.id], repliedUser: true }
        });
    }
}

