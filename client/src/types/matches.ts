import { MATCH_FORMATS_VALUES } from "../utils/constants";
import { BaseScorecardInnings, MatchState } from "./matchData";
import { MatchSquadPlayer } from "./players";

export type MatchCard = {
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
  innings: Omit<
    BaseScorecardInnings,
    "overs" | "extras" | "isDeclared" | "isFollowOn"
  >[];
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
