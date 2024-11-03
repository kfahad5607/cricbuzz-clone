import * as z from "zod";
import { MATCH_FORMATS_VALUES, MATCH_TYPES_VALUES } from "../helpers/constants";
import { MatchSquadPlayer } from "./players";
import { Series } from "./series";
import { Team } from "./teams";

export const Match = z.object({
  description: z
    .string({
      required_error: "Description is required.",
      invalid_type_error: "Expected string.",
    })
    .min(5)
    .max(200),
  matchFormat: z.enum(MATCH_FORMATS_VALUES),
  matchType: z.enum(MATCH_TYPES_VALUES),
  matchNumber: z.coerce.number().nonnegative(),
  homeTeam: z.coerce.number().positive(),
  awayTeam: z.coerce.number().positive(),
  series: z.coerce.number().positive(),
  venue: z.coerce.number().positive(),
  startTime: z.coerce.date(),
  completeTime: z.coerce.date(),
});

export const MatchPartial = Match.partial();

export const MatchWithId = Match.extend({
  id: z.coerce.number().positive(),
});

export const TeamSquad = z.object({
  teamId: z.coerce.number().positive(),
  players: z.array(MatchSquadPlayer),
});

export const MatchSquad = z.object({
  matchId: z.coerce.number().positive(),
  teams: z.array(TeamSquad),
});

// infered types
export type Match = z.infer<typeof Match>;
export type MatchPartial = z.infer<typeof MatchPartial>;
export type MatchWithId = z.infer<typeof MatchWithId>;

// manual types
export type TeamSquad<PlayerT extends MatchSquadPlayer> = {
  teamId: number;
  players: PlayerT[];
};

export type MatchSquad<PlayerT extends MatchSquadPlayer> = {
  matchId: number;
  teams: TeamSquad<PlayerT>[];
};

export type MatchCard = Pick<
  MatchWithId,
  "id" | "description" | "matchFormat" | "startTime" | "completeTime"
> & {
  series: Pick<Series, "title">;
  homeTeam: Pick<Team, "name" | "shortName">;
  awayTeam: Pick<Team, "name" | "shortName">;
};


export type SeriesMatchCard = Pick<
  MatchWithId,
  "id" | "description" | "matchFormat" | "startTime" | "completeTime"
> & {
  homeTeam: Pick<Team, "name" | "shortName">;
  awayTeam: Pick<Team, "name" | "shortName">;
};
