import { execSync } from "node:child_process";
import { resolve } from "node:path";
import process from "node:process";
import { setInterval } from "node:timers";
import type { APIRole, ClientOptions, MappedEvents } from "@discordjs/core";
import { API, Client } from "@discordjs/core";
import type { StatusRole } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import i18next from "i18next";
import intervalPlural from "i18next-intervalplural-postprocessor";
import { Gauge } from "prom-client";
import Config from "../../config/bot.config.js";
import type ApplicationCommand from "../classes/ApplicationCommand.js";
import ApplicationCommandHandler from "../classes/ApplicationCommandHandler.js";
import type AutoComplete from "../classes/AutoComplete.js";
import AutoCompleteHandler from "../classes/AutoCompleteHandler.js";
import type EventHandler from "../classes/EventHandler.js";
import LanguageHandler from "../classes/LanguageHandler.js";
import Logger from "../classes/Logger.js";
import metrics from "../classes/Metrics.js";
import type TextCommand from "../classes/TextCommand.js";
import TextCommandHandler from "../classes/TextCommandHandler.js";
import Functions from "../utilities/functions.js";

export default class ExtendedClient extends Client {
	/**
	 * An API instance to make using Discord's API much easier.
	 */
	public override readonly api: API;

	/**
	 * The configuration for our bot.
	 */
	public readonly config: typeof Config;

	/**
	 * The logger for our bot.
	 */
	public readonly logger: typeof Logger;

	/**
	 * The functions for our bot.
	 */
	public readonly functions: Functions;

	/**
	 * The i18n instance for our bot.
	 */
	public readonly i18n: typeof i18next;

	/**
	 * __dirname is not in our version of ECMA, this is a workaround.
	 */
	public readonly __dirname: string;

	/**
	 * Our Prisma client, this is an ORM to interact with our PostgreSQL instance.
	 */
	public readonly prisma: PrismaClient<{
		errorFormat: "pretty";
		log: (
			| {
					emit: "event";
					level: "query";
			  }
			| {
					emit: "stdout";
					level: "error";
			  }
			| {
					emit: "stdout";
					level: "warn";
			  }
		)[];
	}>;

	/**
	 * All of the different gauges we use for Metrics with Prometheus and Grafana.
	 */
	private readonly gauges = new Map<keyof typeof metrics, Gauge>();

	/**
	 * A map of guild ID to user ID, representing a guild and who owns it.
	 */
	public guildOwnersCache = new Map<string, string>();

	/**
	 * Guild channels cache.
	 */
	public readonly channelsCache: Map<string, string>;

	/**
	 * Guild roles cache.
	 */
	public guildRolesCache = new Map<string, Map<string, APIRole>>();

	/**
	 * Guild presence cache, representing a guild, and the presence of each user in the guild.
	 */
	public guildPresenceCache = new Map<string, Map<string, string>>();

	/**
	 * An approximation of how many users the bot can see.
	 */
	public approximateUserCount: number;

	/**
	 * The language handler for our bot.
	 */
	public readonly languageHandler: LanguageHandler;

	/**
	 * A map of events that our client is listening to.
	 */
	public events = new Map<keyof MappedEvents, EventHandler>();

	/**
	 * A map of the application commands that the bot is currently handling.
	 */
	public applicationCommands = new Map<string, ApplicationCommand>();

	/**
	 * The application command handler for our bot.
	 */
	public readonly applicationCommandHandler: ApplicationCommandHandler;

	/**
	 * A map of the auto completes that the bot is currently handling.
	 */
	public autoCompletes = new Map<string[], AutoComplete>();

	/**
	 * The auto complete handler for our bot.
	 */
	public readonly autoCompleteHandler: AutoCompleteHandler;

	/**
	 * A map of the text commands that the bot is currently handling.
	 */
	public readonly textCommands = new Map<string, TextCommand>();

	/**
	 * The text command handler for our bot.
	 */
	public readonly textCommandHandler: TextCommandHandler;

	/**
	 * A map of a guild ID to a set of user IDs, representing a guild and who is in a voice channel in the guild.
	 */
	public readonly usersInVoice = new Map<string, Set<string>>();

	/**
	 * A map of a guild ID to a Map of the required text for the string role to the role the user should receive.
	 */
	public readonly statusRolesCache = new Map<string, StatusRole[]>();

