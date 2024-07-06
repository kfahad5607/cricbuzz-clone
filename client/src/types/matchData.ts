import {
  DISMISSAL_TYPES_VALUES,
  MATCH_RESULT_TYPES_VALUES,
  MATCH_STATES_VALUES,
  TOSS_DECISIONS_VALUES,
} from "../utils/constants";
import { BasicMatchSquadPlayer, MatchSquadPlayer } from "./players";

// const
export const SCORECARD_INNINGS_TYPES = [
  "first",
  "second",
  "third",
  "fourth",
] as const;

export type fallOfWicket = {
  dismissalType: (typeof DISMISSAL_TYPES_VALUES)[number];
  overs: number;
  teamScore: number;
  teamWickets: number;
  bowlerId?: number;
  helpers: number[];
};

export type fallOfWicketWithPlayerInfo = Omit<
  fallOfWicket,
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
  fallOfWicket?: fallOfWicket;
};

export type ScorecardBatterWithName = Omit<ScorecardBatter, "fallOfWicket"> &
  BasicMatchSquadPlayer & {
    fallOfWicket?: fallOfWicketWithPlayerInfo;
  };

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

export type ScorecardBowlerWithName = ScorecardBowler & BasicMatchSquadPlayer;

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

export type ScorecardInnings = BaseScorecardInnings & {
  batters: ScorecardBatterWithName[];
  didNotBatBatters: DidNotBatBatter[];
  bowlers: ScorecardBowlerWithName[];
};

export type MatchTossResults = {
  tossWinnerId?: number;
  decision: (typeof TOSS_DECISIONS_VALUES)[number];
};

export type MatchResults = {
  resultType?: (typeof MATCH_RESULT_TYPES_VALUES)[number];
  winByInnings: boolean;
  winByRuns: boolean;
  winningMargin?: number;
  winningTeamId?: number;
};

export type ScorecardDataRaw = {
  innings: ScorecardInningsRaw[];
  state: (typeof MATCH_STATES_VALUES)[number];
  status: string;
};

export type ScorecardData = Omit<ScorecardDataRaw, "innings"> & {
  innings: ScorecardInnings[];
  state: (typeof MATCH_STATES_VALUES)[number];
  status: string;
};

export type ScorecardInningsTypes = (typeof SCORECARD_INNINGS_TYPES)[number];
