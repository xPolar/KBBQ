import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync } from "node:fs";
import type { APIGuildMember, APIUser, APIRole, APIInteractionDataResolvedGuildMember } from "@discordjs/core";
import type { UserLevel } from "@prisma/client";
import canvas from "canvas";
import Config from "../../config/bot.config.js";
import type Language from "../classes/Language.js";
import Logger from "../classes/Logger.js";
import type ExtendedClient from "../extensions/ExtendedClient.js";

export default class Functions {
	/**
	 * Our extended client.
	 */
	private readonly client: ExtendedClient;

	/**
	 * The canvas module.
	 */
	private readonly canvas: typeof canvas;

	/**
	 * One second in milliseconds.
	 */
	private SEC = 1e3;

	/**
	 * One minute in milliseconds.
	 */
	private MIN = this.SEC * 60;

	/**
	 * One hour in milliseconds.
	 */
	private HOUR = this.MIN * 60;

	/**
	 * One day in milliseconds.
	 */
	private DAY = this.HOUR * 24;

	/**
	 * One year in milliseconds.
	 */
	private YEAR = this.DAY * 365.25;

	public constructor(client: ExtendedClient) {
		this.client = client;

		this.canvas = canvas;
		this.canvas.registerFont("./Comfortaa-Bold.ttf", {
			family: "Comfortaa",
		});
		this.canvas.registerFont("./Discord.otf", {
			family: "Discord",
		});
	}

	/**
	 * Get all of the files in a directory.
	 *
	 * @param directory The directory to get all of the files from.
	 * @param fileExtension The file extension to search for, leave blank to get all files.
	 * @param createDirectoryIfNotFound Whether or not the directory we want to search for should be created if it doesn't already exist.
	 * @returns The files within the directory.
	 */
	public getFiles(directory: string, fileExtension: string, createDirectoryIfNotFound: boolean = false) {
		if (createDirectoryIfNotFound && !existsSync(directory)) mkdirSync(directory);

		return readdirSync(directory).filter((file) => file.endsWith(fileExtension));
	}

	/**
	 * Parses the input string, returning the number of milliseconds.
	 *
	 * @param input The human-readable time string; eg: 10min, 10m, 10 minutes.
	 * @param language The language to use for the parsing.
	 * @returns The parsed value.
	 */
	public parse(input: string, language?: Language) {
		if (!language) language = this.client.languageHandler.getLanguage("en-US");

		const RGX = language.get("PARSE_REGEX");
		const arr = input.toLowerCase().match(RGX);
		let num: number;
		// eslint-disable-next-line no-cond-assign
		if (arr !== null && (num = Number.parseFloat(arr[1] || ""))) {
			if (arr[3] !== null) return num * this.SEC;
			if (arr[4] !== null) return num * this.MIN;
			if (arr[5] !== null) return num * this.HOUR;
			if (arr[6] !== null) return num * this.DAY;
			if (arr[7] !== null) return num * this.DAY * 7;
			if (arr[8] !== null) return num * this.YEAR;
			return num;
		}

		return null;
	}

	private _format(
		value: number,
		prefix: string,
		type: "day" | "hour" | "minute" | "ms" | "second" | "year",
		long: boolean,
		language: Language,
	) {
		const number = Math.trunc(value) === value ? value : Math.trunc(value + 0.5);

		if (type === "ms") return `${prefix}${number}ms`;

		return `${prefix}${number}${
			long
				? ` ${language.get(
						(number === 1 ? `${type}_ONE` : `${type}_OTHER`).toUpperCase() as Uppercase<
							`${typeof type}_ONE` | `${typeof type}_OTHER`
						>,
				  )}`
				: language.get(`${type}_SHORT`.toUpperCase() as Uppercase<`${typeof type}_SHORT`>)
		}`;
	}

