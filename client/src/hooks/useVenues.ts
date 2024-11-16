import {
  keepPreviousData,
  QueryFunctionContext,
  useQuery,
} from "@tanstack/react-query";
import apiClient from "../services/api-client";
import { MatchVenue, Venue } from "../types/venue";
import { PaginatedResponse } from "../types/common";

// types
type QueryKeySeriesMatches = ReturnType<typeof queryKeys.seriesVenues>;

export const queryKeys = {
  venues: (query: string, page: number) => ["venues", query, page] as const,
  seriesVenues: (id: number) => ["seriesVenues", id] as const,
};

const getSeriesVenues = async (
  context: QueryFunctionContext<QueryKeySeriesMatches>
) => {
  const [, seriesId] = context.queryKey;
  const response = await apiClient.get<MatchVenue[]>(
    `series/${seriesId}/venues`
  );

  return response.data;
};

export const useSeriesVenues = (seriesId: number) => {
  return useQuery<MatchVenue[], Error, MatchVenue[], QueryKeySeriesMatches>({
    queryKey: queryKeys.seriesVenues(seriesId),
    queryFn: (context) => getSeriesVenues(context),
    staleTime: Infinity,
    retry: 1,
  });
};

export const useVenues = (query: string = "", page: number = 1) => {
  let endpoint = `venues?page=${page}`;
  if (query) {
    endpoint += `&query=${query}`;
  }

  return useQuery<PaginatedResponse<Venue>, Error, PaginatedResponse<Venue>>({
    queryKey: queryKeys.venues(query, page),
    queryFn: () =>
      apiClient.get<PaginatedResponse<Venue>>(endpoint).then((res) => res.data),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};
