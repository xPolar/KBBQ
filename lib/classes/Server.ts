import process from "node:process";
import type { FastifyInstance } from "fastify";
import { fastify } from "fastify";
import fastifyMetricsPlugin from "fastify-metrics";
import { register } from "prom-client";
import Logger from "./Logger.js";

export default class Server {
	/**
	 * The port the server should run on.
	 */
	private readonly port: number;

	/**
	 * Our Fastify instance.
	 */
	private readonly router: FastifyInstance;

	/**
	 * Create our Fastify server.
	 *
	 * @param port The port the server should run on.
	 */
	public constructor(port: number) {
		this.port = port;

		this.router = fastify({ logger: false, trustProxy: 1 });
	}

	/**
	 * Start the server.
	 */
	public async start() {
		await this.router.register(fastifyMetricsPlugin, {
			defaultMetrics: {
				enabled: false,
				register,
			},
			endpoint: null,
		});

		this.registerRoutes();

		// eslint-disable-next-line promise/prefer-await-to-callbacks
		this.router.listen({ port: this.port, host: "0.0.0.0" }, (error, address) => {
			if (error) {
				Logger.error(error);
				Logger.sentry.captureException(error);

				process.exit(1);
			}

			Logger.info(`Fastify server started, listening on ${address}.`);
		});
	}

	/**
	 * Register our routes.
	 */
	private registerRoutes() {
		this.router.get("/ping", (_, response) => response.send("PONG!"));

		this.router.get("/metrics", async (request, response) => {
			if (request.headers.authorization?.replace("Bearer ", "") !== process.env.PROMETHEUS_AUTH)
				return response.status(401).send("Invalid authorization token.");

			const metrics = await register.metrics();

			return response.send(metrics);
		});

		this.router.get("/", (_, response) => response.redirect("https://polar.blue"));
	}
}
