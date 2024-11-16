import { FallOfWicket } from "../types/matchData";
import { TeamSquadPlayers } from "../types/matches";
import { BasicMatchSquadPlayer, MatchSquadPlayer } from "../types/players";
import { Team } from "../types/teams";

export const matchInfoQueryKeys = {
  matchInfo: (id: number) => ["matchInfo", id] as const,
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

export const addPlayerInfo = <
  TPlayer extends Pick<BasicMatchSquadPlayer, "id">
>(
  player: TPlayer,
  playersMap: ReturnType<typeof getPlayersMap>
) => ({
  ...player,
  ...playersMap[player.id],
});

export const addPlayerNamesToFow = (
  fow: FallOfWicket | undefined,
  playersMap: ReturnType<typeof getPlayersMap>
) => {
  if (!fow) return undefined;

  const bowler = fow.bowlerId ? playersMap[fow.bowlerId] : undefined;
  const helpers = fow.helpers.map((helperId) => playersMap[helperId]);

  return { ...fow, helpers, bowler };
};

export const addTeamInfo = (teamId: number, teams: Team[]): Team | null => {
  for (let i = 0; i < teams.length; i++) {
    const team = teams[i];

    if (team.id === teamId) {
      return {
        id: team.id,
        name: team.name,
        shortName: team.shortName,
      };
    }
  }

  return null;
};
