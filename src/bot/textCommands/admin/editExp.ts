import TextCommand from "../../../../lib/classes/TextCommand.js";
import BetterClient from "../../../../lib/extensions/BetterClient.js";
import BetterMessage from "../../../../lib/extensions/BetterMessage.js";

export default class Ping extends TextCommand {
    constructor(client: BetterClient) {
        super("editexp", client, {
            description: "Edit a user's experience.",
            guildOnly: true,
            permissions: ["MANAGE_GUILD"],
            aliases: ["edit-exp", "edit_exp"]
        });
    }

    override async run(message: BetterMessage, args: string[]) {
        const user = await this.client.functions.parseUser(args[0]);
        args.shift();
        if (!user)
            return message.reply(
                this.client.functions.generateErrorMessage({
                    title: "Missing Argument",
                    description: "Please provide a user!"
                })
            );
        else if (
            !["add", "set", "remove"].includes(args[0]?.toLowerCase() || "")
        )
            return message.reply(
                this.client.functions.generateErrorMessage({
                    title: "Missing Argument",
                    description:
                        "Please choose what you would like to do with the experience! (`Add`, `Set`, or `Remove`)"
                })
            );
        else if (Number.isNaN(parseInt(args[1] || "", 10)))
            return message.reply(
                this.client.functions.generateErrorMessage({
                    title: "Missing Argument",
                    description: "Please provide a valid number!"
                })
            );
        const action = args.shift()!.toLowerCase();
        const amount = parseInt(args.shift()!, 10);
        let document;
        if (action === "add")
            document = await this.client.cache.updateLevelDocument({
                filter: { userId: user.id },
                update: { $inc: { experience: amount } },
                upsert: true
            });
        else if (action === "set")
            document = await this.client.cache.updateLevelDocument({
                filter: { userId: user.id },
                update: {
                    $set: { experience: amount }
                },
                upsert: true
            });
        else if (action === "remove")
            document = await this.client.cache.updateLevelDocument({
                filter: { userId: user.id },
                update: { $inc: { experience: amount * -1 } },
                upsert: true
            });
        return message.reply(
            this.client.functions.generateSuccessMessage({
                title: "Experience Edited",
                description: `${user.tag}'s experience has been edited, they now have ${document?.experience} experience!`
            })
        );
    }
}
