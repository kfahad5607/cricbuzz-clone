import type { MatchFormat, MatchType } from "./matches";
import type { Team } from "./teams";
import type { MatchSquadPlayer } from "./players";

export type Series = {
  id: number;
  title: string;
  seriesType: MatchType;
};

export type SeriesInfo = Series & {
  startTime: string;
  endTime: string;
};

export type SeriesInfoWithMatch = Omit<SeriesInfo, "seriesType"> & {
  matches: {
    format: MatchFormat;
    count: number;
  }[];
};

export type SeriesTeamsItem = {
  matchFormat: MatchFormat;
  teams: Omit<Team, "shortName">[];
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
