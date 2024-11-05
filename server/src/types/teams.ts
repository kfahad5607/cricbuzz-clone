import * as z from "zod";

export const Team = z.object({
  name: z
    .string({
      required_error: "Name is required.",
      invalid_type_error: "Expected string.",
    })
    .min(3)
    .max(100),
  shortName: z
    .string({
      required_error: "Short name is required.",
      invalid_type_error: "Expected string.",
    })
    .min(1)
    .max(5),
});

export const TeamOptional = Team.partial();

export const TeamWithId = Team.extend({
  id: z.coerce.number().positive(),
});

export type Team = z.infer<typeof Team>;
export type TeamOptional = z.infer<typeof TeamOptional>;
export type TeamWithId = z.infer<typeof TeamWithId>;

export type SeriesTeam = Omit<TeamWithId, "shortName">;