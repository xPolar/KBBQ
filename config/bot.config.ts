import { Intents, PermissionString, PresenceData } from "discord.js";

export default {
    prefix: process.env.NODE_ENV === "production" ? "k!" : "k!!",
    botName: "kbbq",

    version: "1.0.0",
    admins: ["619284841187246090", "665303663148924968"],

    presence: {
        status: "online",
        activities: [
            {
                type: "WATCHING",
                name: "people talk 👀"
            }
        ]
    } as PresenceData,

    hastebin: "https://h.inv.wtf",

    colors: {
        primary: "ffffff",
        success: "57F287",
        warning: "FEE75C",
        error: "ED4245"
    },

    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES
    ],

    requiredPermissions: [
        "EMBED_LINKS",
        "SEND_MESSAGES",
        "USE_EXTERNAL_EMOJIS"
    ] as PermissionString[],

    dataDog: {
        apiKey: process.env.DATADOG_API_KEY,
        baseURL: "https://app.datadoghq.com/api/v1/"
    },

    otherConfig: {
        levelRoles: {
            15: "846146319051522049",
            30: "846146457714950174",
            45: "846146513281220609",
            60: "846146566079512646",
            75: "846146608885137450",
            90: "846146645518188576",
            105: "846146731145429003",
            120: "846146731145429003"
        }
    }
};
