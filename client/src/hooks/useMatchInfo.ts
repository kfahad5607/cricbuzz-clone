import { useQuery } from "@tanstack/react-query";
import apiClient from "../services/api-client";
import type { fallOfWicket } from "../types/matchData";
import type {
  MatchInfo,
  MatchInfoRaw,
  TeamMatchInfoWithPlayers,
  TeamSquadPlayers,
} from "../types/matches";
import type { BasicMatchSquadPlayer, MatchSquadPlayer } from "../types/players";

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

export const getPlayersMap = (
  players: TeamSquadPlayers,
  playersMap: Record<
    number,
    Pick<
      MatchSquadPlayer,
      "id" | "name" | "shortName" | "isCaptain" | "isKeeper"
    >
  > = {}
) => {
  const playerKeys: (keyof TeamSquadPlayers)[] = [
    "playingXi",
    "substitutes",
    "bench",
  ];

  playerKeys.forEach((key) => {
    players[key].forEach((player) => {
      playersMap[player.id] = {
        id: player.id,
        name: player.name,
        shortName: player.shortName,
        isCaptain: player.isCaptain,
        isKeeper: player.isKeeper,
      };
    });
  });

  return playersMap;
};

export const addPlayerNamesToFow = (
  fow: fallOfWicket | undefined,
  playersMap: ReturnType<typeof getPlayersMap>
) => {
  if (!fow) return undefined;

  const bowler = fow.bowlerId ? playersMap[fow.bowlerId] : undefined;
  const helpers = fow.helpers.map((helperId) => playersMap[helperId]);

  return { ...fow, helpers, bowler };
};

export const addPlayerInfo = <
  TPlayer extends Pick<BasicMatchSquadPlayer, "id">
>(
  player: TPlayer,
  playersMap: ReturnType<typeof getPlayersMap>
) => ({
  ...player,
  ...playersMap[player.id],
});


const useMatchInfo = <TData = MatchInfo>(
  matchId: number,
  select?: SelectType<TData>
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
