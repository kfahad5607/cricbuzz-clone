import queryClient from "../api/client";
import { MatchInfo } from "../types/matches";

export const getTeamById = (teamId: number, matchId: number) => {
  const matchInfo = queryClient.getQueryData<MatchInfo>(["matchInfo", matchId]);

  if (matchInfo) {
    if (matchInfo.homeTeam.id === teamId) return matchInfo.homeTeam;
    if (matchInfo.awayTeam.id === teamId) return matchInfo.awayTeam;
  }

  return null;
};
