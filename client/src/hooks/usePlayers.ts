import { keepPreviousData, useQuery } from "@tanstack/react-query";
import apiClient from "../services/api-client";
import { PaginatedResponse } from "../types/common";
import { Player } from "../types/players";

// types

export const queryKeys = {
  players: (query: string, page: number) => ["players", query, page] as const,
};

export const usePlayers = (query: string = "", page: number = 1) => {
  let endpoint = `players?page=${page}`;
  if (query) {
    endpoint += `&query=${query}`;
  }

  return useQuery<PaginatedResponse<Player>, Error, PaginatedResponse<Player>>({
    queryKey: queryKeys.players(query, page),
    queryFn: () =>
      apiClient
        .get<PaginatedResponse<Player>>(endpoint)
        .then((res) => res.data),
    placeholderData: keepPreviousData,
    staleTime: Infinity,
    retry: 1,
  });
};
