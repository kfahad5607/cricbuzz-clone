import * as z from "zod";
import {
  MATCH_FORMATS,
  MATCH_RESULT_TYPES_VALUES,
  MATCH_STATES,
  MATCH_TYPES,
  TOSS_DECISIONS_VALUES,
} from "../helpers/constants";
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
  matchFormat: z.enum(MATCH_FORMATS),
  matchType: z.enum(MATCH_TYPES),
  matchNumber: z.number().positive(),
  homeTeam: z.number().positive(),
  awayTeam: z.number().positive(),
  series: z.number().positive(),
  venue: z.number().positive(),
  startTime: z.coerce.date(),
  state: z.enum(MATCH_STATES),
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

export const MatchSquadPlayer = z.object({
  playerId: z.number().positive(),
  isPlaying: z.boolean().optional(),
  isInSubs: z.boolean().optional(),
  isIncluded: z.boolean().optional(),
  isExcluded: z.boolean().optional(),
  isSubstitute: z.boolean().optional(),
  isSubstituted: z.boolean().optional(),
  isCaptain: z.boolean().optional(),
  isKeeper: z.boolean().optional(),
  isForeignPlayer: z.boolean().optional(),
});

export const MatchSquadPlayerOptional = MatchSquadPlayer.partial();

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
export type MatchSquadPlayer = z.infer<typeof MatchSquadPlayer>;
export type MatchSquadPlayerOptional = z.infer<typeof MatchSquadPlayerOptional>;
export type MatchSquad = z.infer<typeof MatchSquad>;

// manual types
export type MatchCard = Pick<
  MatchWithId,
  "id" | "slug" | "description" | "matchFormat" | "status" | "startTime"
> & {
  series: Pick<Series, "title">;
  homeTeam: Pick<Team, "name" | "shortName">;
  awayTeam: Pick<Team, "name" | "shortName">;
};
