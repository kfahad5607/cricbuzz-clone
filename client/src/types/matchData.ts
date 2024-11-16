import {
  DISMISSAL_TYPES_VALUES,
  MATCH_OTHER_RESULT_TYPES_VALUES,
  MATCH_RESULT_TYPES_VALUES,
  MATCH_STATES_VALUES,
  TOSS_DECISIONS_VALUES,
} from "../utils/constants";
import { Team } from "./teams";
import { BasicMatchSquadPlayer, MatchSquadPlayer } from "./players";

// const
export const SCORECARD_INNINGS_TYPES = [
  "first",
  "second",
  "third",
  "fourth",
] as const;

export type FallOfWicket = {
  dismissalType: (typeof DISMISSAL_TYPES_VALUES)[number];
  overs: number;
  teamScore: number;
  teamWickets: number;
  bowlerId?: number;
  helpers: number[];
};

export type FallOfWicketWithPlayerInfo = Omit<
  FallOfWicket,
  "bowlerId" | "helpers"
> & {
  bowler?: BasicMatchSquadPlayer;
  helpers: BasicMatchSquadPlayer[];
};

export type ScorecardBatter = {
  id: number;
  batRuns: number;
  ballsPlayed: number;
  dotBalls: number;
  batFours: number;
  batSixes: number;
  isStriker?: boolean;
  fallOfWicket?: FallOfWicket;
};

export type ScorecardBatterWithInfo = Omit<ScorecardBatter, "fallOfWicket"> &
  Pick<
    MatchSquadPlayer,
    "id" | "name" | "shortName" | "isCaptain" | "isKeeper"
  > & {
    fallOfWicket?: FallOfWicketWithPlayerInfo;
  } & {};

export type DidNotBatBatter = MatchSquadPlayer;

export type ScorecardBowler = {
  id: number;
  bowlOvers: number;
  bowlMaidens: number;
  bowlRuns: number;
  bowlWickets: number;
  bowlWides: number;
  bowlNoBalls: number;
  isStriker?: boolean;
  isNonStriker?: boolean;
};

export type ScorecardBowlerWithInfo = ScorecardBowler & BasicMatchSquadPlayer;

type extraBall = {
  nos: number;
  wides: number;
  legByes: number;
  byes: number;
  penalties: number;
};

export type BaseScorecardInnings = {
  teamId: number;
  overs: number;
  oversBowled: number;
  score: number;
  wickets: number;
  isDeclared?: boolean;
  isFollowOn?: boolean;
  extras: extraBall;
};

export type ScorecardInningsRaw = BaseScorecardInnings & {
  batters: ScorecardBatter[];
  bowlers: ScorecardBowler[];
};

export type ScorecardInnings = Omit<BaseScorecardInnings, "teamId"> & {
  team: Team;
} & {
  batters: ScorecardBatterWithInfo[];
  didNotBatBatters: DidNotBatBatter[];
  bowlers: ScorecardBowlerWithInfo[];
};

export type MatchTossResults = {
  tossWinnerId: number;
  decision: TossDecision;
};

export type MatchTossResultsWithInfo = {
  winnerTeam: Team;
  decision: MatchTossResults["decision"];
};

type MatchResultsWin = {
  resultType: MatchResultWinType;
  winByInnings: boolean;
  winByRuns: boolean;
  winningMargin: number;
  winningTeamId: number;
};

export type MatchResults =
  | MatchResultsWin
  | {
      resultType: MatchOtherResultType;
    };

export type MatchResultsWithInfo =
  | (Omit<MatchResultsWin, "winningTeamId"> & {
      winningTeam: Team;
    })
  | {
      resultType: MatchOtherResultType;
    };

export type ScorecardDataRaw = {
  innings: ScorecardInningsRaw[];
  state: MatchState;
  status: string;
  tossResults?: MatchTossResults;
  results?: MatchResults;
};

export type ScorecardData = Omit<
  ScorecardDataRaw,
  "innings" | "tossResults" | "results"
> & {
  innings: ScorecardInnings[];
  state: MatchState;
  status: string;
  tossResults?: MatchTossResultsWithInfo;
  results?: MatchResultsWithInfo;
};

type MatchResultWinType = (typeof MATCH_RESULT_TYPES_VALUES)[0];
type MatchOtherResultType = (typeof MATCH_OTHER_RESULT_TYPES_VALUES)[number];
export type TossDecision = (typeof TOSS_DECISIONS_VALUES)[number];
export type MatchState = (typeof MATCH_STATES_VALUES)[number];
export type ScorecardInningsTypes = (typeof SCORECARD_INNINGS_TYPES)[number];
