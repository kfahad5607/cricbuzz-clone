import { relations } from "drizzle-orm";
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
import {
  MATCH_FORMATS_VALUES,
  MATCH_STATES,
  MATCH_STATES_VALUES,
  MATCH_TYPES_VALUES,
} from "../../../helpers/constants";
import {
  MatchResults,
  MatchTossResults,
  PersonalInfo,
  RoleInfo,
} from "../../../types";

export const matchFormatEnum = pgEnum("matchFormat", MATCH_FORMATS_VALUES);

export const matchTypeEnum = pgEnum("matchType", MATCH_TYPES_VALUES);

export const matchStateEnum = pgEnum("matchState", MATCH_STATES_VALUES);

export const series = pgTable("series", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull().unique(),
  description: varchar("description", { length: 150 }).notNull(),
});

export const matches = pgTable("matches", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  description: varchar("description", { length: 200 }).notNull(),
  matchFormat: matchFormatEnum("match_format").notNull(),
  matchType: matchTypeEnum("match_type").notNull(),
  matchNumber: smallint("match_number").default(1).notNull(),
  homeTeam: bigint("home_team", { mode: "number" })
    .references(() => teams.id)
    .notNull(),
  awayTeam: bigint("away_team", { mode: "number" })
    .references(() => teams.id)
    .notNull(),
  series: bigint("series", { mode: "number" })
    .references(() => series.id)
    .notNull(),
  venue: smallint("venue")
    .references(() => venues.id)
    .notNull(),
  startTime: timestamp("start_time", {
    precision: 3,
    withTimezone: true,
    mode: "date",
  }).notNull(),
  state: matchStateEnum("match_state").notNull().default(MATCH_STATES.PREVIEW),
  status: varchar("status", { length: 200 }).default("").notNull(),
  tossResults: jsonb("toss_results")
    .$type<MatchTossResults>()
    .default({})
    .notNull(),
  results: jsonb("results")
    .$type<MatchResults>()
    .default({ winByInnings: false, winByRuns: false })
    .notNull(),
});

export const innings = pgTable("innings", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  team: bigint("team", { mode: "number" }).references(() => teams.id),
});

export const venues = pgTable("venues", {
  id: smallserial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  country: varchar("country", { length: 100 }).notNull(),
});

export const squads = pgTable("squads", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
});

export const teams = pgTable("teams", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  shortName: varchar("short_name", { length: 5 }).notNull(),
});

export const players = pgTable("players", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  shortName: varchar("short_name", { length: 50 }).notNull(),
  team: bigint("team", { mode: "number" })
    .references(() => teams.id)
    .notNull(),
  roleInfo: jsonb("role_info").$type<RoleInfo>().notNull(),
  personalInfo: jsonb("personal_info").$type<PersonalInfo>().notNull(),
});

// relations
export const matchesRelations = relations(matches, ({ one }) => ({
  series: one(series, {
    fields: [matches.series],
    references: [series.id],
  }),
  venue: one(venues, {
    fields: [matches.venue],
    references: [venues.id],
  }),
  homeTeam: one(teams, {
    fields: [matches.homeTeam],
    references: [teams.id],
    relationName: "homeTeam",
  }),
  awayTeam: one(teams, {
    fields: [matches.awayTeam],
    references: [teams.id],
    relationName: "awayTeam",
  }),
}));

export const venuesRelations = relations(venues, ({ many }) => ({
  matches: many(matches),
}));

export const seriesRelations = relations(series, ({ many }) => ({
  matches: many(matches),
}));

export const teamsRelations = relations(teams, ({ many }) => ({
  homeTeam: many(matches, { relationName: "homeTeam" }),
  awayTeam: many(matches, { relationName: "awayTeam" }),
}));
