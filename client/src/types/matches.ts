import { MATCH_FORMATS_VALUES, MATCH_STATES_VALUES } from "../utils/constants";
import { MatchSquadPlayer } from "./players";

export type MatchCard = {
  id: number;
  slug: number;
  description: string;
  matchFormat: string;
  startTime: string;
  status: string;
  series: {
    title: string;
  };
  homeTeam: {
    name: string;
    shortName: string;
  };
  awayTeam: {
    name: string;
    shortName: string;
  };
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

type TeamMatchInfo = {
  id: number;
  name: string;
  slug: string;
  shortName: string;
};

export type MatchInfo = {
  id: number;
  slug: string;
  description: string;
  matchFormat: (typeof MATCH_FORMATS_VALUES)[number];
  startTime: string;
  status: (typeof MATCH_STATES_VALUES)[number];
  series: SeriesMatchInfo;
  venue: VenueMatchInfo;
  homeTeam: TeamMatchInfo;
  awayTeam: TeamMatchInfo;
  squads: TeamSquad[];
};

export type TeamSquad = {
  teamId: number;
  players: MatchSquadPlayer[];
};

export type MatchSquad = {
  matchId: number;
  teams: TeamSquad[];
};