	/**
	 * Formats the millisecond count to a human-readable time string.
	 *
	 * @param milli The number of milliseconds.
	 * @param long Whether or not the output should use the interval's long/full form; eg hour or hours instead of h.
	 * @param language The language to use for formatting.
	 * @returns The formatting count.
	 */
	public format(milli: number, long: boolean = true, language?: Language) {
		if (!language) language = this.client.languageHandler.defaultLanguage!;

		const prefix = milli < 0 ? "-" : "";
		const abs = milli < 0 ? -milli : milli;

		if (abs < this.SEC) return `${milli}${long ? " ms" : "ms"}`;
		if (abs < this.MIN) return this._format(abs / this.SEC, prefix, "second", long, language);
		if (abs < this.HOUR) return this._format(abs / this.MIN, prefix, "minute", long, language);
		if (abs < this.DAY) return this._format(abs / this.HOUR, prefix, "hour", long, language);
		if (abs < this.YEAR) return this._format(abs / this.DAY, prefix, "day", long, language);

		return this._format(abs / this.YEAR, prefix, "year", long, language);
	}

	/**
	 * Generate a unix timestamp for Discord to be rendered locally per user.
	 *
	 * @param options - The options to use for the timestamp.
	 * @param options.timestamp - The timestamp to use, defaults to the current time.
	 * @param options.type - The type of timestamp to generate, defaults to "f".
	 * @return The generated timestamp.
	 */
	public generateTimestamp(options?: {
		timestamp?: Date | number;
		type?: "D" | "d" | "F" | "f" | "R" | "T" | "t";
	}): string {
		let timestamp = options?.timestamp ?? new Date();
		const type = options?.type ?? "f";
		if (timestamp instanceof Date) timestamp = timestamp.getTime();
		return `<t:${Math.floor(timestamp / 1_000)}:${type}>`;
	}

	/**
	 * Generate a unix timestamp for Discord to be rendered locally per user.
	 *
	 * @param options The options to use for the timestamp.
	 * @param options.timestamp The timestamp to use, defaults to the current time.
	 * @param options.type The type of timestamp to generate, defaults to "f".
	 * @return The generated timestamp.
	 */
	// eslint-disable-next-line sonarjs/no-identical-functions
	public static generateTimestamp(options?: {
		timestamp?: Date | number;
		type?: "D" | "d" | "F" | "f" | "R" | "T" | "t";
	}): string {
		let timestamp = options?.timestamp ?? new Date();
		const type = options?.type ?? "f";
		if (timestamp instanceof Date) timestamp = timestamp.getTime();
		return `<t:${Math.floor(timestamp / 1_000)}:${type}>`;
	}

	/**
	 * Upload content to a hastebin server.
	 *
	 * @param content The content to upload to the hastebin server.
	 * @param options The options to use for the upload.
	 * @param options.server The server to upload to, defaults to the client's configured hastebin server.
	 * @param options.type The type of the content, defaults to "md".
	 * @returns The URL to the uploaded content.
	 */
	public async uploadToHastebin(content: string, options?: { server?: string; type?: string }) {
		try {
			const response = await fetch(`${options?.server ?? this.client.config.hastebin}/documents`, {
				method: "POST",
				body: content,
				headers: {
					"User-Agent": `${this.client.config.botName.toLowerCase().split(" ").join("_")}/${
						this.client.config.version
					}`,
				},
			});

			const responseJSON = await response.json();

			return `${options?.server ?? this.client.config.hastebin}/${responseJSON.key}.${options?.type ?? "md"}`;
		} catch (error) {
			this.client.logger.error(error);
			await this.client.logger.sentry.captureWithExtras(error, {
				Hastebin: options?.server ?? this.client.config.hastebin,
				Content: content,
			});

			return null;
		}
	}

	/**
	 * Upload content to a hastebin server. This is a static method.
	 *
	 * @param content The content to upload to the hastebin server.
	 * @param options The options to use for the upload.
	 * @param options.server The server to upload to, defaults to the client's configured hastebin server.
	 * @param options.type The type of the content, defaults to "md".
	 * @returns The URL to the uploaded content.
	 */
	public static async uploadToHastebin(content: string, options?: { server?: string; type?: string }) {
		try {
			const response = await fetch(`${options?.server ?? Config.hastebin}/documents`, {
				method: "POST",
				body: content,
				headers: {
					"User-Agent": `${Config.botName.toLowerCase().split(" ").join("_")}/${Config.version}`,
				},
			});

			const responseJSON = await response.json();

			return `${options?.server ?? Config.hastebin}/${responseJSON.key}.${options?.type ?? "md"}`;
		} catch (error) {
			Logger.error(error);
			await Logger.sentry.captureWithExtras(error, {
				Hastebin: options?.server ?? Config.hastebin,
				Content: content,
			});

			return null;
		}
	}

