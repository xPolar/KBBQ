import type { LocaleString } from "@discordjs/core";
import type { TOptions } from "i18next";
import type { LanguageValues } from "../../typings/language.js";
import type ExtendedClient from "../extensions/ExtendedClient.js";
import type { LanguageOptions, LanguageKeys } from "./Language.js";
import Language from "./Language.js";

export default class LanguageHandler {
	/**
	 * Our extended client
	 */
	public readonly client: ExtendedClient;

	/**
	 * A set containing all of our languages.
	 */
	public languages = new Set<Language>();

	/**
	 * The default language to resort to.
	 */
	public defaultLanguage: Language | null;

	/**
	 * Create our LanguageHandler class.
	 *
	 * @param client Our client.
	 */
	public constructor(client: ExtendedClient) {
		this.client = client;

		this.defaultLanguage = null;
	}

	/**
	 * Load all of our languages into our array.
	 */
	public async loadLanguages() {
		for (const fileName of this.client.functions.getFiles(`${this.client.__dirname}/dist/languages/`, ".json")) {
			const languageFile: LanguageOptions = await import(`../../languages/${fileName}`, {
				assert: { type: "json" },
			}).then((file) => file.default);

			const language: Language = new Language(this.client, languageFile.LANGUAGE_ID! as LocaleString, {
				enabled: languageFile.LANGUAGE_ENABLED!,
				language: languageFile,
			});

			this.languages.add(language);
			language.init();
		}

		this.defaultLanguage = this.enabledLanguages.find((language) => language.id === "en-US")!;
	}

	/**
	 * Get all enabled languages.
	 */
	public get enabledLanguages() {
		return [...this.languages].filter((language) => language.enabled);
	}

	/**
	 * Get a language with a given ID.
	 *
	 * @param languageId The language id to get.
	 * @returns The language with the given id.
	 */
	public getLanguage(languageId?: string) {
		if (!this.defaultLanguage)
			this.defaultLanguage = this.enabledLanguages.find((language) => language.id === "en-US")!;

		return this.enabledLanguages.find((language) => language.id === languageId) ?? this.defaultLanguage;
	}

	/**
	 * Translate a key to all enabled languages.
	 *
	 * @param key The key to translate.
	 * @param args The arguments for the key.
	 * @returns The translated keys.
	 */
	public getFromAllLanguages<K extends LanguageKeys, O extends LanguageValues[K]>(key: K, args?: O & TOptions) {
		if (args && !("interpolation" in args)) args.interpolation = { escapeValue: false };

		const defaultResponse = this.defaultLanguage?.get(key, args);

		return this.enabledLanguages
			.map((language) => ({
				id: language.id,
				value: language.get(key, args),
			}))
			.filter((response) => response.value !== defaultResponse)
			.reduce((newObject: Record<string, string>, initialObject) => {
				newObject[initialObject.id] = initialObject.value;

				return newObject;
			}, {});
	}
}
