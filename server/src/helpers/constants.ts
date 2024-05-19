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
