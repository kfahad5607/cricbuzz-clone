import * as z from "zod";
import { TIMEZONES } from "../utils/constants";

export const Timezone = z.enum(TIMEZONES);

export const Venue = z.object({
  name: z
    .string({
      required_error: "Name is required.",
      invalid_type_error: "Expected string.",
    })
    .min(3, "Name must have least 3 characters.")
    .max(100, "Name cannot have more than 100 characters."),
  city: z
    .string({
      required_error: "City is required.",
      invalid_type_error: "Expected string.",
    })
    .min(3, "City must have least 3 characters.")
    .max(100, "City cannot have more than 100 characters."),
  country: z
    .string({
      required_error: "Country is required.",
      invalid_type_error: "Expected string.",
    })
    .min(3, "Country must have least 3 characters.")
    .max(100, "Country cannot have more than 100 characters."),
  timezone: Timezone,
});

export type Venue = z.infer<typeof Venue>;
export type VenueWithId = Venue & {
  id: number;
};
export type MatchVenue = Omit<Venue, "country">;
