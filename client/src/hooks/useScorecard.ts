import { useQuery } from "@tanstack/react-query";
import apiClient from "../services/api-client";
import { ScorecardData } from "../types/matchData";

// types
type QueryKeyMatch = ReturnType<typeof queryKeys.match>;

export const queryKeys = {
  match: (id: number) => ["scorecard", id] as const,
};

const useScorecard = (matchId: number) => {
  return useQuery<ScorecardData, Error, ScorecardData, QueryKeyMatch>({
    queryKey: queryKeys.match(matchId),
    queryFn: () =>
      apiClient
        .get<ScorecardData>(`matches/${matchId}/scorecard`)
        .then((res) => res.data),
    retry: 1,
  });
};

export default useScorecard;
