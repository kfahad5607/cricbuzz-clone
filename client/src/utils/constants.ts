export const BALLS_IN_OVER = 6;
export const TIME_FORMAT = "hh:mm A";
export const DATE_FORMAT = "MMM DD, YYYY";
export const DATE_TIME_FORMAT = "dddd, DD MMM, hh:mm A";

export const MATCH_FORMATS = {
  TEST: "test",
  ODI: "odi",
  T20: "t20",
} as const;

export const MATCH_FORMATS_VALUES = ["test", "odi", "t20"] as const;

export const MATCH_TYPES = {
  INTERNATIONAL: "international",
  LEAGUE: "league",
  DOMESTIC: "domestic",
} as const;

export const MATCH_TYPES_VALUES = [
  "international",
  "league",
  "domestic",
] as const;

export const MATCH_STATES = {
  PREVIEW: "preview",
  DELAY: "abandon",
  // COMPLETE: "draw",
  COMPLETE: "complete",
  ABANDON: "tie",
} as const;

export const MATCH_STATES_VALUES = [
  "preview",
  "delay",
  "complete",
  "abandon",
] as const;

export const MATCH_RESULT_TYPES_VALUES = [
  "win",
  "abandon",
  "draw",
  "tie",
  "no-result",
] as const;

export const TOSS_DECISIONS_VALUES = ["bat", "bowl"] as const;

export const DISMISSAL_TYPES = {
  BOWLED: "bowled",
  CAUGHT: "caught",
  LBW: "lbw",
  STUMPED: "stumped",
  RUN_OUT: "run-out",
  RETIRED: "retired",
  HIT_THE_BALL_TWICE: "hit-the-ball-twice",
  HIT_WICKET: "hit-wicket",
  OBSTRUCT_FIELD: "obstruct-field",
  HANDLED_BALL: "handled-ball",
  TIMED_OUT: "timed-out",
} as const;

export const DISMISSAL_TYPES_VALUES = [
  "bowled",
  "caught",
  "lbw",
  "stumped",
  "run-out",
  "retired",
  "hit-the-ball-twice",
  "hit-wicket",
  "obstruct-field",
  "handled-ball",
  "timed-out",
] as const;

export const BALL_EVENTS = {
  WICKET: "WICKET",
  MAIDEN_OVER: "MAIDEN_OVER",
  FOUR: "FOUR",
  SIX: "SIX",
  FIFTY: "FIFTY",
  HUNDRED: "HUNDRED",
  UDRS: "UDRS",
  PARTNERSHIP: "PARTNERSHIP",
  INJURY: "INJURY",
  TEAM_FIFTY: "TEAM_FIFTY",
  TEAM_HUNDRED: "TEAM_HUNDRED",
  DROPPED: "DROPPED",
  RUNOUT_MISS: "RUNOUT_MISS",
  HIGHSCORING_OVER: "HIGHSCORING_OVER",
  OVER_BREAK: "OVER_BREAK",
  // OTHER: "OTHER",
} as const;

export const BALL_EVENTS_VALUES = [
  "WICKET",
  "MAIDEN_OVER",
  "FOUR",
  "SIX",
  "FIFTY",
  "HUNDRED",
  "UDRS",
  "PARTNERSHIP",
  "INJURY",
  "TEAM_FIFTY",
  "TEAM_HUNDRED",
  "DROPPED",
  "RUNOUT_MISS",
  "HIGHSCORING_OVER",
  "OVER_BREAK",
  // "OTHER",
] as const;

export const PLAYER_ROLES = {
  BATTER: "batter",
  BOWLER: "bowler",
  WK_BATTER: "wk-batter",
  BAT_ALLROUNDER: "bat-allrounder",
  BOWL_ALLROUNDER: "bowl-allrounder",
};

export const PLAYER_ROLES_VALUES = [
  "batter",
  "bowler",
  "wk-batter",
  "bat-allrounder",
  "bowl-allrounder",
] as const;

export const PLAYER_ROLES_MAP = {
  batter: "Batter",
  bowler: "Batter",
  "wk-batter": "WK-Batter",
  "bat-allrounder": "Batting Allrounder",
  "bowl-allrounder": "Bowling Allrounder",
};

export const PLAYER_BAT_STYLES = {
  RIGHT: "right-handed-bat",
  LEFT: "left-handed-bat",
};

export const PLAYER_BAT_STYLES_VALUES = [
  "right-handed-bat",
  "left-handed-bat",
] as const;

export const PLAYER_BOWL_STYLES = {
  RIGHT_ARM_MEDIUM: "right-arm-medium",
  LEFT_ARM_MEDIUM: "left-arm-medium",
  RIGHT_ARM_FAST_MEDIUM: "right-arm-fast-medium",
  LEFT_ARM_FAST_MEDIUM: "left-arm-fast-medium",
  RIGHT_ARM_FAST: "right-arm-fast",
  LEFT_ARM_FAST: "left-arm-fast",
  RIGHT_ARM_ORTHO: "right-arm-orthodox",
  LEFT_ARM_ORTHO: "left-arm-orthodox",
  RIGHT_ARM_WRIST_SPIN: "right-arm-wrist-spin",
  LEFT_ARM_WRIST_SPIN: "left-arm-wrist-spin",
  RIGHT_ARM_OFFBREAK: "right-arm-offbreak",
  LEFT_ARM_OFFBREAK: "left-arm-offbreak",
  RIGHT_ARM_LEGBREAK: "right-arm-legbreak",
  LEFT_ARM_LEGBREAK: "left-arm-legbreak",
};

export const PLAYER_BOWL_STYLES_VALUES = [
  "right-arm-medium",
  "left-arm-medium",
  "right-arm-fast-medium",
  "left-arm-fast-medium",
  "right-arm-fast",
  "left-arm-fast",
  "right-arm-orthodox",
  "left-arm-orthodox",
  "right-arm-wrist-spin",
  "left-arm-wrist-spin",
  "right-arm-offbreak",
  "left-arm-offbreak",
  "right-arm-legbreak",
  "left-arm-legbreak",
] as const;
