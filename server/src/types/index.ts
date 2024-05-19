import * as z from "zod";
import {
  MATCH_FORMATS,
  MATCH_RESULT_TYPES_VALUES,
  MATCH_STATES,
  MATCH_TYPES,
  TOSS_DECISIONS_VALUES,
} from "../helpers/constants";

export const ParamsWithNumId = z.object({
  id: z
    .string({
      required_error: "ID is required.",
    })
    .refine((val) => {
      try {
        const num = Number(val);
        if (isNaN(num) || num < 1) throw Error("");
        return num;
      } catch (err) {
        return false;
      }
    }),
});

export const NewSeries = z.object({
  title: z
    .string({
      required_error: "Title is required.",
      invalid_type_error: "Expected string.",
    })
    .min(5)
    .max(255),
  description: z
    .string({
      required_error: "Description is required.",
      invalid_type_error: "Expected string.",
    })
    .min(5)
    .max(150),
});

export const Series = NewSeries.extend({
  slug: z.string().min(5).max(255),
});

export const SeriesOptional = Series.partial();

export const SeriesWithId = Series.extend({
  id: z.number().positive(),
});

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
  title: z
    .string({
      required_error: "Title is required.",
      invalid_type_error: "Expected string.",
    })
    .min(5)
    .max(255),
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

// Common
export type ParamsWithNumId = z.infer<typeof ParamsWithNumId>;

// Series
export type NewSeries = z.infer<typeof NewSeries>;
export type Series = z.infer<typeof Series>;
export type SeriesOptional = z.infer<typeof SeriesOptional>;
export type SeriesWithId = z.infer<typeof SeriesWithId>;

// Matches
export type MatchResults = z.infer<typeof MatchResults>;
export type MatchTossResults = z.infer<typeof MatchTossResults>;
export type NewMatch = z.infer<typeof NewMatch>;
export type Match = z.infer<typeof Match>;
export type MatchOptional = z.infer<typeof MatchOptional>;
export type MatchWithId = z.infer<typeof MatchWithId>;
