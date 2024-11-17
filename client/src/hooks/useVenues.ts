import {
  keepPreviousData,
  QueryFunctionContext,
  useQuery,
} from "@tanstack/react-query";
import apiClient from "../services/api-client";
import { MatchVenue, VenueWithId } from "../types/venue";
import { PaginatedResponse } from "../types/common";
import axios from "axios";

// types
type QueryKeySeriesMatches = ReturnType<typeof queryKeys.seriesVenues>;

export const queryKeys = {
  base: "venues",
  venues: (query: string, page: number) =>
    [queryKeys.base, query, page] as const,
  venue: (id: number) => [queryKeys.base, id] as const,
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

  return useQuery<
    PaginatedResponse<VenueWithId>,
    Error,
    PaginatedResponse<VenueWithId>
  >({
    queryKey: queryKeys.venues(query, page),
    queryFn: () =>
      apiClient
        .get<PaginatedResponse<VenueWithId>>(endpoint)
        .then((res) => res.data),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

export const useVenue = (id: number) => {
  let endpoint = `venues/${id}`;

  return useQuery<VenueWithId, Error, VenueWithId>({
    queryKey: queryKeys.venue(id),
    queryFn: async () => {
      try {
        const response = await apiClient.get<VenueWithId>(endpoint);

        return response.data;
      } catch (err) {
        if (axios.isAxiosError(err)) {
          throw {
            message: err.response?.data?.message || err.message,
          };
        }

        throw err;
      }
    },
    staleTime: 60 * 1000,
    retry: 1,
    enabled: !!id,
  });
};

