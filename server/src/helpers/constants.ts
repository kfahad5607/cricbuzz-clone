import { number } from "zod";

export const MATCH_FORMATS = ["test", "odi", "t20"] as const;

export const MATCH_TYPES = ["international", "league", "domestic"] as const;

export const MATCH_STATES = [
  "preview",
  "delay",
  "complete",
  "abandon",
] as const;

export const TOSS_DECISIONS = {
  BAT: "bat",
  BOWL: "bowl",
};

export const TOSS_DECISIONS_VALUES = ["bat", "bowl"] as const;

export const MATCH_RESULT_TYPES = {
  WIN: "win",
  ABANDON: "abandon",
  DRAW: "draw",
  TIE: "tie",
  NO_RESULT: "no-result",
};

export const MATCH_RESULT_TYPES_VALUES = [
  "win",
  "abandon",
  "draw",
  "tie",
  "no-result",
] as const;

export const PLAYER_ROLES = {
  BATTER: "batter",
  BOWLER: "bowler",
  BAT_ALLROUNDER: "bat-allrounder",
  BOWL_ALLROUNDER: "bowl-allrounder",
};

export const PLAYER_ROLES_VALUES = [
  "batter",
  "bowler",
  "bat-allrounder",
  "bowl-allrounder",
] as const;

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
