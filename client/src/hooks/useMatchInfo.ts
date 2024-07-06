import { useQuery } from "@tanstack/react-query";
import apiClient from "../services/api-client";
import {
  MatchInfo,
  MatchInfoRaw,
  TeamMatchInfoWithPlayers,
} from "../types/matches";
import { MatchSquadPlayer } from "../types/players";

type SelectType<TData> = (data: MatchInfo) => TData;

export const matchInfoQueryKeys = {
  matchInfo: (id: number) => ["matchInfo", id] as const,
};

const transformPlayersList = (players: MatchSquadPlayer[]) => {
  const playingXi: MatchSquadPlayer[] = [];
  const substitutes: MatchSquadPlayer[] = [];
  const bench: MatchSquadPlayer[] = [];

  players.forEach((player) => {
    if (player.isPlaying) {
      playingXi.push(player);
    } else if (player.isInSubs) {
      substitutes.push(player);
    } else {
      bench.push(player);
    }
  });

  return {
    playingXi,
    substitutes,
    bench,
  };
};

const useMatchInfo = <TData = MatchInfo>(
  matchId: number,
  select: SelectType<TData>
) =>
  useQuery<MatchInfo, Error, TData>({
    queryKey: matchInfoQueryKeys.matchInfo(matchId),
    queryFn: () =>
      apiClient.get<MatchInfoRaw>(`matches/${matchId}/info`).then((res) => {
        const homeTeam = res.data.homeTeam as TeamMatchInfoWithPlayers;
        const awayTeam = res.data.awayTeam as TeamMatchInfoWithPlayers;

        homeTeam.players = transformPlayersList(res.data.squads[0].players);
        awayTeam.players = transformPlayersList(res.data.squads[1].players);

        const data = {
          id: res.data.id,
          description: res.data.description,
          matchFormat: res.data.matchFormat,
          startTime: res.data.startTime,
          series: res.data.series,
          venue: res.data.venue,
          homeTeam,
          awayTeam,
        };

        return data;
      }),
    select,
    retry: 1,
  });

export default useMatchInfo;
