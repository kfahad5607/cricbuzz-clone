import {
  bigint,
  bigserial,
  jsonb,
  pgEnum,
  pgTable,
  smallint,
  smallserial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const matchFormatEnum = pgEnum("match_format", ["test", "odi", "t20"]);
export const matchTypeEnum = pgEnum("match_type", [
  "international",
  "league",
  "domestic",
]);

export const series = pgTable("series", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull().unique(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
});

export const matches = pgTable("matches", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  matchFormat: matchFormatEnum("match_format"),
  matchType: matchTypeEnum("match_type"),
  matchNumber: smallint("match_number"),
  homeTeam: bigint("home_team", { mode: "number" }).references(() => teams.id),
  awayTeam: bigint("away_team", { mode: "number" }).references(() => teams.id),
  series: bigint("series", { mode: "number" }).references(() => series.id),
  venue: smallint("venue").references(() => venues.id),
  startTime: timestamp("start_time", { precision: 3, withTimezone: true }),
});

export const innings = pgTable("innings", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  team: bigint("team", { mode: "number" }).references(() => teams.id),
});

export const venues = pgTable("venues", {
  id: smallserial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  city: varchar("city", { length: 100 }).notNull(),
  country: varchar("country", { length: 100 }).notNull(),
});

export const squads = pgTable("squads", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
});

export const teams = pgTable("teams", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  shortName: varchar("short_name", { length: 5 }).notNull(),
});

export const players = pgTable("players", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  name: varchar("name", { length: 100 }),
  shortName: varchar("short_name", { length: 50 }),
  slug: varchar("slug", { length: 100 }),
  team: bigint("team", { mode: "number" }).references(() => teams.id),
  roleInfo: jsonb("role_info"),
  personalInfo: jsonb("personal_info"),
});