	/**
	 * Verify if the input is a function.
	 *
	 * @param input The input to verify.
	 * @returns Whether the input is a function or not.
	 */
	public isFunction(input: any): boolean {
		return typeof input === "function";
	}

	/**
	 * Verify if an object is a promise.
	 *
	 * @param input The object to verify.
	 * @returns Whether the object is a promise or not.
	 */
	public isThenable(input: any): boolean {
		if (!input) return false;
		return (
			input instanceof Promise ||
			(input !== Promise.prototype && this.isFunction(input.then) && this.isFunction(input.catch))
		);
	}

	/**
	 * Hash a string into SHA256.
	 *
	 * @param string The string to hash.
	 * @return The hashed string.
	 */
	public hash(string: string): string {
		return createHash("sha256").update(string).digest("hex");
	}

	/**
	 * Calculate what level a user is from their experience.
	 *
	 * @param experience The experience to calculate the level from.
	 * @returns The level calculated from the experience.
	 */
	public calculateLevelFromExperience(experience: number) {
		return Math.floor(Math.sqrt((experience * 9) / 625)) ?? 0;
	}

	/**
	 * Calculate what experience a user is from their level.
	 *
	 * @param level The level to calculate the experience from.
	 * @returns The experience calculated from the level.
	 */
	public calculateExperienceFromLevel(level: number) {
		return Math.ceil((625 * level ** 2) / 9);
	}

	/**
	 * Abbreviate a number.
	 *
	 * @param number The number we want to abbreviate.
	 * @returns The abbreviated number.
	 */
	public abbreviateNumber(number: number): string {
		const suffixes = ["", "K", "M", "B", "T"];
		let newNumber: number | string = number;
		let suffixNum = 0;
		while (newNumber >= 1_000) {
			newNumber /= 1_000;
			suffixNum++;
		}

		newNumber = newNumber.toPrecision(3);
		newNumber += suffixes[suffixNum];
		return newNumber;
	}

	/**
	 * Generate a level card for a user.
	 *
	 * @param options The options to use when creating this level card.
	 * @param options.member The member to create the level card for.
	 * @param options.user The user to create the level card for.
	 * @param options.userLevel The user's level to create the level card for.
	 * @returns A Buffer containing the level card.
	 */
	public async generateLevelCard({
		member,
		user,
		userLevel,
	}: {
		member: APIInteractionDataResolvedGuildMember | undefined;
		user: APIUser;
		userLevel: UserLevel;
	}) {
		const level = this.calculateLevelFromExperience(userLevel.experience);
		const neededExperience = this.calculateExperienceFromLevel(level + 1);

		const canvas = this.canvas.createCanvas(800, 200);
		const context = canvas.getContext("2d");
		context.fillStyle = "#6C3400";

		const background = await this.canvas.loadImage("https://cdn.polar.blue/r/Frame_276.png");

		context.drawImage(background, 0, 0);

		// Experience needed bar
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

		// Current experience bar
		context.beginPath();
		context.moveTo(32, 188);
		context.arc(32, 172, 16, 0.5 * Math.PI, 1.5 * Math.PI);
		context.lineTo(768 * (userLevel.experience / neededExperience), 156);
		context.arc(Math.max(32, 768 * (userLevel.experience / neededExperience)), 172, 16, 1.5 * Math.PI, 0.5 * Math.PI);
		context.lineTo(32, 188);
		context.closePath();
		context.fill();

		// Leveling information
		context.font = "24px Comfortaa";
		context.fillText(
			`Level: ${level}   XP: ${this.abbreviateNumber(userLevel.experience)}/${this.abbreviateNumber(neededExperience)}`,
			156,
			120,
		);

		// Username
		context.font = "40px Discord";
		context.textAlign = "left";

		const name = `${user.username}#${user.discriminator}`;
		const userText = name.length > 16 ? `${name.slice(0, 16)}...` : name;

		context.fillText(userText, 156, 60);
		context.fillRect(156, 80, context.measureText(userText).width, 4);

		// Circle around avatar
		context.beginPath();
		context.arc(76, 76, 64, 0, Math.PI * 2);
		context.closePath();
		context.strokeStyle = "#6C3400";
		context.lineWidth = 4;
		context.stroke();

		// Circle for avatar
		context.beginPath();
		context.arc(76, 76, 60, 0, Math.PI * 2);
		context.closePath();
		context.clip();

		// Avatar
		const avatar = await this.canvas.loadImage(
			`https://cdn.discordapp.com/${
				member?.avatar || user.avatar
					? member?.avatar
						? `guilds/${userLevel.guildId}/users/${user.id}/avatars/${member.avatar}.png`
						: `avatars/${user.id}/${user.avatar}.png`
					: `embed/avatars/${user.discriminator}.png`
			}`,
		);
		context.drawImage(avatar, 16, 16, 120, 120);

		return canvas.toBuffer();
	}

