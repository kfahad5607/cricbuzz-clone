import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/postgres/schema.ts",
  out: "./src/db/postgres/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DB_URL as string,
  },
  verbose: true,
  strict: true,
});
