import {
  QueryClient,
  QueryFunctionContext,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import apiClient from "../services/api-client";
import type {
  CommentaryData,
  CommentaryDataRaw,
  CommentaryItem,
} from "../types/commentary";
import type { MatchInfo } from "../types/matches";
import {
  addPlayerName,
  addPlayerNamesToFow,
  getPlayersMap,
  matchInfoQueryKeys,
} from "./useMatchInfo";

// types
type QueryKeyMatch = ReturnType<typeof commentaryQueryKeys.match>;

export const commentaryQueryKeys = {
  match: (id: number) => ["commentary", id] as const,
};

const mergeCommentaryLists = (
  originalList: CommentaryItem[],
  newList: CommentaryItem[]
) => {
  const seenTimestamps = new Set();
  const commentaryList = [...originalList];

  commentaryList.forEach((item) => seenTimestamps.add(item.timestamp));
  newList.forEach((item) => {
    if (!seenTimestamps.has(item.timestamp)) {
      commentaryList.push(item);
    }
  });

  return commentaryList;
};

const getLatestCommentary = async (
  context: QueryFunctionContext<QueryKeyMatch>,
  queryClient: QueryClient
) => {
  const [, matchId] = context.queryKey;
  const response = await apiClient.get<CommentaryDataRaw>(
    `matches/${matchId}/commentary`
  );

  const existingData = queryClient.getQueryData<CommentaryData>(
    context.queryKey
  );

  const matchInfo = await queryClient.ensureQueryData<MatchInfo>({
    queryKey: matchInfoQueryKeys.matchInfo(matchId),
  });

  const data = response.data;
  if (existingData) {
    data.commentaryList = mergeCommentaryLists(
      data.commentaryList,
      existingData.commentaryList
    );
    data.lastFetchedInnings = existingData.lastFetchedInnings;
    data.hasMore = existingData.hasMore;
  }

  const playersMap = getPlayersMap(matchInfo.homeTeam.players);
  getPlayersMap(matchInfo.awayTeam.players, playersMap);

  const batsmanStriker = data.batsmanStriker
    ? {
        ...addPlayerName(data.batsmanStriker, playersMap),
        fallOfWicket: addPlayerNamesToFow(
          data.batsmanStriker.fallOfWicket,
          playersMap
        ),
      }
    : undefined;

  const batsmanNonStriker = data.batsmanNonStriker
    ? {
        ...addPlayerName(data.batsmanNonStriker, playersMap),
        fallOfWicket: addPlayerNamesToFow(
          data.batsmanNonStriker.fallOfWicket,
          playersMap
        ),
      }
    : undefined;

  const bowlerStriker = data.bowlerStriker
    ? addPlayerName(data.bowlerStriker, playersMap)
    : undefined;

  const bowlerNonStriker = data.bowlerNonStriker
    ? addPlayerName(data.bowlerNonStriker, playersMap)
    : undefined;

  const innings = data.innings.map((inningsItem) => {
    const team =
      inningsItem.teamId === matchInfo.homeTeam.id
        ? matchInfo.homeTeam
        : matchInfo.awayTeam;

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
      isDeclared: inningsItem.isDeclared,
      isFollowOn: inningsItem.isFollowOn,
      extras: inningsItem.extras,
    };
  });

  return {
    ...data,
    innings,
    batsmanStriker,
    batsmanNonStriker,
    bowlerStriker,
    bowlerNonStriker,
  };
};

export const getOlderCommentary = async (
  context: QueryFunctionContext<QueryKeyMatch>,
  queryClient: QueryClient
) => {
  const [, matchId] = context.queryKey;
  const existingData = queryClient.getQueryData<CommentaryData>(
    context.queryKey
  );

  if (!existingData) return await getLatestCommentary(context, queryClient);

  const timestamp =
    existingData.commentaryList[existingData.commentaryList.length - 1]
      .timestamp;
  const inningsType = existingData.lastFetchedInnings;

  const response = await apiClient.get<CommentaryDataRaw>(
    `matches/${matchId}/commentary-pagination/${inningsType}/${timestamp}`
  );

  existingData.commentaryList = mergeCommentaryLists(
    existingData.commentaryList,
    response.data.commentaryList
  );

  return existingData;
};

export const useLatestCommentary = (matchId: number) => {
  const queryClient = useQueryClient();

  return useQuery<CommentaryData, Error, CommentaryData, QueryKeyMatch>({
    queryKey: commentaryQueryKeys.match(matchId),
    queryFn: (context) => getLatestCommentary(context, queryClient),
    refetchInterval: 15000,
    retry: 1,
  });
};

export const useOlderCommentary = (matchId: number) => {
  const queryClient = useQueryClient();

  return useQuery<CommentaryData, Error, CommentaryData, QueryKeyMatch>({
    queryKey: commentaryQueryKeys.match(matchId),
    queryFn: (context) => getOlderCommentary(context, queryClient),
    retry: 1,
  });
};
