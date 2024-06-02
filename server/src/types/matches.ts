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
  winningMargin: z.number().positive().optional(),
  winningTeamId: z.number().positive().optional(),
});

const MatchTossResults = z.object({
  tossWinnerId: z.number().positive().optional(),
  decision: z.enum(TOSS_DECISIONS_VALUES).optional(),
});

export const NewMatch = z.object({
  description: z
    .string({
      required_error: "Description is required.",
      invalid_type_error: "Expected string.",
    })
    .min(5)
    .max(200),
  matchFormat: z.enum(MATCH_FORMATS_VALUES),
  matchType: z.enum(MATCH_TYPES_VALUES),
  matchNumber: z.number().positive(),
  homeTeam: z.number().positive(),
  awayTeam: z.number().positive(),
  series: z.number().positive(),
  venue: z.number().positive(),
  startTime: z.coerce.date(),
  state: z.enum(MATCH_STATES_VALUES).default(MATCH_STATES.PREVIEW),
  status: z.string().max(200).default("").optional(),
  tossResults: MatchTossResults.default({}),
  results: MatchResults.default({ winByInnings: false, winByRuns: false }),
});

export const Match = NewMatch.extend({
  slug: z.string().min(5).max(255),
});

export const MatchOptional = Match.partial();

export const MatchWithId = Match.extend({
  id: z.number().positive(),
});

export const MatchSquad = z.object({
  matchId: z.number().positive(),
  teams: z.array(
    z.object({
      teamId: z.number().positive(),
      players: z.array(MatchSquadPlayer),
    })
  ),
});

// infered types
export type MatchResults = z.infer<typeof MatchResults>;
export type MatchTossResults = z.infer<typeof MatchTossResults>;
export type NewMatch = z.infer<typeof NewMatch>;
export type Match = z.infer<typeof Match>;
export type MatchOptional = z.infer<typeof MatchOptional>;
export type MatchWithId = z.infer<typeof MatchWithId>;
export type MatchSquad<PlayerT extends MatchSquadPlayer> = {
  matchId: number;
  teams: {
    teamId: number;
    players: PlayerT[];
  }[];
};

// manual types
export type MatchCard = Pick<
  MatchWithId,
  "id" | "slug" | "description" | "matchFormat" | "status" | "startTime"
> & {
  series: Pick<Series, "title">;
  homeTeam: Pick<Team, "name" | "shortName">;
  awayTeam: Pick<Team, "name" | "shortName">;
};
