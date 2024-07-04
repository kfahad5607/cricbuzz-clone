import {
  QueryClient,
  QueryFunctionContext,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import apiClient from "../services/api-client";
import { CommentaryData, CommentaryItem } from "../types/commentary";

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
  const response = await apiClient.get<CommentaryData>(
    `matches/${matchId}/commentary`
  );

  const existingData = queryClient.getQueryData<CommentaryData>(
    context.queryKey
  );

  if (existingData) {
    response.data.commentaryList = mergeCommentaryLists(
      response.data.commentaryList,
      existingData.commentaryList
    );
    response.data.lastFetchedInnings = existingData.lastFetchedInnings;
    response.data.hasMore = existingData.hasMore;
  }

  return response.data;
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

  const response = await apiClient.get<CommentaryData>(
    `matches/${matchId}/commentary-pagination/${inningsType}/${timestamp}`
  );

  response.data.commentaryList = mergeCommentaryLists(
    existingData.commentaryList,
    response.data.commentaryList
  );

  return response.data;
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