	public constructor({ rest, ws }: ClientOptions) {
		super({ rest, ws });

		this.api = new API(rest);

		this.channelsCache = new Map();

		this.config = Config;
		this.config.version =
			execSync("git rev-parse HEAD").toString().trim().slice(0, 7) + process.env.NODE_ENV === "development"
				? "dev"
				: "";

		this.logger = Logger;
		this.functions = new Functions(this);

		this.prisma = new PrismaClient({
			errorFormat: "pretty",
			log: [
				{
					level: "warn",
					emit: "stdout",
				},
				{
					level: "error",
					emit: "stdout",
				},
				{ level: "query", emit: "event" },
			],
		});

		for (const [key, gauge] of Object.entries(metrics)) {
			this.gauges.set(
				key as keyof typeof metrics,
				new Gauge({
					name: key,
					...gauge,
				}),
			);
		}

		this.approximateUserCount = 0;

		// I forget what this is even used for, but Vlad from https://github.com/vladfrangu/highlight uses it and recommended me to use it a while ago.
		if (process.env.NODE_ENV === "development") {
			this.prisma.$on("query", (event) => {
				try {
					const paramsArray = JSON.parse(event.params);
					const newQuery = event.query.replaceAll(/\$(?<captured>\d+)/g, (_, number) => {
						const value = paramsArray[Number(number) - 1];

						if (typeof value === "string") return `"${value}"`;
						else if (Array.isArray(value)) return `'${JSON.stringify(value)}'`;

						return String(value);
					});

					this.logger.debug("prisma:query", newQuery);
				} catch {
					this.logger.debug("prisma:query", event.query, "PARAMETERS", event.params);
				}
			});

			this.prisma.$use(async (params, next) => {
				const before = Date.now();
				// eslint-disable-next-line n/callback-return
				const result = await next(params);
				const after = Date.now();

				this.logger.debug("prisma:query", `${params.model}.${params.action} took ${String(after - before)}ms`);

				return result;
			});
		}

		this.i18n = i18next;

		this.__dirname = resolve();

		this.languageHandler = new LanguageHandler(this);

		this.applicationCommandHandler = new ApplicationCommandHandler(this);

		this.autoCompleteHandler = new AutoCompleteHandler(this);

		this.textCommandHandler = new TextCommandHandler(this);

		void this.loadEvents();
	}

	/**
	 * Start the client.
	 */
	public async start() {
		await this.i18n.use(intervalPlural).init({
			fallbackLng: "en-US",
			resources: {},
			fallbackNS: this.config.botName.toLowerCase().split(" ").join("_"),
			lng: "en-US",
		});
		await this.languageHandler.loadLanguages();
		await this.autoCompleteHandler.loadAutoCompletes();
		await this.applicationCommandHandler.loadApplicationCommands();
		await this.textCommandHandler.loadTextCommands();

		setInterval(async () => this.rewardUsersInVoice(), 1_000 * 60);

		const statusRoles = await this.prisma.statusRole.findMany({});

		for (const statusRole of statusRoles) {
			let roles = this.statusRolesCache.get(statusRole.guildId);

			if (!roles) {
				this.statusRolesCache.set(statusRole.guildId, []);
				roles = [];
			}

			roles.push(statusRole);
			this.statusRolesCache.set(statusRole.guildId, roles);
		}
	}

	/**
	 * Load all the events in the events directory.
	 */
	private async loadEvents() {
		for (const eventFileName of this.functions.getFiles(`${this.__dirname}/dist/src/bot/events`, ".js", true)) {
			const EventFile = await import(`../../src/bot/events/${eventFileName}`);

			const event = new EventFile.default(this) as EventHandler;

			event.listen();

			this.events.set(event.name, event);
		}
	}

	/**
	 * Submit a metric to prometheus.
	 *
	 * @param key The key of the metric to submit to.
	 * @param method The method to use to submit the metric.
	 * @param value The value to submit to the metric.
	 * @param labels The labels to submit to the metric.
	 */
	public submitMetric<K extends keyof typeof metrics>(
		key: K,
		method: "inc" | "set",
		value: number,
		labels: Partial<Record<(typeof metrics)[K]["labelNames"][number], string>>,
	) {
		const gauge = this.gauges.get(key);
		if (!gauge) return;

		gauge[method](labels, value);
	}

	/**
	 * Reward all users who are in a voice channel with some experience and increment the amount of minutes they've spent in a voice call this week.
	 */
	public async rewardUsersInVoice() {
		const experience = Number(Math.floor(Math.random() * (10 - 5) * 5)); //  Change the 1 at the end to change the multiplier.;
		const currentWeek = this.functions.getWeekOfYear();

		for (const [guildId, userIds] of this.usersInVoice) {
			if (!userIds.size) continue;

			this.submitMetric("users_in_voice", "set", userIds.size, { guildId: guildId.toString() });
			this.submitMetric("minutes_in_voice", "inc", userIds.size, { guildId: guildId.toString() });

			const [upsertedLevels] = await Promise.all([
				this.prisma.$transaction(
					[...userIds.values()].map((userId) =>
						this.prisma.userLevel.upsert({
							where: { userId_guildId: { userId, guildId } },
							create: { experience, guildId, userId, level: 0 },
							update: { experience: { increment: experience } },
						}),
					),
				),
				this.prisma
					.$transaction(
						[...userIds.values()].map((userId) =>
							this.prisma.weeklyActivity.findUnique({
								where: {
									userId_guildId_currentWeek: {
										guildId,
										userId,
										currentWeek,
									},
								},
							}),
						),
					)
					.then(async (userActivities) => {
						await this.prisma.$transaction(
							userActivities.filter(Boolean).map((userActivity) =>
								this.prisma.weeklyActivity.upsert({
									where: {
										userId_guildId_currentWeek: {
											guildId,
											userId: userActivity!.userId,
											currentWeek,
										},
									},
									create: {
										messages: 0,
										currentWeek,
										guildId,
										userId: userActivity!.userId,
										minutesInVoice: 1,
									},
									update: { minutesInVoice: { increment: 1 } },
								}),
							),
						);
					}),
			]);

			this.logger.info(`Rewarded ${upsertedLevels.length} users in guild ${guildId} with ${experience} experience.`);
		}
	}
}
