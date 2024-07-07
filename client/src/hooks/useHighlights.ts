import {
  QueryClient,
  QueryFunctionContext,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import apiClient from "../services/api-client";
import {
  HighlightsData,
  HighlightsDataInnings,
  HighlightsDataRaw,
  type CommentaryInningsTypes,
} from "../types/commentary";
import { SCORECARD_INNINGS_TYPES } from "../types/matchData";
import type { MatchInfo } from "../types/matches";
import { getPlayersMap, matchInfoQueryKeys } from "./useMatchInfo";

// types
type QueryKeyMatch = ReturnType<typeof queryKeys.match>;

export const queryKeys = {
  match: (id: number, inningsType: CommentaryInningsTypes) =>
    ["highlights", id, inningsType] as const,
};

const getHighlights = async (
  context: QueryFunctionContext<QueryKeyMatch>,
  queryClient: QueryClient
) => {
  const [, matchId, inningsType] = context.queryKey;

  const response = await apiClient.get<HighlightsDataRaw>(
    `matches/${matchId}/innings/${inningsType}/highlights`
  );
  const _data = response.data;

  const matchInfo = await queryClient.ensureQueryData<MatchInfo>({
    queryKey: matchInfoQueryKeys.matchInfo(matchId),
  });
  const playersMap = getPlayersMap(matchInfo.homeTeam.players);
  getPlayersMap(matchInfo.awayTeam.players, playersMap);

  const inningsCountMap: Record<number, number> = {};
  const innings: HighlightsDataInnings[] = _data.innings.map(
    (inningsItem, inningsIdx) => {
      const team =
        inningsItem.teamId === matchInfo.homeTeam.id
          ? matchInfo.homeTeam
          : matchInfo.awayTeam;

      inningsCountMap[team.id] = (inningsCountMap[team.id] || 0) + 1;

      return {
        inningsType: SCORECARD_INNINGS_TYPES[inningsIdx],
        teamInningsNo: inningsCountMap[team.id],
        team: {
          id: team.id,
          name: team.name,
          shortName: team.shortName,
        },
      };
    }
  );

  return {
    ..._data,
    innings,
  };
};

const useHighlights = (
  matchId: number,
  inningsType: CommentaryInningsTypes
) => {
  const queryClient = useQueryClient();

  return useQuery<HighlightsData, Error, HighlightsData, QueryKeyMatch>({
    queryKey: queryKeys.match(matchId, inningsType),
    queryFn: (context) => getHighlights(context, queryClient),
    staleTime: 15 * 60 * 1000, // 15 minutes
    retry: 1,
  });
};

export default useHighlights;
