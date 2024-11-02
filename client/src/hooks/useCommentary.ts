import {
  QueryClient,
  QueryFunctionContext,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import apiClient from "../services/api-client";
import {
  COMMENTARY_INNINGS_TYPES,
  type CommentaryDataInnings,
  type CommentaryData,
  type CommentaryDataRaw,
  type CommentaryInningsTypes,
  type CommentaryItem,
  type FullCommentaryData,
  type FullCommentaryDataRaw,
} from "../types/commentary";
import type { MatchInfo, TeamMatchInfo } from "../types/matches";
import {
  addPlayerInfo,
  addPlayerNamesToFow,
  getPlayersMap,
  matchInfoQueryKeys,
} from "./useMatchInfo";
import {
  MatchResultsWithInfo,
  MatchTossResultsWithInfo,
  SCORECARD_INNINGS_TYPES,
} from "../types/matchData";

// types
type QueryKeyMatch = ReturnType<typeof commentaryQueryKeys.match>;
type QueryKeyMatchFull = ReturnType<typeof commentaryQueryKeys.matchFull>;

export const commentaryQueryKeys = {
  match: (id: number) => ["commentary", id] as const,
  matchFull: (id: number, inningsType: CommentaryInningsTypes) =>
    ["fullCommentary", id, inningsType] as const,
};

export const addTeamInfo = (
  teamId: number,
  teams: TeamMatchInfo[]
): TeamMatchInfo | null => {
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

const mergeCommentaryLists = (
  originalList: CommentaryItem[],
  newList: CommentaryItem[]
) => {
  const seenTimestamps = new Set();
  const commentaryList = [...originalList];

  commentaryList.forEach((item) => seenTimestamps.add(item.timestamp));
  newList.forEach((item) => {
    if (!seenTimestamps.has(item.timestamp)) {
      commentaryList.push(item);
    }
  });

  return commentaryList;
};

const getLatestCommentary = async (
  context: QueryFunctionContext<QueryKeyMatch>,
  queryClient: QueryClient
) => {
  const [, matchId] = context.queryKey;
  const response = await apiClient.get<CommentaryDataRaw>(
    `matches/${matchId}/commentary`
  );

  const existingData = queryClient.getQueryData<CommentaryData>(
    context.queryKey
  );

  const matchInfo = await queryClient.ensureQueryData<MatchInfo>({
    queryKey: matchInfoQueryKeys.matchInfo(matchId),
  });

  const data = response.data;
  if (existingData) {
    data.commentaryList = mergeCommentaryLists(
      data.commentaryList,
      existingData.commentaryList
    );
    data.lastFetchedInnings = existingData.lastFetchedInnings;
    data.hasMore = existingData.hasMore;
  }

  const playersMap = getPlayersMap(matchInfo.homeTeam.players);
  getPlayersMap(matchInfo.awayTeam.players, playersMap);

  const batsmanStriker = data.batsmanStriker
    ? {
        ...addPlayerInfo(data.batsmanStriker, playersMap),
        fallOfWicket: addPlayerNamesToFow(
          data.batsmanStriker.fallOfWicket,
          playersMap
        ),
      }
    : undefined;

  const batsmanNonStriker = data.batsmanNonStriker
    ? {
        ...addPlayerInfo(data.batsmanNonStriker, playersMap),
        fallOfWicket: addPlayerNamesToFow(
          data.batsmanNonStriker.fallOfWicket,
          playersMap
        ),
      }
    : undefined;

  const bowlerStriker = data.bowlerStriker
    ? addPlayerInfo(data.bowlerStriker, playersMap)
    : undefined;

  const bowlerNonStriker = data.bowlerNonStriker
    ? addPlayerInfo(data.bowlerNonStriker, playersMap)
    : undefined;

  const innings = data.innings.map((inningsItem) => {
    const team =
      inningsItem.teamId === matchInfo.homeTeam.id
        ? matchInfo.homeTeam
        : matchInfo.awayTeam;

    return {
      team: {
        id: team.id,
        name: team.name,
        shortName: team.shortName,
      },
      overs: inningsItem.overs,
      oversBowled: inningsItem.oversBowled,
      score: inningsItem.score,
      wickets: inningsItem.wickets,
      isDeclared: inningsItem.isDeclared,
      isFollowOn: inningsItem.isFollowOn,
      extras: inningsItem.extras,
    };
  });

  let results: MatchResultsWithInfo | undefined = undefined;
  if (data.results && data.results.resultType === "win") {
    const winningTeam = addTeamInfo(data.results.winningTeamId, [
      matchInfo.homeTeam,
      matchInfo.awayTeam,
    ]);

    if (!winningTeam) throw new Error("Invalid team ID");

    results = {
      ...data.results,
      winningTeam,
    };
  }

  let tossResults: MatchTossResultsWithInfo | undefined = undefined;
  if (data.tossResults) {
    const winnerTeam = addTeamInfo(data.tossResults.tossWinnerId, [
      matchInfo.homeTeam,
      matchInfo.awayTeam,
    ]);

    if (!winnerTeam) throw new Error("Invalid team ID");

    tossResults = {
      winnerTeam,
      decision: data.tossResults.decision,
    };
  }

  return {
    ...data,
    results,
    tossResults,
    innings,
    batsmanStriker,
    batsmanNonStriker,
    bowlerStriker,
    bowlerNonStriker,
  };
};

const getOlderCommentary = async (
  context: QueryFunctionContext<QueryKeyMatch>,
  queryClient: QueryClient
) => {
  const [, matchId] = context.queryKey;
  const existingData = queryClient.getQueryData<CommentaryData>(
    context.queryKey
  );

  if (!existingData) return await getLatestCommentary(context, queryClient);

  const timestamp =
    existingData.commentaryList[existingData.commentaryList.length - 1]
      .timestamp;
  const inningsType = existingData.lastFetchedInnings;

  const response = await apiClient.get<CommentaryDataRaw>(
    `matches/${matchId}/commentary-pagination/${inningsType}/${timestamp}`
  );

  existingData.commentaryList = mergeCommentaryLists(
    existingData.commentaryList,
    response.data.commentaryList
  );

  return existingData;
};

const getFullCommentary = async (
  context: QueryFunctionContext<QueryKeyMatchFull>,
  queryClient: QueryClient
) => {
  const [, matchId, inningsType] = context.queryKey;

  const response = await apiClient.get<FullCommentaryDataRaw>(
    `matches/${matchId}/innings/${inningsType}/full-commentary`
  );
  const _data = response.data;

  const matchInfo = await queryClient.ensureQueryData<MatchInfo>({
    queryKey: matchInfoQueryKeys.matchInfo(matchId),
  });
  const playersMap = getPlayersMap(matchInfo.homeTeam.players);
  getPlayersMap(matchInfo.awayTeam.players, playersMap);

  const inningsCountMap: Record<number, number> = {};
  const innings: CommentaryDataInnings[] = _data.innings.map(
    (inningsItem, inningsIdx) => {
      const team =
        inningsItem.teamId === matchInfo.homeTeam.id
          ? matchInfo.homeTeam
          : matchInfo.awayTeam;

      inningsCountMap[team.id] = (inningsCountMap[team.id] || 0) + 1;

      const batters = inningsItem.batters.map((batter) => {
        return addPlayerInfo(batter, playersMap);
      });
      const bowlers = inningsItem.bowlers.map((bowler) => {
        return addPlayerInfo(bowler, playersMap);
      });

      return {
        inningsType: SCORECARD_INNINGS_TYPES[inningsIdx],
        teamInningsNo: inningsCountMap[team.id],
        batters,
        bowlers,
        team: {
          id: team.id,
          name: team.name,
          shortName: team.shortName,
        },
      };
    }
  );

  if (_data.currentInnings !== "preview" || _data.commentaryList.length > 0) {
    innings.unshift({
      inningsType: COMMENTARY_INNINGS_TYPES[0],
    });
  }

  let tossResults = {} as MatchTossResultsWithInfo;
  if (_data.tossResults.tossWinnerId) {
    const team =
      _data.tossResults.tossWinnerId === matchInfo.homeTeam.id
        ? matchInfo.homeTeam
        : matchInfo.awayTeam;
    tossResults = {
      decision: _data.tossResults.decision,
      winnerTeam: {
        id: team.id,
        name: team.name,
        shortName: team.shortName,
      },
    };
  }

  return {
    ..._data,
    tossResults,
    innings,
  };
};

export const useLatestCommentary = (matchId: number) => {
  const queryClient = useQueryClient();

  return useQuery<CommentaryData, Error, CommentaryData, QueryKeyMatch>({
    queryKey: commentaryQueryKeys.match(matchId),
    queryFn: (context) => getLatestCommentary(context, queryClient),
    refetchInterval: 15000,
    retry: 1,
  });
};

export const useOlderCommentary = (matchId: number) => {
  const queryClient = useQueryClient();

  return useQuery<CommentaryData, Error, CommentaryData, QueryKeyMatch>({
    queryKey: commentaryQueryKeys.match(matchId),
    queryFn: (context) => getOlderCommentary(context, queryClient),
    retry: 1,
  });
};

export const useFullCommentary = (
  matchId: number,
  inningsType: CommentaryInningsTypes
) => {
  const queryClient = useQueryClient();

  return useQuery<
    FullCommentaryData,
    Error,
    FullCommentaryData,
    QueryKeyMatchFull
  >({
    queryKey: commentaryQueryKeys.matchFull(matchId, inningsType),
    queryFn: (context) => getFullCommentary(context, queryClient),
    staleTime: 15 * 60 * 1000, // 15 minutes
    retry: 1,
  });
};
