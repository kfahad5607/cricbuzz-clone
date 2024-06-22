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

export const Player = z.object({
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

export const PlayerOptional = Player.partial();

export const PlayerWithId = Player.extend({
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

export const MatchSquadPlayerOptional = MatchSquadPlayer.partial({
  playerId: true,
});
export const MatchSquadPlayerWithInfo = MatchSquadPlayerOptional.merge(
  PlayerOptional
).required({
  playerId: true,
});

export type RoleInfo = z.infer<typeof RoleInfo>;
export type PersonalInfo = z.infer<typeof PersonalInfo>;
export type Player = z.infer<typeof Player>;
export type PlayerOptional = z.infer<typeof PlayerOptional>;
export type PlayerWithId = z.infer<typeof PlayerWithId>;
export type MatchSquadPlayer = z.infer<typeof MatchSquadPlayer>;
export type MatchSquadPlayerOptional = z.infer<typeof MatchSquadPlayerOptional>;
export type MatchSquadPlayerWithInfo = z.infer<typeof MatchSquadPlayerWithInfo>;
