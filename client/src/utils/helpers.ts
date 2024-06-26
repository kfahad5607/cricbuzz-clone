import { BALLS_IN_OVER } from "./constants";

export const ballNumToOvers = (ballNum: number): number => {
  const rem = ballNum % BALLS_IN_OVER;

  if (rem === 0) return ballNum / BALLS_IN_OVER;

  const overs = (ballNum - rem) / BALLS_IN_OVER;
  const balls = rem / 10;

  return overs + balls;
};

export const oversToballNum = (overs: number): number => {
  const oversArr = overs.toString().split(".");
  const wholeOvers = parseInt(oversArr[0]);
  const balls = oversArr[1] ? Number(oversArr[1]) : 0;

  return wholeOvers * BALLS_IN_OVER + balls;
};

export const formatOversToFloat = (overs: number): number => {
  const oversArr = overs.toString().split(".");
  let wholeOvers = parseInt(oversArr[0]);
  let balls = oversArr[1] ? Number(oversArr[1]) : 0;

  if (balls === 0) {
    balls = BALLS_IN_OVER;
    wholeOvers--;
  }
  balls = balls / 10;

  return wholeOvers + balls;
};

export const formatOversToInt = (overs: number): number => {
  const oversArr = overs.toString().split(".");
  let wholeOvers = parseInt(oversArr[0]);
  let balls = oversArr[1] ? Number(oversArr[1]) : 0;

  if (balls === BALLS_IN_OVER) {
    wholeOvers++;
    balls = 0;
  }
  balls = balls / 10;

  return wholeOvers + balls;
};
