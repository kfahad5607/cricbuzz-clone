import {
  QueryClient,
  QueryFunctionContext,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import apiClient from "../services/api-client";
import type { ScorecardData, ScorecardDataRaw } from "../types/matchData";
import type { MatchInfo } from "../types/matches";
import type { MatchSquadPlayer } from "../types/players";
import {
  addPlayerInfo,
  addPlayerNamesToFow,
  getPlayersMap,
  matchInfoQueryKeys,
} from "./useMatchInfo";

// types
type QueryKeyMatch = ReturnType<typeof queryKeys.match>;

export const queryKeys = {
  match: (id: number) => ["scorecard", id] as const,
};

const getScorecardData = async (
  context: QueryFunctionContext<QueryKeyMatch>,
  queryClient: QueryClient
) => {
  const [, matchId] = context.queryKey;

  const res = await apiClient.get<ScorecardDataRaw>(
    `matches/${matchId}/scorecard`
  );

  const matchInfo = await queryClient.ensureQueryData<MatchInfo>({
    queryKey: matchInfoQueryKeys.matchInfo(matchId),
  });
  const playersMap = getPlayersMap(matchInfo.homeTeam.players);
  getPlayersMap(matchInfo.awayTeam.players, playersMap);

  const _data = res.data;

  const newInnings = _data.innings.map((inningsItem) => {
    const didNotBatBatters: MatchSquadPlayer[] = [];
    const havePlayedBatterIds = new Set<number>();

    inningsItem.batters.forEach((batter) => {
      havePlayedBatterIds.add(batter.id);
    });

    const team =
      inningsItem.teamId === matchInfo.homeTeam.id
        ? matchInfo.homeTeam
        : matchInfo.awayTeam;

    team.players.playingXi.forEach((player) => {
      if (!havePlayedBatterIds.has(player.id)) {
        didNotBatBatters.push(player);
      }
    });
    team.players.substitutes.forEach((player) => {
      if (player.isSubstitute && !havePlayedBatterIds.has(player.id)) {
        didNotBatBatters.push(player);
      }
    });

    const battersWithName = inningsItem.batters.map((batter) => {
      return {
        ...addPlayerInfo(batter, playersMap),
        fallOfWicket: addPlayerNamesToFow(batter.fallOfWicket, playersMap),
      };
    });
    const bowlersWithName = inningsItem.bowlers.map((bowler) => {
      return addPlayerInfo(bowler, playersMap);
    });

    return {
      overs: inningsItem.overs,
      oversBowled: inningsItem.oversBowled,
      score: inningsItem.score,
      wickets: inningsItem.wickets,
      isDeclared: inningsItem.isDeclared,
      isFollowOn: inningsItem.isFollowOn,
      extras: inningsItem.extras,
      team: {
        id: team.id,
        name: team.name,
        shortName: team.shortName,
      },
      batters: battersWithName,
      bowlers: bowlersWithName,
      didNotBatBatters,
    };
  });

  return { ...res.data, innings: newInnings };
};

const useScorecard = (matchId: number) => {
  const queryClient = useQueryClient();

  return useQuery<ScorecardData, Error, ScorecardData, QueryKeyMatch>({
    queryKey: queryKeys.match(matchId),
    queryFn: (context) => getScorecardData(context, queryClient),
    retry: 1,
  });
};

export default useScorecard;
