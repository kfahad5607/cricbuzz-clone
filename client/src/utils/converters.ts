import slugify from "slugify";
import { StatusColor } from "../components/MatchStatus";
import myDayjs from "../services/dayjs";
import {
  BaseScorecardInnings,
  MatchResultsWithInfo,
  MatchState,
  MatchTossResultsWithInfo,
} from "../types/matchData";
import { MatchCard, TeamMatchInfo } from "../types/matches";
import { Series } from "../types/series";
import { BALLS_IN_OVER, DATE_TIME_FORMAT, MATCH_STATES } from "./constants";

type MatchStatusData = {
  state: MatchState;
  status: string;
  tossResults?: MatchTossResultsWithInfo;
  results?: MatchResultsWithInfo;
  innings: ({
    team: TeamMatchInfo;
  } & Pick<BaseScorecardInnings, "score">)[];
};

type MatchSlugInput = {
  homeTeam: MatchCard["homeTeam"];
  awayTeam: MatchCard["awayTeam"];
  description: MatchCard["description"];
  series: Pick<Series, "title">;
};

export const getSeriesURL = (id: number, title: string): string => {
  return `/series/${id}/${slugify(title)}`;
};

export const getMatchSlug = (data: MatchSlugInput): string => {
  const { homeTeam, awayTeam, description, series } = data;
  const slugInput = `${homeTeam.shortName}-vs-${awayTeam.shortName}-${description}-${series.title}`;

  return slugify(slugInput, { lower: true });
};

export const getStatusText = (data: MatchStatusData) => {
  if (data.status) return data.status;

  if (data.state === "innings-break") return "Innings Break";
  if (data.state === "preview") return "";
  if (data.state === "toss" || data.innings.length === 1)
    return `${data.tossResults?.winnerTeam.name} opt to ${data.tossResults?.decision}`;

  if (data.state === "complete" && data.results?.resultType === "win") {
    const results = data.results;
    const marginType = results.winByRuns ? "runs" : "wkts";

    return `${results.winningTeam.name} won by ${results.winningMargin} ${marginType}`;
  }
  if (data.state === "abandon") {
    return `Match abandoned`;
  }

  if (data.innings.length === 2) {
    const innings = data.innings[1];
    const target = data.innings[0].score - innings.score + 1;
    return `${innings.team.name} need ${target} runs`;
  }
};

export const getStatusTextColor = (state: MatchState) => {
  let statusColor: StatusColor = "red";
  if (MATCH_STATES.COMPLETE === state || MATCH_STATES.ABANDON === state)
    statusColor = "blue";
  else if (MATCH_STATES.PREVIEW === state || MATCH_STATES.TOSS === state)
    statusColor = "yellow";

  return statusColor;
};

const roundNumbers = (num: number, decimalPlaces: number = 2) => {
  const factor = Math.pow(10, decimalPlaces);
  return Math.round((num + Number.EPSILON) * factor) / factor;
};

export const formatDateTime = (dateTime: string, format = DATE_TIME_FORMAT) => {
  return myDayjs(dateTime).utc().local().format(format);
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

export const generatePagination = (
  currentPage: number,
  pageSize: number,
  totalRecords: number
) => {
  const totalPages = Math.ceil(totalRecords / pageSize);
  const maxButtons = 7;
  const buttons = [];

  if (totalPages) return [];

  const addRange = (start: number, end: number) => {
    for (let i = start; i <= end; i++) {
      buttons.push(i);
    }
  };

  if (totalPages <= maxButtons) {
    addRange(1, totalPages);
  } else {
    if (currentPage <= 4) {
      addRange(1, 5);
      buttons.push("...");
      buttons.push(totalPages);
    } else if (currentPage >= totalPages - 3) {
      buttons.push(1);
      buttons.push("...");
      addRange(totalPages - 4, totalPages);
    } else {
      buttons.push(1);
      buttons.push("...");
      addRange(currentPage - 1, currentPage + 1);
      buttons.push("...");
      buttons.push(totalPages);
    }
  }

  return buttons;
};
