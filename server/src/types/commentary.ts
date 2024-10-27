import * as z from "zod";
import { BALL_EVENTS } from "../db/mongo/constants";
import {
  SCORECARD_INNINGS_TYPES,
  ScorecardBatterSchema,
  ScorecardBowlerSchema,
  ScorecardInningsEntry,
} from "./matchData";
import { batterHolderKeysEnum } from "../helpers/matchData";

// const
export const COMMENTARY_INNINGS_TYPES = [
  "preview",
  ...SCORECARD_INNINGS_TYPES,
] as const;

// schemas
const CommentaryBatterSchema = ScorecardBatterSchema.omit({
  isStriker: true,
});

const CommentaryBowlerSchema = ScorecardBowlerSchema;

// do we need to store the complete players object or just the ID will suffice
export const CommentaryItem = z.object({
  timestamp: z.coerce.number(),
  overs: z.coerce.number().nonnegative(),
  commText: z.string(),
  events: z.array(z.enum(BALL_EVENTS)),
  batsmanStriker: CommentaryBatterSchema.optional(),
  bowlerStriker: CommentaryBowlerSchema.optional(),
});

export const CommentaryInnings = z.object({
  teamId: z.coerce.number().positive(),
  commentaryList: z.array(CommentaryItem),
});

export const Commentary = z.object({
  matchId: z.coerce.number().positive(),
  innings: z.array(CommentaryInnings),
});

export const CommentaryInningsEntry = z.object({
  commText: z.string().min(1),
  events: z.array(z.enum(BALL_EVENTS)),
  // ballStrikerKey: batterHolderKeysEnum,
  scorecard: ScorecardInningsEntry.optional(),
});

export const CommentaryInningsType = z.enum(COMMENTARY_INNINGS_TYPES);

// Inferred types
export type CommentaryItem = z.infer<typeof CommentaryItem>;
export type CommentaryInnings = z.infer<typeof CommentaryInnings>;
export type Commentary = z.infer<typeof Commentary>;
export type CommentaryInningsEntry = z.infer<typeof CommentaryInningsEntry>;
export type CommentaryInningsType = z.infer<typeof CommentaryInningsType>;
