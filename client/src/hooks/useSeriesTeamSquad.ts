import { QueryFunctionContext, useQuery } from "@tanstack/react-query";
import apiClient from "../services/api-client";
import { SeriesTeamSquad, SeriesTeamSquadRaw } from "../types/series";
import { PLAYER_ROLES } from "../utils/constants";
import { MatchFormat } from "../types/matches";

// types
type QueryKeyMatch = ReturnType<typeof seriesInfoQueryKeys.seriesTeamSquad>;

export const seriesInfoQueryKeys = {
  seriesTeamSquad: (
    seriesId: number,
    teamId: number,
    matchFormat: MatchFormat
  ) => ["series", seriesId, "squad", teamId, matchFormat] as const,
};

const getTeamSquad = async (context: QueryFunctionContext<QueryKeyMatch>) => {
  const [, seriesId, , teamId, matchFormat] = context.queryKey;
  const response = await apiClient.get<SeriesTeamSquadRaw>(
    `series/${seriesId}/squad/${teamId}/${matchFormat}`
  );

  const data = response.data;
  const playerByRoles: SeriesTeamSquad["playerByRoles"] = [
    {
      title: "BATTERS",
      players: [],
    },
    {
      title: "ALL ROUNDERS",
      players: [],
    },
    {
      title: "WICKET KEEPERS",
      players: [],
    },
    {
      title: "BOWLERS",
      players: [],
    },
  ];

  const rolesIndices = {
    [PLAYER_ROLES.BATTER]: 0,
    [PLAYER_ROLES.BAT_ALLROUNDER]: 1,
    [PLAYER_ROLES.BOWL_ALLROUNDER]: 1,
    [PLAYER_ROLES.WK_BATTER]: 2,
    [PLAYER_ROLES.BOWLER]: 3,
  };

  data.players.forEach((player) => {
    playerByRoles[rolesIndices[player.roleInfo.role]].players.push(player);
  });

  return {
    teamId: data.teamId,
    playerByRoles,
  };
};

const useSeriesTeamSquad = (
  seriesId: number,
  teamId: number,
  matchFormat: MatchFormat
) =>
  useQuery<SeriesTeamSquad, Error, SeriesTeamSquad, QueryKeyMatch>({
    queryKey: seriesInfoQueryKeys.seriesTeamSquad(
      seriesId,
      teamId,
      matchFormat
    ),
    queryFn: (context) => getTeamSquad(context),
    retry: 1,
    staleTime: 15 * 60 * 1000,
    enabled: teamId > 0,
  });

export default useSeriesTeamSquad;
