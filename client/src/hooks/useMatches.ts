import { QueryFunctionContext, useQuery } from "@tanstack/react-query";
import apiClient from "../services/api-client";
import {
  MatchResultsWithInfo,
  MatchTossResultsWithInfo,
} from "../types/matchData";
import type {
  Match,
  MatchCard,
  MatchCardRaw,
  MatchFullCard,
  MatchFullCardRaw,
  MatchType,
  SeriesMatchCard,
  SeriesMatchCardRaw,
} from "../types/matches";
import { addTeamInfo } from "../utils/queries";
import myDayjs from "../services/dayjs";

// types
export type MatchesByDay = {
  day: string;
  matchType: MatchType;
  series: {
    id: number;
    title: string;
    matches: Match[];
  }[];
};
export type ScheduleType = "live" | "recent" | "upcoming";
type QueryKeySeriesMatches = ReturnType<typeof queryKeys.seriesMatches>;
type QueryKeyScheduledMatches = ReturnType<typeof queryKeys.scheduledMatches>;

export const queryKeys = {
  currentMatches: ["currentMatches"] as const,
  liveMatches: ["liveMatches"] as const,
  matchesByDay: ["matchesByDay"] as const,
  scheduledMatches: (scheduleType: ScheduleType) =>
    ["matches", scheduleType] as const,
  seriesMatches: (id: number) => ["seriesMatches", id] as const,
};

const getCurrentMatches = async () => {
  const response = await apiClient.get<MatchCardRaw[]>("matches/current");

  const data = response.data;

  const enrichedData = data.map((match) => {
    const innings = match.innings.map((inningsItem) => {
      const team =
        inningsItem.teamId === match.homeTeam.id
          ? match.homeTeam
          : match.awayTeam;

      return {
        team: {
          id: team.id,
          name: team.name,
          shortName: team.shortName,
        },
        overs: inningsItem.overs,
        oversBowled: inningsItem.oversBowled,
        score: inningsItem.score,
        wickets: inningsItem.wickets,
      };
    });

    let results: MatchResultsWithInfo | undefined = undefined;
    if (match.results && match.results.resultType === "win") {
      const winningTeam = addTeamInfo(match.results.winningTeamId, [
        match.homeTeam,
        match.awayTeam,
      ]);

      if (!winningTeam) throw new Error("Invalid team ID");

      results = {
        ...match.results,
        winningTeam,
      };
    }

    let tossResults: MatchTossResultsWithInfo | undefined = undefined;
    if (match.tossResults) {
      const winnerTeam = addTeamInfo(match.tossResults.tossWinnerId, [
        match.homeTeam,
        match.awayTeam,
      ]);

      if (!winnerTeam) throw new Error("Invalid team ID");

      tossResults = {
        winnerTeam,
        decision: match.tossResults.decision,
      };
    }

    return {
      ...match,
      innings,
      results,
      tossResults,
    };
  });

  return enrichedData;
};

const getScheduledMatches = async (
  context: QueryFunctionContext<QueryKeyScheduledMatches>
) => {
  const [, scheduleType] = context.queryKey;
  const response = await apiClient.get<MatchFullCardRaw[]>(
    `matches/${scheduleType}`
  );

  const data = response.data;

  const enrichedData = data.map((match) => {
    const innings = match.innings.map((inningsItem) => {
      const team =
        inningsItem.teamId === match.homeTeam.id
          ? match.homeTeam
          : match.awayTeam;

      return {
        team: {
          id: team.id,
          name: team.name,
          shortName: team.shortName,
        },
        overs: inningsItem.overs,
        oversBowled: inningsItem.oversBowled,
        score: inningsItem.score,
        wickets: inningsItem.wickets,
      };
    });

    let results: MatchResultsWithInfo | undefined = undefined;
    if (match.results && match.results.resultType === "win") {
      const winningTeam = addTeamInfo(match.results.winningTeamId, [
        match.homeTeam,
        match.awayTeam,
      ]);

      if (!winningTeam) throw new Error("Invalid team ID");

      results = {
        ...match.results,
        winningTeam,
      };
    }

    let tossResults: MatchTossResultsWithInfo | undefined = undefined;
    if (match.tossResults) {
      const winnerTeam = addTeamInfo(match.tossResults.tossWinnerId, [
        match.homeTeam,
        match.awayTeam,
      ]);

      if (!winnerTeam) throw new Error("Invalid team ID");

      tossResults = {
        winnerTeam,
        decision: match.tossResults.decision,
      };
    }

    return {
      ...match,
      innings,
      results,
      tossResults,
    };
  });

  return enrichedData;
};

