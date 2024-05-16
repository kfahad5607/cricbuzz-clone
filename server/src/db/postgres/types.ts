import { MATCH_RESULT_TYPES, TOSS_DECISIONS } from "./constants";

type TossDecision = (typeof TOSS_DECISIONS)[keyof typeof TOSS_DECISIONS];

type MatchResultType =
  (typeof MATCH_RESULT_TYPES)[keyof typeof MATCH_RESULT_TYPES];

export interface TossResultsType {
  tossWinnerId?: number;
  decision: TossDecision | "";
}

export interface MatchResultsType {
  resultType: MatchResultType | "";
  winByInnings: boolean;
  winByRuns: boolean;
  winningMargin?: number;
  winningTeamId?: number;
}
