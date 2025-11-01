import * as z from "zod";
import {
  PLAYER_BAT_STYLES_VALUES,
  PLAYER_BOWL_STYLES_VALUES,
  PLAYER_ROLES_VALUES,
} from "../utils/constants";
import type { Team } from "./teams";

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
      required_error: "Short Name is required.",
      invalid_type_error: "Expected string.",
    })
    .min(2)
    .max(50),
  team: z.coerce.number().positive(),
  roleInfo: RoleInfo,
  personalInfo: PersonalInfo,
});

export type NewPlayer = z.infer<typeof NewPlayer>;
export type NewPlayerWithId = NewPlayer & { id: number };
type PlayerRoleInfo = NewPlayer["roleInfo"];
type PlayerPersonalInfo = NewPlayer["personalInfo"];

export type BasicMatchSquadPlayer = Pick<NewPlayer, "name" | "shortName"> & {
  id: number;
};

export type Player = Omit<NewPlayer, "team"> & {
  id: number;
  team: Pick<Team, "id" | "name">;
};

export type MatchSquadPlayer = BasicMatchSquadPlayer & {
  slug: string;
  roleInfo: PlayerRoleInfo;
  isPlaying?: boolean;
  isInSubs?: boolean;
  isIncluded?: boolean;
  isExcluded?: boolean;
  isSubstitute?: boolean;
  isSubstituted?: boolean;
  isCaptain?: boolean;
  isKeeper?: boolean;
  isForeignPlayer?: boolean;
};
