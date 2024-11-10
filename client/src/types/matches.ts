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
  homeTeam: TeamMatchInfo;
  awayTeam: TeamMatchInfo;
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
  > & { team: TeamMatchInfo })[];
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
  > & { team: TeamMatchInfo })[];
};

export type SeriesMatchCardRaw = Omit<MatchCardRaw, "series"> & {
  venue: MatchVenue;
};

export type SeriesMatchCard = Omit<MatchCard, "series"> & {
  venue: MatchVenue;
};

type SeriesMatchInfo = {
  id: number;
  title: string;
  slug: string;
};

export type TeamMatchInfo = {
  id: number;
  name: string;
  shortName: string;
};

export type TeamSquadPlayers = {
  playingXi: MatchSquadPlayer[];
  substitutes: MatchSquadPlayer[];
  bench: MatchSquadPlayer[];
};

export type TeamMatchInfoWithPlayers = TeamMatchInfo & {
  players: TeamSquadPlayers;
};

export type MatchInfoRaw = {
  id: number;
  description: string;
  matchFormat: MatchFormat;
  startTime: string;
  series: SeriesMatchInfo;
  venue: MatchVenue;
  homeTeam: TeamMatchInfo;
  awayTeam: TeamMatchInfo;
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
