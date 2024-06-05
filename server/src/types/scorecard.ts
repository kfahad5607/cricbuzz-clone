import * as z from "zod";
import { DISMISSAL_TYPES_VALUES } from "../helpers/constants";

const scorecardBatterSchema = z.object({
  batterId: z.number().positive(),
  batRuns: z.number().nonnegative(),
  ballsPlayed: z.number().nonnegative(),
  dotBalls: z.number().nonnegative().default(0),
  batFours: z.number().nonnegative().default(0),
  batSixes: z.number().nonnegative().default(0),
});

const scorecardBatter = scorecardBatterSchema.extend({
  fallOfWicket: z.object({
    dismissalType: z.enum(DISMISSAL_TYPES_VALUES),
    ballNum: z.number().nonnegative(),
    teamScoreLine: z.string(),
    bowlerId: z.number().positive(),
    helpers: z.array(z.number().positive()),
  }),
});

const scorecardBowlerSchema = z.object({
  bowlerId: z.number().positive(),
  bowlOvers: z.number().nonnegative(),
  bowlMaidens: z.number().nonnegative().default(0),
  bowlRuns: z.number().nonnegative(),
  bowlWickets: z.number().nonnegative().default(0),
  bowlWides: z.number().nonnegative().default(0),
  bowlNoBalls: z.number().nonnegative().default(0),
});

const scorecardBowler = scorecardBowlerSchema;

const extraBall = z.object({
  nos: z.number().nonnegative().default(0),
  wides: z.number().nonnegative().default(0),
  legByes: z.number().nonnegative().default(0),
  byes: z.number().nonnegative().default(0),
  penalties: z.number().nonnegative().default(0),
});

const ScorecardInningsSchema = z.object({
  teamId: z.number().positive(),
  inningsId: z.number().min(1).max(4),
  overs: z.number().nonnegative().default(0),
  oversBowled: z.number().nonnegative().default(0),
  score: z.number().nonnegative().default(0),
  wickets: z.number().nonnegative().default(0),
  isDeclared: z.boolean().optional(),
  isFollowOn: z.boolean().optional(),
});

export const ScorecardInnings = ScorecardInningsSchema.extend({
  batters: z.array(scorecardBatter),
  bowlers: z.array(scorecardBowler),
  extras: extraBall,
});

export const Scorecard = z.object({
  innings: z.array(ScorecardInnings),
});

export const ScorecardInningsEntry = ScorecardInningsSchema.extend({
  batsmanStriker: scorecardBatterSchema,
  batsmanNonStriker: scorecardBatterSchema.optional(),
  bowlerStriker: scorecardBowlerSchema,
  bowlerNonStriker: scorecardBowlerSchema.optional(),
});

// infered types
export type ScorecardInningsEntry = z.infer<typeof ScorecardInningsEntry>;
export type ScorecardInnings = z.infer<typeof ScorecardInnings>;
