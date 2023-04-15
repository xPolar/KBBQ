import type {
	APIApplicationCommandInteractionDataBooleanOption,
	APIApplicationCommandInteractionDataIntegerOption,
	APIApplicationCommandInteractionDataMentionableOption,
	APIApplicationCommandInteractionDataNumberOption,
	APIApplicationCommandInteractionDataStringOption,
	APIApplicationCommandInteractionDataSubcommandGroupOption,
	APIApplicationCommandInteractionDataSubcommandOption,
	APIAttachment,
	APIInteractionDataResolvedChannel,
	APIInteractionDataResolvedGuildMember,
	APIRole,
	APIUser,
} from "@discordjs/core";

export interface InteractionArguments {
	attachments?: Record<string, APIAttachment>;
	booleans?: Record<string, APIApplicationCommandInteractionDataBooleanOption>;
	channels?: Record<string, APIInteractionDataResolvedChannel>;
	integers?: Record<string, APIApplicationCommandInteractionDataIntegerOption>;
	members?: Record<string, APIInteractionDataResolvedGuildMember>;
	mentionables?: Record<string, APIApplicationCommandInteractionDataMentionableOption>;
	numbers?: Record<string, APIApplicationCommandInteractionDataNumberOption>;
	roles?: Record<string, APIRole>;
	strings?: Record<string, APIApplicationCommandInteractionDataStringOption>;
	subCommand?: APIApplicationCommandInteractionDataSubcommandOption;
	subCommandGroup?: APIApplicationCommandInteractionDataSubcommandGroupOption;
	users?: Record<string, APIUser>;
}

export type APIInteractionWithArguments<T> = T & {
	arguments: InteractionArguments;
};
