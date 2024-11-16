import { keepPreviousData, useQuery } from "@tanstack/react-query";
import apiClient from "../services/api-client";
import { PaginatedResponse } from "../types/common";
import { Team } from "../types/teams";

// types
export const queryKeys = {
  teams: (query: string, page: number) => ["team", query, page] as const,
};

export const useTeams = (query: string = "", page: number = 1) => {
  let endpoint = `teams?page=${page}`;
  if (query) {
    endpoint += `&query=${query}`;
  }

  return useQuery<PaginatedResponse<Team>, Error, PaginatedResponse<Team>>({
    queryKey: queryKeys.teams(query, page),
    queryFn: () =>
      apiClient.get<PaginatedResponse<Team>>(endpoint).then((res) => res.data),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};
