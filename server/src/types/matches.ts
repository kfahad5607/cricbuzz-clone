import * as z from "zod";
import {
  MATCH_FORMATS_VALUES,
  MATCH_RESULT_TYPES_VALUES,
  MATCH_STATES,
  MATCH_STATES_VALUES,
  MATCH_TYPES_VALUES,
  TOSS_DECISIONS_VALUES,
} from "../helpers/constants";
import { MatchSquadPlayer } from "./players";
import { Series } from "./series";
import { Team } from "./teams";

const MatchResults = z.object({
  resultType: z.enum(MATCH_RESULT_TYPES_VALUES).optional(),
  winByInnings: z.boolean(),
  winByRuns: z.boolean(),
  winningMargin: z.coerce.number().positive().optional(),
  winningTeamId: z.coerce.number().positive().optional(),
});

const MatchTossResults = z.object({
  tossWinnerId: z.coerce.number().positive().optional(),
  decision: z.enum(TOSS_DECISIONS_VALUES).optional(),
});

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
  state: z.enum(MATCH_STATES_VALUES).default(MATCH_STATES.PREVIEW),
  status: z.string().max(200).default("").optional(),
  tossResults: MatchTossResults.default({}),
  results: MatchResults.default({ winByInnings: false, winByRuns: false }),
});

export const MatchOptional = Match.partial();

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
export type MatchResults = z.infer<typeof MatchResults>;
export type MatchTossResults = z.infer<typeof MatchTossResults>;
export type Match = z.infer<typeof Match>;
export type MatchOptional = z.infer<typeof MatchOptional>;
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
  "id" | "description" | "matchFormat" | "status" | "startTime"
> & {
  series: Pick<Series, "title">;
  homeTeam: Pick<Team, "name" | "shortName">;
  awayTeam: Pick<Team, "name" | "shortName">;
};
