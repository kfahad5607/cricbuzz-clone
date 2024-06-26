import { BALL_EVENTS } from "../utils/constants";
import {
  BaseScorecardInnings,
  ScorecardBatter,
  ScorecardBowler,
} from "./scorecard";

type MatchCommentaryItem = {
  timestamp: number;
  overs: number;
  commText: string;
  events: (typeof BALL_EVENTS)[number];
  batsmanStriker: Omit<ScorecardBatter, "isStriker">;
  bowlerStriker: Omit<ScorecardBowler, "isStriker" | "isNonStriker">;
};

export type CommentaryData = {
  commentaryList: MatchCommentaryItem[];
  innings: BaseScorecardInnings[];
  batsmanStriker: ScorecardBatter;
  batsmanNonStriker?: ScorecardBatter;
  bowlerStriker: ScorecardBowler;
  bowlerNonStriker: ScorecardBowler;
};
