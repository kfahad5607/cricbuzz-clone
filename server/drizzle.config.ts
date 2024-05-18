import { defineConfig } from "drizzle-kit";
import config from "./src/config";

export default defineConfig({
  schema: "./src/db/postgres/schema",
  out: "./src/db/postgres/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: config.POSTGRES_DB_URL,
  },
  verbose: true,
  strict: true,
});
