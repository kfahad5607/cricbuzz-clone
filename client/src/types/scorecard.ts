import { DISMISSAL_TYPES_VALUES } from "../utils/constants";

type fallOfWicket = {
  dismissalType: (typeof DISMISSAL_TYPES_VALUES)[number];
  overs: number;
  teamScore: number;
  teamWickets: number;
  bowlerId?: number;
  helpers: number[];
};

export type ScorecardBatter = {
  id: number;
  batRuns: number;
  ballsPlayed: number;
  dotBalls: number;
  batFours: number;
  batSixes: number;
  isStriker?: boolean;
  fallOfWicket: fallOfWicket;
};

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
