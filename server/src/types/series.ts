import * as z from "zod";

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

export type NewSeries = z.infer<typeof NewSeries>;
export type Series = z.infer<typeof Series>;
export type SeriesOptional = z.infer<typeof SeriesOptional>;
export type SeriesWithId = z.infer<typeof SeriesWithId>;
