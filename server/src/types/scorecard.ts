import * as z from "zod";
import { DISMISSAL_TYPES_VALUES } from "../helpers/constants";

// const
export const INNINGS_TYPES = ["first", "second", "third", "fourth"] as const;

// schemas
const ScorecardBatterSchema = z.object({
  id: z.number().positive(),
  batRuns: z.number().nonnegative(),
  ballsPlayed: z.number().nonnegative(),
  dotBalls: z.number().nonnegative().default(0),
  batFours: z.number().nonnegative().default(0),
  batSixes: z.number().nonnegative().default(0),
  isStriker: z.boolean().optional(),
});

const fallOfWicketSchema = z.object({
  dismissalType: z.enum(DISMISSAL_TYPES_VALUES),
  overs: z.number().nonnegative(),
  teamScore: z.number().nonnegative(),
  teamWickets: z.number().nonnegative(),
  bowlerId: z.number().positive().optional(),
  helpers: z.array(z.number().positive()).max(2).default([]),
});

export const ScorecardBatter = ScorecardBatterSchema.extend({
  fallOfWicket: fallOfWicketSchema.optional(),
});

const ScorecardBowlerSchema = z.object({
  id: z.number().positive(),
  bowlOvers: z.number().nonnegative(),
  bowlMaidens: z.number().nonnegative().default(0),
  bowlRuns: z.number().nonnegative(),
  bowlWickets: z.number().nonnegative().default(0),
  bowlWides: z.number().nonnegative().default(0),
  bowlNoBalls: z.number().nonnegative().default(0),
});

export const ScorecardBowler = ScorecardBowlerSchema;

const extraBall = z.object({
  nos: z.number().nonnegative().default(0),
  wides: z.number().nonnegative().default(0),
  legByes: z.number().nonnegative().default(0),
  byes: z.number().nonnegative().default(0),
  penalties: z.number().nonnegative().default(0),
});

export const BaseScorecardInnings = z.object({
  teamId: z.number().positive(),
  overs: z.number().nonnegative().default(0),
  oversBowled: z.number().nonnegative().default(0),
  score: z.number().nonnegative().default(0),
  wickets: z.number().nonnegative().default(0),
  isDeclared: z.boolean().optional(),
  isFollowOn: z.boolean().optional(),
  extras: extraBall,
});

export const ScorecardInnings = BaseScorecardInnings.extend({
  batters: z.array(ScorecardBatter),
  bowlers: z.array(ScorecardBowler),
});

export const Scorecard = z.object({
  matchId: z.number().positive(),
  innings: z.object({
    first: ScorecardInnings.optional(),
    second: ScorecardInnings.optional(),
    third: ScorecardInnings.optional(),
    fourth: ScorecardInnings.optional(),
  }),
});

export const ScorecardInningsEntry = BaseScorecardInnings.extend({
  batsmanStriker: ScorecardBatter,
  batsmanNonStriker: ScorecardBatter.optional(),
  bowlerStriker: ScorecardBowlerSchema,
  bowlerNonStriker: ScorecardBowlerSchema.optional(),
  extras: extraBall,
});

export const InningsType = z.enum(INNINGS_TYPES);

// infered types
export type Scorecard = z.infer<typeof Scorecard>;
export type ScorecardBatter = z.infer<typeof ScorecardBatter>;
export type ScorecardBowler = z.infer<typeof ScorecardBowler>;
export type ScorecardInningsEntry = z.infer<typeof ScorecardInningsEntry>;
export type BaseScorecardInnings = z.infer<typeof BaseScorecardInnings>;
export type ScorecardInnings = z.infer<typeof ScorecardInnings>;
export type InningsType = z.infer<typeof InningsType>;

// manual types
export type BaseScorecardKeys = keyof BaseScorecardInnings;
export type BatterHolderKeys = keyof Pick<
  ScorecardInningsEntry,
  "batsmanStriker" | "batsmanNonStriker"
>;

export type BowlerHolderKeys = keyof Pick<
  ScorecardInningsEntry,
  "bowlerStriker" | "bowlerNonStriker"
>;

export type BatterKeys = keyof ScorecardBatter;
export type BowlerKeys = keyof ScorecardBowler;
