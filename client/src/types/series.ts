import { MatchFormat, TeamMatchInfo } from "./matches";
import { MatchSquadPlayer } from "./players";

export type SeriesInfo = {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  matches: {
    format: MatchFormat;
    count: number;
  }[];
};

export type SeriesTeamsItem = {
  matchFormat: MatchFormat;
  teams: Omit<TeamMatchInfo, "shortName">[];
};

export type SeriesTeamSquadRaw = {
  teamId: number;
  players: MatchSquadPlayer[];
};

export type SeriesTeamSquad = {
  teamId: number;
  playerByRoles: {
    title: string;
    players: MatchSquadPlayer[];
  }[];
};
