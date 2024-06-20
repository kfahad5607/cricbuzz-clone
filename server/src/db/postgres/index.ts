import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import config from "../../config";

// for migrations
export const client = postgres(config.POSTGRES_DB_URL);

export const db = drizzle(client, {
  schema,
  logger: true,
});
