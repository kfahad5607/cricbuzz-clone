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
  venues: (page: number) => ["venues", page] as const,
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

export const useVenues = (page: number = 1) => {
  return useQuery<PaginatedResponse<Venue>, Error, PaginatedResponse<Venue>>({
    queryKey: queryKeys.venues(page),
    queryFn: () =>
      apiClient
        .get<PaginatedResponse<Venue>>(`venues?page=${page}`)
        .then((res) => res.data),
    placeholderData: keepPreviousData,
    staleTime: Infinity,
    retry: 1,
  });
};
