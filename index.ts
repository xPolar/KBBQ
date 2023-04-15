import { MongoClient } from "mongodb";
import { PrismaClient } from "@prisma/client";

const client = new MongoClient("url");

const prisma = new PrismaClient();

const userLevels = await client.db("users").collection("levels").find({}).toArray();

console.log(userLevels.length);

await prisma.userLevel.createMany({
	data: userLevels.map((userLevel) => ({
		experience: userLevel.experience ?? 0,
		level: userLevel.level ?? 0,
		userId: userLevel.userId,
		guildId: "800213121822097459",
	})),
});

console.log("done");
