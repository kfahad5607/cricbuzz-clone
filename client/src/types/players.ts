import {
  PLAYER_BAT_STYLES_VALUES,
  PLAYER_BOWL_STYLES_VALUES,
  PLAYER_ROLES_VALUES,
} from "../utils/constants";

type PlayerRoleInfo = {
  role: (typeof PLAYER_ROLES_VALUES)[number];
  batStyle: (typeof PLAYER_BAT_STYLES_VALUES)[number];
  bowlStyle: (typeof PLAYER_BOWL_STYLES_VALUES)[number];
};

export type BasicMatchSquadPlayer = {
  id: number;
  name: string;
  shortName: string;
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
