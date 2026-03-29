import { MongoClient } from "mongodb";

import { createLogger } from "../logger/logger.mjs";

import type { ITraceEntry } from "../core/interfaces/index.mjs";

const logger = createLogger("trace-writer-mongo");

const COLLECTION_NAME = "agent-one-traces";

/**
 * Writes an ITraceEntry to the MongoDB agent-one-traces collection.
 * @param connectionString - MongoDB connection URI.
 * @param dbName - Name of the database to write to.
 * @param entry - The trace entry to persist.
 * @returns The inserted document ID as a string.
 */
export async function writeTraceToMongo(
  connectionString: string,
  dbName: string,
  entry: ITraceEntry
): Promise<string> {
  const client = new MongoClient(connectionString);

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(COLLECTION_NAME);

    const result = await collection.insertOne({ ...entry });
    const id = result.insertedId.toString();

    logger.info("Trace written to MongoDB", { id, traceId: entry.traceId });
    return id;
  } finally {
    await client.close();
  }
}

/**
 * Retrieves trace entries from the MongoDB collection.
 * @param connectionString - MongoDB connection URI.
 * @param dbName - Name of the database to query.
 * @param sessionId - Optional session ID to filter by.
 * @returns Array of ITraceEntry documents.
 */
export async function getTraces(
  connectionString: string,
  dbName: string,
  sessionId?: string
): Promise<ITraceEntry[]> {
  const client = new MongoClient(connectionString);

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection<ITraceEntry>(COLLECTION_NAME);

    const filter = sessionId ? { sessionId } : {};
    const documents = await collection.find(filter)
.toArray();

    logger.info("Fetched traces from MongoDB", { count: documents.length, sessionId });

    // Strip MongoDB _id field from each document
    return documents.map((doc) => {

      const { _id, ...entry } = doc;
      return entry as ITraceEntry;
    });
  } finally {
    await client.close();
  }
}
