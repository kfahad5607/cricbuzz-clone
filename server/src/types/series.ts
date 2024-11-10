import * as z from "zod";
import { MatchType } from "./matches";

export const Series = z.object({
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
  seriesType: MatchType,
});

export const SeriesOptional = Series.partial();

export const SeriesWithId = Series.extend({
  id: z.coerce.number().positive(),
});

export type Series = z.infer<typeof Series>;
export type SeriesOptional = z.infer<typeof SeriesOptional>;
export type SeriesWithId = z.infer<typeof SeriesWithId>;
