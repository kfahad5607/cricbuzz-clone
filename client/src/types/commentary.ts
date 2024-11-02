import { BALL_EVENTS_VALUES } from "../utils/constants";
import {
  BaseScorecardInnings,
  MatchResults,
  MatchResultsWithInfo,
  MatchState,
  MatchTossResults,
  MatchTossResultsWithInfo,
  SCORECARD_INNINGS_TYPES,
  ScorecardBatter,
  ScorecardBatterWithInfo,
  ScorecardBowler,
  ScorecardBowlerWithInfo,
  ScorecardInningsTypes,
} from "./matchData";
import { TeamMatchInfo } from "./matches";
import { BasicMatchSquadPlayer } from "./players";

// const
export const COMMENTARY_INNINGS_TYPES = [
  "preview",
  ...SCORECARD_INNINGS_TYPES,
] as const;

export type BallEvents = (typeof BALL_EVENTS_VALUES)[number];

export type CommentaryItem = {
  timestamp: number;
  overs: number;
  commText: string;
  events: BallEvents[];
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
  state: MatchState;
  status: string;
  tossResults?: MatchTossResults;
  results?: MatchResults;
};

export type CommentaryData = Omit<
  CommentaryDataRaw,
  | "batsmanStriker"
  | "batsmanNonStriker"
  | "bowlerStriker"
  | "bowlerNonStriker"
  | "innings"
  | "tossResults"
  | "results"
> & {
  batsmanStriker?: ScorecardBatterWithInfo;
  batsmanNonStriker?: ScorecardBatterWithInfo;
  bowlerStriker?: ScorecardBowlerWithInfo;
  bowlerNonStriker?: ScorecardBowlerWithInfo;
  tossResults?: MatchTossResultsWithInfo;
  results?: MatchResultsWithInfo;
} & {
  innings: (Omit<BaseScorecardInnings, "teamId"> & { team: TeamMatchInfo })[];
};

export type FullCommentaryDataRaw = {
  teamId: number;
  currentInnings: CommentaryInningsTypes;
  innings: {
    teamId: TeamMatchInfo["id"];
    batters: Pick<ScorecardBatter, "id">[];
    bowlers: Pick<ScorecardBatter, "id">[];
  }[];
  tossResults: MatchTossResults;
  commentaryList: CommentaryItem[];
};

export type CommentaryDataInnings =
  | {
      inningsType: (typeof COMMENTARY_INNINGS_TYPES)[0];
    }
  | {
      inningsType: ScorecardInningsTypes;
      teamInningsNo: number;
      team: TeamMatchInfo;
      batters: BasicMatchSquadPlayer[];
      bowlers: BasicMatchSquadPlayer[];
    };

export type FullCommentaryData = Omit<
  FullCommentaryDataRaw,
  "innings" | "tossResults"
> & {
  innings: CommentaryDataInnings[];
  tossResults: MatchTossResultsWithInfo;
};

export type HighlightsDataRaw = {
  teamId: number;
  currentInnings: ScorecardInningsTypes;
  innings: {
    teamId: TeamMatchInfo["id"];
  }[];
  commentaryList: CommentaryItem[];
};

export type HighlightsDataInnings = {
  inningsType: ScorecardInningsTypes;
  teamInningsNo: number;
  team: TeamMatchInfo;
};

export type HighlightsData = Omit<HighlightsDataRaw, "innings"> & {
  teamId: number;
  currentInnings: ScorecardInningsTypes;
  innings: HighlightsDataInnings[];
  commentaryList: CommentaryItem[];
};

export type CommentaryInningsTypes = (typeof COMMENTARY_INNINGS_TYPES)[number];
