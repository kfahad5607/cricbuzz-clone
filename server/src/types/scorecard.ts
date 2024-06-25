import * as z from "zod";
import { DISMISSAL_TYPES_VALUES } from "../helpers/constants";

// const
export const SCORECARD_INNINGS_TYPES = [
  "first",
  "second",
  "third",
  "fourth",
] as const;

// schemas
export const ScorecardBatterSchema = z.object({
  id: z.coerce.number().nonnegative(),
  batRuns: z.coerce.number().nonnegative(),
  ballsPlayed: z.coerce.number().nonnegative(),
  dotBalls: z.coerce.number().nonnegative().default(0),
  batFours: z.coerce.number().nonnegative().default(0),
  batSixes: z.coerce.number().nonnegative().default(0),
  isStriker: z.boolean().optional(),
});

const fallOfWicketSchema = z.object({
  dismissalType: z.enum(DISMISSAL_TYPES_VALUES),
  overs: z.coerce.number().nonnegative(),
  teamScore: z.coerce.number().nonnegative(),
  teamWickets: z.coerce.number().nonnegative(),
  bowlerId: z.coerce.number().positive().optional(),
  helpers: z.array(z.coerce.number().positive()).max(2).default([]),
});

export const ScorecardBatter = ScorecardBatterSchema.extend({
  fallOfWicket: fallOfWicketSchema.optional(),
});

export const ScorecardBowlerSchema = z.object({
  id: z.coerce.number().nonnegative(),
  bowlOvers: z.coerce.number().nonnegative(),
  bowlMaidens: z.coerce.number().nonnegative().default(0),
  bowlRuns: z.coerce.number().nonnegative(),
  bowlWickets: z.coerce.number().nonnegative().default(0),
  bowlWides: z.coerce.number().nonnegative().default(0),
  bowlNoBalls: z.coerce.number().nonnegative().default(0),
  isStriker: z.boolean().optional(),
  isNonStriker: z.boolean().optional(),
});

export const ScorecardBowler = ScorecardBowlerSchema;

const extraBall = z.object({
  nos: z.coerce.number().nonnegative().default(0),
  wides: z.coerce.number().nonnegative().default(0),
  legByes: z.coerce.number().nonnegative().default(0),
  byes: z.coerce.number().nonnegative().default(0),
  penalties: z.coerce.number().nonnegative().default(0),
});

export const BaseScorecardInnings = z.object({
  teamId: z.coerce.number().positive(),
  overs: z.coerce.number().nonnegative().default(0),
  oversBowled: z.coerce.number().nonnegative().default(0),
  score: z.coerce.number().nonnegative().default(0),
  wickets: z.coerce.number().nonnegative().default(0),
  isDeclared: z.boolean().optional(),
  isFollowOn: z.boolean().optional(),
  extras: extraBall,
});

export const ScorecardInnings = BaseScorecardInnings.extend({
  batters: z.array(ScorecardBatter),
  bowlers: z.array(ScorecardBowler),
});

export const Scorecard = z.object({
  matchId: z.coerce.number().positive(),
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

export const ScorecardInningsType = z.enum(SCORECARD_INNINGS_TYPES);

// infered types
export type Scorecard = z.infer<typeof Scorecard>;
export type ScorecardBatter = z.infer<typeof ScorecardBatter>;
export type ScorecardBowler = z.infer<typeof ScorecardBowler>;
export type ScorecardInningsEntry = z.infer<typeof ScorecardInningsEntry>;
export type BaseScorecardInnings = z.infer<typeof BaseScorecardInnings>;
export type ScorecardInnings = z.infer<typeof ScorecardInnings>;
// export type InningsType = z.infer<typeof InningsType>;
export type ScorecardInningsType = z.infer<typeof ScorecardInningsType>;

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
