import * as z from "zod";
import { BALL_EVENTS } from "../db/mongo/constants";
import { ScorecardInningsEntry } from "./scorecard";
import { batterHolderKeysEnum } from "../helpers/scorecard";

export const CommentaryInningsEntry = z.object({
  commText: z.string().min(1),
  events: z.array(z.enum(BALL_EVENTS)),
  ballStrikerKey: batterHolderKeysEnum,
  scorecard: ScorecardInningsEntry,
});

// Inferred types
export type CommentaryInningsEntry = z.infer<typeof CommentaryInningsEntry>;
