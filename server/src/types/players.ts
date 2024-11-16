import * as z from "zod";
import {
  PLAYER_BAT_STYLES_VALUES,
  PLAYER_BOWL_STYLES_VALUES,
  PLAYER_ROLES_VALUES,
} from "../helpers/constants";
import { TeamWithId } from "./teams";

const RoleInfo = z.object({
  role: z.enum(PLAYER_ROLES_VALUES),
  batStyle: z.enum(PLAYER_BAT_STYLES_VALUES),
  bowlStyle: z.enum(PLAYER_BOWL_STYLES_VALUES).optional(),
});

const PersonalInfo = z.object({
  birthDate: z.coerce.date(),
  birthPlace: z.string().optional(),
  height: z.coerce.number().optional(),
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
  team: z.coerce.number().positive(),
  roleInfo: RoleInfo,
  personalInfo: PersonalInfo,
});

export const PlayerPartial = Player.partial();

export const PlayerWithId = Player.extend({
  id: z.coerce.number().positive(),
});

export const MatchSquadPlayer = z.object({
  id: z.coerce.number().positive(),
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

export const MatchSquadPlayerPartial = MatchSquadPlayer.partial({
  id: true,
});
export const MatchSquadPlayerWithInfo = MatchSquadPlayerPartial.merge(
  PlayerPartial
).required({
  id: true,
});

export type RoleInfo = z.infer<typeof RoleInfo>;
export type PersonalInfo = z.infer<typeof PersonalInfo>;
export type Player = z.infer<typeof Player>;
export type ApiPlayer = Pick<
  PlayerWithId,
  "id" | "name" | "roleInfo" | "personalInfo"
> & {
  team: Pick<TeamWithId, "id" | "name">;
};

const t: ApiPlayer = {
  id: 1,
  name: "dd",
  roleInfo: {
    batStyle: "left-handed-bat",
    role: "bat-allrounder",
    bowlStyle: "left-arm-fast",
  },
  personalInfo: {
    birthDate: new Date(),
    birthPlace: "ddd",
    height: 22,
  },
  team: {
    id: 1,
    name: "d",
  },
};
export type PlayerPartial = z.infer<typeof PlayerPartial>;
export type PlayerWithId = z.infer<typeof PlayerWithId>;
export type MatchSquadPlayer = z.infer<typeof MatchSquadPlayer>;
export type MatchSquadPlayerPartial = z.infer<typeof MatchSquadPlayerPartial>;
export type MatchSquadPlayerWithInfo = z.infer<typeof MatchSquadPlayerWithInfo>;
