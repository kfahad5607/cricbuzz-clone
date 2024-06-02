import { useQuery } from "@tanstack/react-query";
import apiClient from "../services/api-client";
import { MatchInfo } from "../types/matches";

const useMatchInfo = (matchId: number) =>
  useQuery<MatchInfo>({
    queryKey: ["matchInfo", matchId],
    queryFn: () =>
      apiClient.get(`matches/${matchId}/info`).then((res) => res.data),
    retry: 1,
  });
export default useMatchInfo;
