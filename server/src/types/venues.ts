import * as z from "zod";

export const Venue = z.object({
  name: z
    .string({
      required_error: "Name is required.",
      invalid_type_error: "Expected string.",
    })
    .min(3)
    .max(100),
  city: z
    .string({
      required_error: "City is required.",
      invalid_type_error: "Expected string.",
    })
    .min(3)
    .max(100),
  country: z
    .string({
      required_error: "Country is required.",
      invalid_type_error: "Expected string.",
    })
    .min(3)
    .max(100),
});

export const VenueOptional = Venue.partial();

export const VenueWithId = Venue.extend({
  id: z.coerce.number().positive(),
});

export type Venue = z.infer<typeof Venue>;
export type VenueOptional = z.infer<typeof VenueOptional>;
export type VenueWithId = z.infer<typeof VenueWithId>;
