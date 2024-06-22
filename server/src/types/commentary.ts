import * as z from "zod";
import { BALL_EVENTS } from "../db/mongo/constants";
import {
  SCORECARD_INNINGS_TYPES,
  ScorecardBatterSchema,
  ScorecardInningsEntry,
} from "./scorecard";
import { batterHolderKeysEnum } from "../helpers/scorecard";

// const
export const COMMENTARY_INNINGS_TYPES = [
  "preview",
  ...SCORECARD_INNINGS_TYPES,
] as const;

// schemas
const CommentaryBatterSchema = ScorecardBatterSchema.omit({
  isStriker: true,
});

const CommentaryBowlerSchema = ScorecardBatterSchema;

export const CommentaryItem = z.object({
  timestamp: z.number(),
  overs: z.number().nonnegative(),
  commText: z.string(),
  events: z.enum(BALL_EVENTS),
  batsmanStriker: CommentaryBatterSchema,
  bowlerStriker: CommentaryBowlerSchema,
});

export const CommentaryInnings = z.object({
  teamId: z.number().positive(),
  commentaryList: z.array(CommentaryItem),
});

export const Commentary = z.object({
  matchId: z.number().positive(),
  innings: z.array(CommentaryInnings),
});

export const CommentaryInningsEntry = z.object({
  commText: z.string().min(1),
  events: z.array(z.enum(BALL_EVENTS)),
  ballStrikerKey: batterHolderKeysEnum,
  scorecard: ScorecardInningsEntry,
});

export const CommentaryInningsType = z.enum(COMMENTARY_INNINGS_TYPES);

// Inferred types
export type CommentaryItem = z.infer<typeof CommentaryItem>;
export type CommentaryInnings = z.infer<typeof CommentaryInnings>;
export type Commentary = z.infer<typeof Commentary>;
export type CommentaryInningsEntry = z.infer<typeof CommentaryInningsEntry>;
export type CommentaryInningsType = z.infer<typeof CommentaryInningsType>;
