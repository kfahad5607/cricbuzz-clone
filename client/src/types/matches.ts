import { MATCH_FORMATS_VALUES, MATCH_TYPES_VALUES } from "../utils/constants";
import {
  BaseScorecardInnings,
  MatchResults,
  MatchResultsWithInfo,
  MatchState,
  MatchTossResults,
  MatchTossResultsWithInfo,
} from "./matchData";
import { MatchSquadPlayer } from "./players";
import { Series } from "./series";
import { Team } from "./teams";
import { MatchVenue, Venue } from "./venue";

export type MatchType = (typeof MATCH_TYPES_VALUES)[number];
export type MatchFormat = (typeof MATCH_FORMATS_VALUES)[number];

export type MatchCardRaw = {
  id: number;
  description: string;
  matchFormat: MatchFormat;
  startTime: string;
  series: {
    id: number;
    title: string;
  };
  homeTeam: Team;
  awayTeam: Team;
  state: MatchState;
  status: string;
  tossResults?: MatchTossResults;
  results?: MatchResults;
  innings: Omit<BaseScorecardInnings, "extras" | "isDeclared" | "isFollowOn">[];
};

export type MatchFullCardRaw = MatchCardRaw & {
  matchType: MatchType;
  venue: Omit<Venue, "country">;
};

export type MatchFullCard = Omit<
  MatchFullCardRaw,
  "tossResults" | "results" | "innings"
> & {
  tossResults?: MatchTossResultsWithInfo;
  results?: MatchResultsWithInfo;
  innings: (Omit<
    BaseScorecardInnings,
    "extras" | "isDeclared" | "isFollowOn" | "teamId"
  > & { team: Team })[];
};

export type MatchCard = Omit<
  MatchCardRaw,
  "tossResults" | "results" | "innings"
> & {
  tossResults?: MatchTossResultsWithInfo;
  results?: MatchResultsWithInfo;
  innings: (Omit<
    BaseScorecardInnings,
    "extras" | "isDeclared" | "isFollowOn" | "teamId"
  > & { team: Team })[];
};

export type SeriesMatchCardRaw = Omit<MatchCardRaw, "series"> & {
  venue: MatchVenue;
};

export type SeriesMatchCard = Omit<MatchCard, "series"> & {
  venue: MatchVenue;
};

export type TeamSquadPlayers = {
  playingXi: MatchSquadPlayer[];
  substitutes: MatchSquadPlayer[];
  bench: MatchSquadPlayer[];
};

export type TeamMatchInfoWithPlayers = Team & {
  players: TeamSquadPlayers;
};

export type Match = {
  id: number;
  description: string;
  startTime: string;
  homeTeam: Team;
  awayTeam: Team;
  series: Series;
  venue: MatchVenue;
};

export type MatchInfoRaw = Omit<Match, "series"> & {
  matchFormat: MatchFormat;
  series: Pick<Series, "id" | "title">;
  squads: TeamSquad[];
};

export type MatchInfo = Omit<MatchInfoRaw, "squads"> & {
  homeTeam: TeamMatchInfoWithPlayers;
  awayTeam: TeamMatchInfoWithPlayers;
};

export type TeamSquad = {
  teamId: number;
  players: MatchSquadPlayer[];
};

export type MatchSquad = {
  matchId: number;
  teams: TeamSquad[];
};
