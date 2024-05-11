import { bigserial, pgTable, varchar } from "drizzle-orm/pg-core";

export const matches = pgTable("matches", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  title: varchar("title", { length: 255 }),
});
