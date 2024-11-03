import { MATCH_FORMATS_VALUES } from "../utils/constants";
import {
  BaseScorecardInnings,
  MatchResults,
  MatchResultsWithInfo,
  MatchState,
  MatchTossResults,
  MatchTossResultsWithInfo,
} from "./matchData";
import { MatchSquadPlayer } from "./players";

export type MatchCardRaw = {
  id: number;
  description: string;
  matchFormat: string;
  startTime: string;
  series: {
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

export type MatchCard = Omit<MatchCardRaw, "tossResults" | "results" | "innings"> & {
  tossResults?: MatchTossResultsWithInfo;
  results?: MatchResultsWithInfo;
  innings: (Omit<
    BaseScorecardInnings,
    "extras" | "isDeclared" | "isFollowOn" | "teamId"
  > & { team: TeamMatchInfo })[];
};

type SeriesMatchInfo = {
  id: number;
  title: string;
  slug: string;
};

type VenueMatchInfo = {
  id: number;
  name: string;
  slug: string;
  city: string;
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
  matchFormat: (typeof MATCH_FORMATS_VALUES)[number];
  startTime: string;
  series: SeriesMatchInfo;
  venue: VenueMatchInfo;
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
