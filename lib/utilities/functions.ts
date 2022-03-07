import { createHash } from "crypto";
import * as petitio from "petitio";
import {
    GuildMember,
    MessageActionRow,
    MessageAttachment,
    MessageEmbed,
    MessageEmbedOptions,
    PermissionString,
    Role,
    User
} from "discord.js";
import * as c from "canvas";
import { Document, WithId } from "mongodb";
import { existsSync, mkdirSync, readdirSync } from "fs";
import { PetitioRequest } from "petitio/dist/lib/PetitioRequest";
import { permissionNames } from "./permissions.js";
import BetterClient from "../extensions/BetterClient.js";
import {
    GeneratedMessage,
    GenerateTimestampOptions,
    UserLevelDocument
} from "../../typings";

export default class Functions {
    /**
     * Our Client.
     * @private
     */
    private readonly client: BetterClient;

    /**
     * Our Canvas instance.
     * @private
     */
    private readonly canvas;

    /**
     * Create our functions.
     * @param client Our client.
     */
    constructor(client: BetterClient) {
        this.client = client;

        // @ts-ignore
        this.canvas = c.default;
        this.canvas.registerFont("./Comfortaa-Bold.ttf", {
            family: "Comfortaa"
        });
        this.canvas.registerFont("./Discord.otf", {
            family: "Discord"
        });
    }

    /**
     * Get all the files in all the subdirectories of a directory.
     * @param directory The directory to get the files from.
     * @param fileExtension The extension to search for.
     * @param createDirIfNotFound Whether or not the parent directory should be created if it doesn't exist.
     * @returns The files in the directory.
     */
    public getFiles(
        directory: string,
        fileExtension: string,
        createDirIfNotFound: boolean = false
    ): string[] {
        if (createDirIfNotFound && !existsSync(directory)) mkdirSync(directory);
        return readdirSync(directory).filter(file =>
            file.endsWith(fileExtension)
        );
    }

    /**
     * Generate a full primary message with a simple helper function.
     * @param embedInfo The information to build our embed with.
     * @param components The components for our message.
     * @param ephemeral Whether our message should be ephemeral or not.
     * @returns The generated primary message.
     */
    public generatePrimaryMessage(
        embedInfo: MessageEmbedOptions,
        components: MessageActionRow[] = [],
        ephemeral: boolean = false
    ): GeneratedMessage {
        return {
            embeds: [
                new MessageEmbed(embedInfo).setColor(
                    parseInt(this.client.config.colors.primary, 16)
                )
            ],
            components,
            ephemeral
        };
    }

    /**
     * Generate a full success message with a simple helper function.
     * @param embedInfo The information to build our embed with.
     * @param components The components for our message.
     * @param ephemeral Whether our message should be ephemeral or not.
     * @returns The generated success message.
     */
    public generateSuccessMessage(
        embedInfo: MessageEmbedOptions,
        components: MessageActionRow[] = [],
        ephemeral: boolean = false
    ): GeneratedMessage {
        return {
            embeds: [
                new MessageEmbed(embedInfo).setColor(
                    parseInt(this.client.config.colors.success, 16)
                )
            ],
            components,
            ephemeral
        };
    }

    /**
     * Generate a full warning message with a simple helper function.
     * @param embedInfo The information to build our embed with.
     * @param components The components for our message.
     * @param ephemeral Whether our message should be ephemeral or not.
     * @returns The generated warning message.
     */
    public generateWarningMessage(
        embedInfo: MessageEmbedOptions,
        components: MessageActionRow[] = [],
        ephemeral: boolean = false
    ): GeneratedMessage {
        return {
            embeds: [
                new MessageEmbed(embedInfo).setColor(
                    parseInt(this.client.config.colors.warning, 16)
                )
            ],
            components,
            ephemeral
        };
    }

    /**
     * Generate a full error message with a simple helper function.
     * @param embedInfo The information to build our embed with.
     * @param supportServer Whether or not to add the support server link as a component.
     * @param components The components for our message.
     * @param ephemeral Whether our message should be ephemeral or not.
     * @returns The generated error message.
     */
    public generateErrorMessage(
        embedInfo: MessageEmbedOptions,
        components: MessageActionRow[] = [],
        ephemeral: boolean = true
    ): GeneratedMessage {
        return {
            embeds: [
                new MessageEmbed(embedInfo).setColor(
                    parseInt(this.client.config.colors.error, 16)
                )
            ],
            components,
            ephemeral
        };
    }

