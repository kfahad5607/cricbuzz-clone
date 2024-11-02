import myDayjs from "../services/dayjs";
import { StatusColor } from "../components/MatchStatus";
import { MatchState } from "../types/matchData";
import { BALLS_IN_OVER, DATE_TIME_FORMAT, MATCH_STATES } from "./constants";

const roundNumbers = (num: number, decimalPlaces: number = 2) => {
  const factor = Math.pow(10, decimalPlaces);
  return Math.round((num + Number.EPSILON) * factor) / factor;
};

export const getStatusTextColor = (state: MatchState) => {
  let statusColor: StatusColor = "red";
  if (state === MATCH_STATES.COMPLETE) statusColor = "blue";
  else if (MATCH_STATES.PREVIEW === state || MATCH_STATES.TOSS === state)
    statusColor = "yellow";

  return statusColor;
};

export const formatDateTime = (dateTime: string, format = DATE_TIME_FORMAT) => {
  return myDayjs(dateTime).format(format);
};

export const getNumberWithOrdinal = (n: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;

  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

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

export const getRunRate = (runs: number, balls: number) => {
  if (balls < 1) return 0;

  const runRate = (runs * BALLS_IN_OVER) / balls;
  return roundNumbers(runRate);
};

export const getStrikeRate = (runs: number, balls: number) => {
  if (balls === 0) return 0;

  return roundNumbers((runs * 100) / balls).toFixed(2);
};

export const getEconomyRate = (runs: number, overs: number) => {
  if (overs === 0) return 0;

  return roundNumbers((runs * BALLS_IN_OVER) / oversToballNum(overs)).toFixed(
    2
  );
};
