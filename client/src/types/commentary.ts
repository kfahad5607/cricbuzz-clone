import { BALL_EVENTS, MATCH_STATES_VALUES } from "../utils/constants";
import {
  BaseScorecardInnings,
  CommentaryInningsType,
  MatchResults,
  MatchTossResults,
  SCORECARD_INNINGS_TYPES,
  ScorecardBatter,
  ScorecardBowler,
} from "./matchData";

// const
export const COMMENTARY_INNINGS_TYPES = [
  "preview",
  ...SCORECARD_INNINGS_TYPES,
] as const;

export type CommentaryItem = {
  timestamp: number;
  overs: number;
  commText: string;
  events: (typeof BALL_EVENTS)[number];
  batsmanStriker: Omit<ScorecardBatter, "isStriker">;
  bowlerStriker: Omit<ScorecardBowler, "isStriker" | "isNonStriker">;
};

export type CommentaryData = {
  commentaryList: CommentaryItem[];
  lastFetchedInnings: CommentaryInningsType;
  innings: BaseScorecardInnings[];
  batsmanStriker: ScorecardBatter;
  batsmanNonStriker?: ScorecardBatter;
  bowlerStriker: ScorecardBowler;
  bowlerNonStriker: ScorecardBowler;
  state: (typeof MATCH_STATES_VALUES)[number];
  status: string;
  tossResults: MatchTossResults;
  results: MatchResults;
};

export type ScorecardInningsType = (typeof SCORECARD_INNINGS_TYPES)[number];
