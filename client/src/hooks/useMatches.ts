import { useQuery } from "@tanstack/react-query";
import apiClient from "../services/api-client";
import type { MatchCard } from "../types/matches";

// types

export const queryKeys = {
  currentMatches: ["currentMatches"] as const,
};

const getCurrentMatches = async () => {
  const response = await apiClient.get<MatchCard[]>("matches/current");
  return response.data;
};

export const useCurrentMatches = () => {
  return useQuery<MatchCard[], Error, MatchCard[]>({
    queryKey: queryKeys.currentMatches,
    queryFn: getCurrentMatches,
    staleTime: 15 * 60 * 1000, // 15 minutes
    retry: 1,
  });
};
