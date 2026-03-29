import { MongoClient } from "mongodb";
import { logger } from "./logger.mjs";

let client: MongoClient | null = null;

export const getMongoClient = async (): Promise<MongoClient> => {
  if (client) {
    return client;
  }

  const uri = process.env["MONGODB_URI"];
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not set");
  }

  client = new MongoClient(uri);
  await client.connect();
  logger.info("Connected to MongoDB");

  return client;
};

export const closeMongoClient = async (): Promise<void> => {
  if (client) {
    await client.close();
    client = null;
    logger.info("MongoDB connection closed");
  }
};
