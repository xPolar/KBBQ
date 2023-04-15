declare global {
	namespace NodeJS {
		interface ProcessEnv {
			APPLICATION_ID: string;
			CONSOLE_HOOK: string;
			DATABASE_URL: string;
			DATADOG_API_KEY: string;
			DEVELOPMENT_GUILD_ID: string;
			DISCORD_TOKEN: string;
			FASTIFY_PORT: string;
			GUILD_HOOK: string;
			NODE_ENV: "development" | "production";
			PROMETHEUS_AUTH: string;
			SENTRY_DSN: string;
		}
	}
}

export {};
