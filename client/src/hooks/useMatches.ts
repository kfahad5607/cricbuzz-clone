import { QueryFunctionContext, useQuery } from "@tanstack/react-query";
import apiClient from "../services/api-client";
import {
  MatchResultsWithInfo,
  MatchTossResultsWithInfo,
} from "../types/matchData";
import type {
  MatchCard,
  MatchCardRaw,
  MatchFullCard,
  MatchFullCardRaw,
  SeriesMatchCard,
  SeriesMatchCardRaw,
} from "../types/matches";
import { addTeamInfo } from "../utils/queries";

// types
type QueryKeySeriesMatches = ReturnType<typeof queryKeys.seriesMatches>;

export const queryKeys = {
  currentMatches: ["currentMatches"] as const,
  liveMatches: ["liveMatches"] as const,
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

const getLiveMatches = async () => {
  const response = await apiClient.get<MatchFullCardRaw[]>("matches/live");

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

export const useCurrentMatches = () => {
  return useQuery<MatchCard[], Error, MatchCard[]>({
    queryKey: queryKeys.currentMatches,
    queryFn: getCurrentMatches,
    staleTime: 15 * 60 * 1000, // 15 minutes
    retry: 1,
  });
};

export const useLiveMatches = () => {
  return useQuery<MatchFullCard[], Error, MatchFullCard[]>({
    queryKey: queryKeys.liveMatches,
    queryFn: getLiveMatches,
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