    /**
     * Upload content to the hastebin we use.
     * @param content The content to upload.
     * @param type The file type to append to the end of the haste.
     * @returns The URL to the uploaded content.
     */
    public async uploadHaste(
        content: string,
        type?: string
    ): Promise<string | null> {
        try {
            const haste = await (
                (await petitio
                    // @ts-ignore
                    .default(
                        `${this.client.config.hastebin}/documents`,
                        "POST"
                    )) as PetitioRequest
            )
                .body(content)
                .header(
                    "User-Agent",
                    `${this.client.config.botName}/${this.client.config.version}`
                )
                .json();
            return `${this.client.config.hastebin}/${haste.key}${
                type ? `.${type}` : ".md"
            }`;
        } catch (error) {
            this.client.logger.error(error);
            this.client.logger.sentry.captureWithExtras(error, {
                Hastebin: this.client.config.hastebin,
                Content: content
            });
            return null;
        }
    }

    /**
     * Generate a random string of a given length.
     * @param length The length of the string to generate.
     * @param from The characters to use for the string.
     * @returns The generated random ID.
     */
    public generateRandomId(
        length: number,
        from: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    ): string {
        let generatedId = "";
        for (let i = 0; i < length; i++)
            generatedId += from[Math.floor(Math.random() * from.length)];
        return generatedId;
    }

    /**
     * Get the proper name of a permission.
     * @param permission The permission to get the name of.
     * @returns The proper name of the permission.
     */
    public getPermissionName(permission: PermissionString): string {
        if (permissionNames.has(permission))
            return permissionNames.get(permission)!;
        return permission;
    }

    /**
     * Generate a unix timestamp for Discord to be rendered locally per user.
     * @param options The options to use for the timestamp.
     * @returns The generated timestamp.
     */
    public generateTimestamp(options?: GenerateTimestampOptions): string {
        let timestamp = options?.timestamp || new Date();
        const type = options?.type || "f";
        if (timestamp instanceof Date) timestamp = timestamp.getTime();
        return `<t:${Math.floor(timestamp / 1000)}:${type}>`;
    }

    /**
     * Parse a string to a User.
     * @param user The user to parse.
     * @returns The parsed user.
     */
    public async parseUser(user?: string): Promise<User | undefined> {
        if (!user) return undefined;
        if (
            (user.startsWith("<@") || user.startsWith("<@!")) &&
            user.endsWith(">")
        )
            user = user.slice(2, -1);
        if (user.startsWith("!")) user = user.slice(1);
        try {
            return (
                this.client.users.cache.get(user) ||
                this.client.users.cache.find(
                    u => u.tag.toLowerCase() === user?.toLowerCase()
                ) ||
                (await this.client.users.fetch(user))
            );
        } catch (error: any) {
            if (error.code === 50035) return undefined;
            this.client.logger.error(error);
            this.client.logger.sentry.captureWithExtras(error, { input: user });
        }
        return undefined;
    }

    /**
     * Turn a string into Title Case.
     * @param string The string to convert.
     * @returns The converted string.
     */
    public titleCase(string: string): string {
        return string
            .split(" ")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    }

    /**
     * Calculate what level someone is from their current amount of experience.
     * @param experience Their current experience.
     * @returns Their current level.
     */
    public calculateLevelFromExperience(experience: number): number {
        if (experience < 100) return 0;
        return Math.floor(
            Math.ceil(Math.sqrt(-50 + (20 * experience + 500))) / 10
        );
    }

    /**
     * Calculate how much experience someone has from their current level.
     * @param level Their current level.
     * @returns Their current experience.
     */
    public calculateExperienceFromLevel(level: number): number {
        return 5 * level ** 2 + 50 * level + 100;
    }

    /**
     * Distribute all the level roles a user should have.
     * @param member The member to distribute the roles for.
     * @param document Their level document
     */
    public async distributeLevelRoles(
        member: GuildMember,
        document: WithId<UserLevelDocument>
    ): Promise<[Role[], Role[]]> {
        const validLevelRoles: Role[] = [];
        const levelRolesMemberShouldHave: Role[] = [];
        Object.entries(this.client.config.otherConfig.levelRoles).forEach(
            ([key, value]) => {
                const role = member.guild.roles.cache.get(value);
                if (!role) return;
                validLevelRoles.push(role);
                if (
                    this.client.functions.calculateLevelFromExperience(
                        document.experience
                    ) >= parseInt(key, 10)
                )
                    levelRolesMemberShouldHave.push(role);
            }
        );
        const rolesAdded = levelRolesMemberShouldHave.filter(
            role => !member.roles.cache.has(role.id)
        );
        const rolesRemoved = member.roles.cache
            .filter(
                role =>
                    !levelRolesMemberShouldHave.includes(role) &&
                    validLevelRoles.includes(role)
            )
            .map(role => role);
        await member.roles.set(
            member.roles.cache
                .filter(role => !validLevelRoles.includes(role))
                .map(role => role)
                .concat(...levelRolesMemberShouldHave)
        );
        return [rolesAdded, rolesRemoved];
    }

