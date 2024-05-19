import * as z from "zod";

export const NewVenue = z.object({
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

export const Venue = NewVenue.extend({
  slug: z.string().min(3).max(100),
});

export const VenueOptional = Venue.partial();

export const VenueWithId = Venue.extend({
  id: z.number().positive(),
});

export type NewVenue = z.infer<typeof NewVenue>;
export type Venue = z.infer<typeof Venue>;
export type VenueOptional = z.infer<typeof VenueOptional>;
export type VenueWithId = z.infer<typeof VenueWithId>;
