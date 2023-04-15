import process from "node:process";
import { REST } from "@discordjs/rest";
import { CompressionMethod, WebSocketManager, WebSocketShardEvents, WorkerShardingStrategy } from "@discordjs/ws";
import { load } from "dotenv-extended";
import botConfig from "../config/bot.config.js";
import Logger from "../lib/classes/Logger.js";
import Server from "../lib/classes/Server.js";
import ExtendedClient from "../lib/extensions/ExtendedClient.js";

load({
	path: process.env.NODE_ENV === "production" ? ".env.prod" : ".env.dev",
});

// Create REST and WebSocket managers directly.
const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);
const ws = new WebSocketManager({
	token: process.env.DISCORD_TOKEN,
	intents: botConfig.intents,
	initialPresence: botConfig.presence,
	compression: CompressionMethod.ZlibStream,
	rest,
	// This will cause 2 workers to spawn, 3 shards per worker.
	// "each shard gets its own bubble which handles decoding, heartbeats, etc. And your main thread just gets the final result" - Vlad.
	buildStrategy: (manager) => new WorkerShardingStrategy(manager, { shardsPerWorker: 3 }),
});

await new Server(Number.parseInt(process.env.FASTIFY_PORT, 10)).start();

const client = new ExtendedClient({ rest, ws });
await client.start();

client.ws.on(WebSocketShardEvents.HeartbeatComplete, ({ latency, shardId }) =>
	client.submitMetric("latency", "set", latency, { shard: shardId.toString() }),
);

await ws.connect().then(async () => {
	await client.applicationCommandHandler.registerApplicationCommands();
	Logger.info("All shards have started.");
});

if (process.env.NODE_ENV === "development") {
	ws.on(WebSocketShardEvents.Debug, (data) => {
		Logger.debug(`[SHARD ${data.shardId}] ${data.message}`);
	});

	ws.on(WebSocketShardEvents.Ready, (data) => {
		Logger.debug(`[SHARD ${data.shardId}] Ready`);
	});
}
