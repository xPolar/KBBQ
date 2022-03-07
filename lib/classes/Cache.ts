import { Snowflake } from "discord.js";
import { UpdateOneModel, WithId } from "mongodb";
import { UserLevelDocument } from "../../typings";
import BetterClient from "../extensions/BetterClient";

export default class Cache {
    public readonly client: BetterClient;

    constructor(client: BetterClient) {
        this.client = client;
    }

    public async getLevelDocument(
        userId: Snowflake
    ): Promise<UserLevelDocument | null> {
        if (process.env.NODE_ENV === "production") {
            const cached = (await this.client.redis.get(userId)) as unknown;
            if (cached)
                return JSON.parse(cached as string) as UserLevelDocument;
        }
        const fetched = await this.client.mongo
            .db("users")
            .collection("levels")
            .findOne({ userId });
        if (process.env.NODE_ENV === "production")
            await this.client.redis.set(
                `${userId}.leveling`,
                JSON.stringify(fetched)
            );
        return (fetched as UserLevelDocument) || null;
    }

    public async updateLevelDocument(
        document: UpdateOneModel
    ): Promise<UserLevelDocument | null> {
        const updated = await this.client.mongo
            .db("users")
            .collection("levels")
            .findOneAndUpdate(document.filter, document.update, {
                upsert: true,
                returnDocument: "after"
            });
        if (updated.value && process.env.NODE_ENV === "production") {
            await this.client.redis.set(
                `${updated.value.userId}.leveling`,
                JSON.stringify(updated.value)
            );
            return updated.value as unknown as UserLevelDocument;
        }
        return (updated.value as UserLevelDocument) || null;
    }

    public async massUpdateLevelDocument(
        documents: Array<UpdateOneModel>
    ): Promise<Array<WithId<UserLevelDocument> | null>> {
        const updatedDocuments = documents.map(document =>
            this.client.mongo
                .db("users")
                .collection("levels")
                .findOneAndUpdate(document.filter, document.update, {
                    upsert: true,
                    returnDocument: "after"
                })
        );
        return Promise.all(
            (await Promise.all(updatedDocuments)).map(async document => {
                if (document.value && process.env.NODE_ENV === "production") {
                    await this.client.redis.set(
                        `${document.value.userId}.leveling`,
                        JSON.stringify(document.value)
                    );
                    return document.value as unknown as WithId<UserLevelDocument>;
                } else
                    return (
                        (document.value as unknown as WithId<UserLevelDocument>) ||
                        null
                    );
            })
        );
    }

    public async massGetLevelDocument(
        userIds: Array<Snowflake>
    ): Promise<Array<UserLevelDocument | null>> {
        return Promise.all(
            userIds.map(userId => this.getLevelDocument(userId))
        );
    }

    public async getAllLevelDocuments(sorted: boolean) {
        const fetched = await (
            await this.client.mongo
                .db("users")
                .collection("levels")
                .find({}, sorted ? { sort: { experience: -1 } } : {})
        ).toArray();
        if (process.env.NODE_ENV === "production")
            await Promise.all(
                fetched.map(document =>
                    this.client.redis.set(
                        `${document.userId}.leveling`,
                        JSON.stringify(document)
                    )
                )
            );
        return fetched;
    }
}
