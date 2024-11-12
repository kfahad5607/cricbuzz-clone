import { QueryFunctionContext, useQuery } from "@tanstack/react-query";
import apiClient from "../services/api-client";
import { MatchVenue, Venue } from "../types/venue";

// types
type QueryKeySeriesMatches = ReturnType<typeof queryKeys.seriesVenues>;

export const queryKeys = {
  venues: ["venues"] as const,
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

export const useVenues = () => {
  return useQuery<Venue[], Error, Venue[]>({
    queryKey: queryKeys.venues,
    queryFn: () => apiClient.get<Venue[]>(`venues`).then((res) => res.data),
    staleTime: Infinity,
    retry: 1,
  });
};