    /**
     * Hash a string into SHA256.
     * @param string The string to hash.
     * @returns The hashed string.
     */
    public hash(string: string): string {
        return createHash("sha256").update(string).digest("hex");
    }

    /**
     * Choose an item out of a list of items.
     * @param choices The list of items to choose from.
     * @returns The chosen item.
     */
    public random(choices: any[]): any {
        return choices[Math.floor(Math.random() * choices.length)];
    }

    /**
     * Abbreviate a number.
     * @param number The number we want to abbreviate.
     * @returns The abbreviated number.
     */
    public abbreviateNumber(number: number): string {
        const suffixes = ["", "K", "M", "B", "T"];
        let newNumber: number | string = number;
        let suffixNum = 0;
        while (newNumber >= 1000) {
            newNumber /= 1000;
            suffixNum++;
        }
        newNumber = newNumber.toPrecision(3);
        newNumber += suffixes[suffixNum];
        return newNumber;
    }

    /**
     * Generate an image level card.
     * @param member The member to generate a level card for.
     * @param document The member's level document.
     * @returns The generated level card.
     */
    public async generateLevelCard(
        member: GuildMember,
        document: Pick<UserLevelDocument, "level" | "experience">
    ): Promise<MessageAttachment> {
        const { experience } = document;
        const level = this.calculateLevelFromExperience(experience);
        const neededExperience = this.calculateExperienceFromLevel(level + 1);

        const canvas = this.canvas.createCanvas(800, 200);
        const context = canvas.getContext("2d");
        context.fillStyle = "#6C3400";

        const background = await this.canvas.loadImage(
            "https://cdn.polar.blue/r/Frame_276.png"
        );

        context.drawImage(background, 0, 0);

        context.beginPath();
        context.moveTo(32, 188);
        context.arc(32, 172, 16, 0.5 * Math.PI, 1.5 * Math.PI);
        context.lineTo(32, 156);
        context.lineTo(768, 156);
        context.arc(768, 172, 16, 1.5 * Math.PI, 0.5 * Math.PI);
        context.closePath();
        context.globalAlpha = 0.5;
        context.fill();
        context.globalAlpha = 1;

        context.beginPath();
        context.moveTo(32, 188);
        context.arc(32, 172, 16, 0.5 * Math.PI, 1.5 * Math.PI);
        context.lineTo(768 * (experience / neededExperience), 156);
        context.arc(
            Math.max(32, 768 * (experience / neededExperience)),
            172,
            16,
            1.5 * Math.PI,
            0.5 * Math.PI
        );
        context.lineTo(32, 188);
        context.closePath();
        context.fill();

        context.font = "24px Comfortaa";
        context.fillText(
            `Level: ${level}   XP: ${this.abbreviateNumber(
                experience
            )}/${this.abbreviateNumber(neededExperience)}`,
            156,
            120
        );

        context.font = "40px Discord";
        context.textAlign = "left";

        const name = member.user.username;
        const usertext =
            name.length > 16
                ? `${name.substring(0, 16)}...`
                : `${name}#${member.user.discriminator}`;

        context.fillText(usertext, 156, 60);
        context.fillRect(156, 80, context.measureText(usertext).width, 4);

        context.beginPath();
        context.arc(76, 76, 64, 0, Math.PI * 2);
        context.closePath();
        context.strokeStyle = "#6C3400";
        context.lineWidth = "4";
        context.stroke();

        context.beginPath();
        context.arc(76, 76, 60, 0, Math.PI * 2);
        context.closePath();
        context.clip();

        const avatar = await this.canvas.loadImage(
            member.user.displayAvatarURL({ format: "png" })
        );
        context.drawImage(avatar, 16, 16, 120, 120);

        return new MessageAttachment(canvas.toBuffer(), "levelCard.png");
    }

    public async generateLeaderboardMessage(
        member: GuildMember
    ): Promise<string> {
        let message = "";
        const documents = await this.client.cache.getAllLevelDocuments(true);
        message += documents
            .splice(0, 10)
            .map(
                (document, index) =>
                    `${index + 1}. <@${
                        document.userId
                    }> **Level ${this.client.functions.calculateLevelFromExperience(
                        document.experience
                    )}** XP: ${document.experience}`
            )
            .join("\n");
        if (!message.includes(member.user.id)) {
            const index = documents.indexOf(
                documents.find(
                    document => document.userId === member.user.id
                ) as WithId<Document>
            );
            if (index !== -1) {
                message += "\n━━━━━━━━━━━━━━";
                for (let i = -1; i <= 1; i++) {
                    message += `\n${index + i + 1}. <@${
                        documents[index + i].userId
                    }> **Level ${this.client.functions.calculateLevelFromExperience(
                        documents[index + i].experience
                    )}** XP: ${documents[index + i].experience}`;
                }
            }
        }
        return message;
    }
}
