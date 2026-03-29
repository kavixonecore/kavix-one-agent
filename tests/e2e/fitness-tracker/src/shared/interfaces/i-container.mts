import type { MongoClient } from "mongodb";

export interface IContainer {
  db: MongoClient;
  repositories: Record<string, unknown>;
  services: Record<string, unknown>;
}
