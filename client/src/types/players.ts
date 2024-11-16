import {
  PLAYER_BAT_STYLES_VALUES,
  PLAYER_BOWL_STYLES_VALUES,
  PLAYER_ROLES_VALUES,
} from "../utils/constants";
import type { Team } from "./teams";

type PlayerRoleInfo = {
  role: (typeof PLAYER_ROLES_VALUES)[number];
  batStyle: (typeof PLAYER_BAT_STYLES_VALUES)[number];
  bowlStyle: (typeof PLAYER_BOWL_STYLES_VALUES)[number];
};

type PlayerPersonalInfo = {
  birthDate: Date;
  birthPlace?: string | undefined;
  height?: number | undefined;
};

export type BasicMatchSquadPlayer = {
  id: number;
  name: string;
  shortName: string;
};

export type Player = BasicMatchSquadPlayer & {
  team: Pick<Team, "id" | "name">;
  roleInfo: PlayerRoleInfo;
  personalInfo: PlayerPersonalInfo;
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