	/**
	 * Get the week of year from a date.
	 *
	 * @param date The date to get the week of year from. Defaults to the current date.
	 * @returns The week of year in the format of `year_week`, such as 2023_123.
	 */
	public getWeekOfYear(date?: Date) {
		if (!date) date = new Date();

		const januaryFirst = new Date(date.getUTCFullYear(), 0, 1);
		const numberOfDays = Math.floor(Math.abs(date.getTime() - januaryFirst.getTime()) / (24 * 60 * 60 * 100));

		return `${date.getUTCFullYear()}_${Math.ceil((date.getUTCDay() + 1 + numberOfDays) / 7)}`;
	}

	/**
	 * Distribute the proper roles to a user based on their leveling information.
	 *
	 * @param member The member to distribute the level roles to.
	 * @param userLevel The user's current leveling information.
	 * @returns What roles have been added and or taken from the user in the format of [listOfAddedRoleIds, listOfRemovedRoleIds].
	 */
	public async distributeLevelRoles(member: APIGuildMember, userLevel: UserLevel) {
		const validLevelRoles: APIRole[] = [];
		const levelRolesMemberShouldHave: APIRole[] = [];

		if (!this.client.guildRolesCache.get(userLevel.guildId)) {
			const guildRoles = new Map();

			for (const guildRole of await this.client.api.guilds.getRoles(userLevel.guildId))
				guildRoles.set(guildRole.id, guildRole);

			this.client.guildRolesCache.set(userLevel.guildId, guildRoles);
		}

		const guildRoles = this.client.guildRolesCache.get(userLevel.guildId)!;

		const currentLevel = this.client.functions.calculateLevelFromExperience(userLevel.experience);

		for (const [key, value] of Object.entries(this.client.config.otherConfig.levelRoles)) {
			const validRole = guildRoles.get(value);
			if (!validRole) continue;

			validLevelRoles.push(validRole);

			if (currentLevel >= Number(key)) levelRolesMemberShouldHave.push(validRole);
		}

		const rolesAdded = levelRolesMemberShouldHave.filter((role) => !member.roles.includes(role.id));
		const rolesRemoved = validLevelRoles.filter(
			(role) => member.roles.includes(role.id) && !levelRolesMemberShouldHave.includes(role),
		);
		const roleIdsRemoved = rolesRemoved.map((role) => role.id);

		await this.client.api.guilds.editMember(userLevel.guildId, userLevel.userId, {
			roles: [
				...new Set(
					member.roles.filter((role) => !roleIdsRemoved.includes(role)).concat(rolesAdded.map((role) => role.id)),
				),
			],
		});

		return [rolesAdded, rolesRemoved] as const;
	}
}
