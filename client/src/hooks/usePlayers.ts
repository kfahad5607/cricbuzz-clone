import { keepPreviousData, useQuery } from "@tanstack/react-query";
import apiClient from "../services/api-client";
import { PaginatedResponse } from "../types/common";
import { NewPlayerWithId, Player } from "../types/players";
import axios from "axios";

// types

export const queryKeys = {
  base: "players" as const,
  players: (query: string, page: number) =>
    [queryKeys.base, query, page] as const,
  player: (id: number) => [queryKeys.base, id] as const,
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
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

export const usePlayer = (id: number) => {
  let endpoint = `players/${id}`;

  return useQuery<NewPlayerWithId, Error, NewPlayerWithId>({
    queryKey: queryKeys.player(id),
    queryFn: async () => {
      try {
        const response = await apiClient.get<NewPlayerWithId>(endpoint);

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