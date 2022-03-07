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
        const fetched = await this.client.mongo
            .db("users")
            .collection("levels")
            .findOne({ userId });
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
        return (
            await this.client.mongo
                .db("users")
                .collection("levels")
                .find({}, sorted ? { sort: { experience: -1 } } : {})
        ).toArray();
    }
}
