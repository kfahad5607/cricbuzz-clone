import * as z from "zod";
import {
  PLAYER_BAT_STYLES_VALUES,
  PLAYER_BOWL_STYLES_VALUES,
  PLAYER_ROLES_VALUES,
} from "../helpers/constants";

const RoleInfo = z.object({
  role: z.enum(PLAYER_ROLES_VALUES),
  batStyle: z.enum(PLAYER_BAT_STYLES_VALUES),
  bowlStyle: z.enum(PLAYER_BOWL_STYLES_VALUES).optional(),
});

const PersonalInfo = z.object({
  birthDate: z.coerce.date(),
  birthPlace: z.string().optional(),
  height: z.number().optional(),
});

export const NewPlayer = z.object({
  name: z
    .string({
      required_error: "Name is required.",
      invalid_type_error: "Expected string.",
    })
    .min(3)
    .max(100),
  shortName: z
    .string({
      required_error: "short name is required.",
      invalid_type_error: "Expected string.",
    })
    .min(2)
    .max(50),
  team: z.number().positive(),
  roleInfo: RoleInfo,
  personalInfo: PersonalInfo,
});

export const Player = NewPlayer.extend({
  slug: z.string().min(3).max(100),
});

export const PlayerOptional = Player.partial();

export const PlayerWithId = Player.extend({
  id: z.number().positive(),
});

export type RoleInfo = z.infer<typeof RoleInfo>;
export type PersonalInfo = z.infer<typeof PersonalInfo>;
export type NewPlayer = z.infer<typeof NewPlayer>;
export type Player = z.infer<typeof Player>;
export type PlayerOptional = z.infer<typeof PlayerOptional>;
export type PlayerWithId = z.infer<typeof PlayerWithId>;
