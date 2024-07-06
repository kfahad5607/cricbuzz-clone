import { BALL_EVENTS, MATCH_STATES_VALUES } from "../utils/constants";
import {
  BaseScorecardInnings,
  MatchResults,
  MatchTossResults,
  SCORECARD_INNINGS_TYPES,
  ScorecardBatter,
  ScorecardBatterWithName,
  ScorecardBowler,
  ScorecardBowlerWithName,
} from "./matchData";
import { TeamMatchInfo } from "./matches";

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

export type CommentaryDataRaw = {
  commentaryList: CommentaryItem[];
  lastFetchedInnings: CommentaryInningsTypes;
  hasMore: boolean;
  innings: BaseScorecardInnings[];
  batsmanStriker?: ScorecardBatter;
  batsmanNonStriker?: ScorecardBatter;
  bowlerStriker?: ScorecardBowler;
  bowlerNonStriker?: ScorecardBowler;
  state: (typeof MATCH_STATES_VALUES)[number];
  status: string;
  tossResults: MatchTossResults;
  results: MatchResults;
};

export type CommentaryData = Omit<
  CommentaryDataRaw,
  | "batsmanStriker"
  | "batsmanNonStriker"
  | "bowlerStriker"
  | "bowlerNonStriker"
  | "innings"
> & {
  batsmanStriker?: ScorecardBatterWithName;
  batsmanNonStriker?: ScorecardBatterWithName;
  bowlerStriker?: ScorecardBowlerWithName;
  bowlerNonStriker?: ScorecardBowlerWithName;
} & {
  innings: (Omit<BaseScorecardInnings, "teamId"> & { team: TeamMatchInfo })[];
};

export type CommentaryInningsTypes = (typeof COMMENTARY_INNINGS_TYPES)[number];
