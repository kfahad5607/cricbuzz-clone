import { BALLS_IN_OVER } from "./constants";

export const isObjEmpty = (obj: Record<PropertyKey, unknown>) => {
  return Object.keys(obj).length === 0;
};

export const oversToballNum = (overs: number): number => {
  const oversArr = overs.toString().split(".");
  const wholeOvers = parseInt(oversArr[0]);
  const balls = oversArr[1] ? Number(oversArr[1]) : 0;

  return wholeOvers * BALLS_IN_OVER + balls;
};