const getSeriesMatches = async (
  context: QueryFunctionContext<QueryKeySeriesMatches>
) => {
  const [, seriesId] = context.queryKey;
  const response = await apiClient.get<SeriesMatchCardRaw[]>(
    `series/${seriesId}/matches`
  );

  const data = response.data;

  const enrichedData = data.map((match) => {
    const innings = match.innings.map((inningsItem) => {
      const team =
        inningsItem.teamId === match.homeTeam.id
          ? match.homeTeam
          : match.awayTeam;

      return {
        team: {
          id: team.id,
          name: team.name,
          shortName: team.shortName,
        },
        overs: inningsItem.overs,
        oversBowled: inningsItem.oversBowled,
        score: inningsItem.score,
        wickets: inningsItem.wickets,
      };
    });

    let results: MatchResultsWithInfo | undefined = undefined;
    if (match.results && match.results.resultType === "win") {
      const winningTeam = addTeamInfo(match.results.winningTeamId, [
        match.homeTeam,
        match.awayTeam,
      ]);

      if (!winningTeam) throw new Error("Invalid team ID");

      results = {
        ...match.results,
        winningTeam,
      };
    }

    let tossResults: MatchTossResultsWithInfo | undefined = undefined;
    if (match.tossResults) {
      const winnerTeam = addTeamInfo(match.tossResults.tossWinnerId, [
        match.homeTeam,
        match.awayTeam,
      ]);

      if (!winnerTeam) throw new Error("Invalid team ID");

      tossResults = {
        winnerTeam,
        decision: match.tossResults.decision,
      };
    }

    return {
      ...match,
      innings,
      results,
      tossResults,
    };
  });

  return enrichedData;
};

const getMatchesByDay = async () => {
  const response = await apiClient.get<Match[]>("matches/by-day");

  const data = response.data;

  const matchesByDay: MatchesByDay[] = [];
  const indexMap: Record<
    string,
    {
      idx: number;
      series: Record<string, number>;
    }
  > = {};

  data.forEach((match) => {
    const startTime = myDayjs(match.startTime).utc().local();
    const day = startTime.format("ddd, MMM DD YYYY");
    const seriesTitle = match.series.title;

    let idxData = indexMap[day];

    let dayIdx;
    let seriesIdx;
    if (idxData === undefined) {
      dayIdx = matchesByDay.length;
      seriesIdx = 0;
      indexMap[day] = {
        idx: dayIdx,
        series: {
          [seriesTitle]: seriesIdx,
        },
      };

      matchesByDay.push({
        day,
        matchType: match.series.seriesType,
        series: [
          {
            id: match.series.id,
            title: seriesTitle,
            matches: [],
          },
        ],
      });
    } else if (idxData.series[seriesTitle] === undefined) {
      dayIdx = idxData.idx;
      seriesIdx = matchesByDay[dayIdx].series.length;
      idxData.series[seriesTitle] = seriesIdx;
      // indexMap[day].series[seriesTitle] = seriesIdx;

      matchesByDay[dayIdx].series.push({
        id: match.series.id,
        title: seriesTitle,
        matches: [],
      });
    } else {
      dayIdx = idxData.idx;
      seriesIdx = idxData.series[seriesTitle];
    }
    matchesByDay[dayIdx].series[seriesIdx].matches.push(match);
  });

  return matchesByDay;
};

export const useCurrentMatches = () => {
  return useQuery<MatchCard[], Error, MatchCard[]>({
    queryKey: queryKeys.currentMatches,
    queryFn: getCurrentMatches,
    staleTime: 15 * 60 * 1000, // 15 minutes
    retry: 1,
  });
};

export const useScheduledMatches = (scheduleType: ScheduleType) => {
  return useQuery<
    MatchFullCard[],
    Error,
    MatchFullCard[],
    QueryKeyScheduledMatches
  >({
    queryKey: queryKeys.scheduledMatches(scheduleType),
    queryFn: (context) => getScheduledMatches(context),
    staleTime: 15 * 60 * 1000, // 15 minutes
    retry: 1,
  });
};

export const useSeriesMatches = (seriesId: number) => {
  return useQuery<
    SeriesMatchCard[],
    Error,
    SeriesMatchCard[],
    QueryKeySeriesMatches
  >({
    queryKey: queryKeys.seriesMatches(seriesId),
    queryFn: (context) => getSeriesMatches(context),
    staleTime: Infinity,
    retry: 1,
  });
};

export const useMatchesByDay = () => {
  return useQuery<MatchesByDay[], Error, MatchesByDay[]>({
    queryKey: queryKeys.matchesByDay,
    queryFn: getMatchesByDay,
    staleTime: 15 * 60 * 1000, // 15 minutes
    retry: 1,
  });
};