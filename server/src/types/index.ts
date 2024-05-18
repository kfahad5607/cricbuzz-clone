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
    .max(255),
});

export const Series = NewSeries.extend({
  id: z.number().positive(),
  slug: z.string(),
});

export type NewSeries = z.infer<typeof NewSeries>;
export type Series = z.infer<typeof Series>;
