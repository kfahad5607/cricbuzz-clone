import {
  CommentaryItem,
  Match,
  MatchSquad,
  MatchSquadPlayer,
  Optional,
  SeriesWithId,
  TeamSquad,
} from "../../../types";
import { Scorecard as ScorecardType } from "../../../types/scorecard";
import Commentary from "../../mongo/schema/commentary";
import MatchSquads from "../../mongo/schema/matchSquad";
import Scorecard from "../../mongo/schema/scorecard";
import { db } from "../../postgres";
import * as tables from "../../postgres/schema";
import { BASE_DATA_PATH } from "./helpers/constants";
import { readDirectory, readFileData, writeFileData } from "./helpers/file";

// types
type Entities = "venues" | "series" | "teams" | "players";
type IdsMap = Record<number, number>;

type inningsScoreItem = {
  inningsId: number;
  batTeamId: number;
};
type InfoData = Match & {
  inningsScoreList: inningsScoreItem[];
};

type SquadsData = {
  homeTeam: TeamSquad<MatchSquadPlayer>;
  awayTeam: TeamSquad<MatchSquadPlayer>;
};

type SeriesWithOptionalId = Optional<SeriesWithId, "id">;
type SeriesData = Record<number, SeriesWithOptionalId>;

const BASE_PATH = BASE_DATA_PATH + "series/";

const getIdsMap = async (entity: Entities): Promise<IdsMap> => {
  try {
    const idsMapContents = await readFileData(
      `${BASE_DATA_PATH}${entity}/idsMap.json`
    );

    if (!idsMapContents) throw new Error("");

    return JSON.parse(idsMapContents);
  } catch (err) {
    throw new Error(`No ${entity} ids map data found to seed...`);
  }
};

const getMatchCommentary = async (
  seriesId: number,
  matchId: number,
  inningsId: number
): Promise<CommentaryItem[]> => {
  try {
    const path = `${BASE_PATH}${seriesId}/matches/${matchId}/commentary/${inningsId}.json`;

    const contents = await readFileData(path);

    if (!contents) throw new Error("");

    return JSON.parse(contents);
  } catch (err) {
    throw new Error(
      `No commentary found for match ${matchId} and innings ${inningsId}...`
    );
  }
};

const seedMatch = async (seriesId: number, matchId: number) => {
  try {
    console.log("Seeding match started...");
    const BASE_MATCH_PATH = `${BASE_PATH}${seriesId}/matches/${matchId}/`;

    const venueIdsMap = await getIdsMap("venues");
    const seriesIdsMap = await getIdsMap("series");
    const teamIdsMap = await getIdsMap("teams");
    const playerIdsMap = await getIdsMap("players");

    const infoContents = await readFileData(BASE_MATCH_PATH + "info.json");

    if (!infoContents) {
      console.log("No match info data found to seed...");
      return;
    }

    const infoData: InfoData = JSON.parse(infoContents);

    const squadsContents = await readFileData(BASE_MATCH_PATH + "squads.json");

    if (!squadsContents) {
      console.log("No match squads data found to seed...");
      return;
    }

    const squadsData: SquadsData = JSON.parse(squadsContents);

    const scorecardContents = await readFileData(
      BASE_MATCH_PATH + "scorecard.json"
    );

    if (!scorecardContents) {
      console.log("No match scorecard data found to seed...");
      return;
    }

    const scorecardData: ScorecardType = JSON.parse(scorecardContents);

    const tossResults = infoData.tossResults;
    if (tossResults.tossWinnerId)
      tossResults.tossWinnerId = teamIdsMap[tossResults.tossWinnerId];

    const matchResults = infoData.results;
    if (matchResults.winningTeamId)
      matchResults.winningTeamId = teamIdsMap[matchResults.winningTeamId];

    const newMatch: Match = {
      description: infoData.description,
      matchFormat: infoData.matchFormat,
      matchType: infoData.matchType,
      matchNumber: infoData.matchNumber,
      homeTeam: teamIdsMap[infoData.homeTeam],
      awayTeam: teamIdsMap[infoData.awayTeam],
      series: seriesIdsMap[infoData.series],
      venue: venueIdsMap[infoData.venue],
      startTime: new Date(infoData.startTime),
      state: infoData.state,
      status: "",
      tossResults: tossResults,
      results: matchResults,
    };

    const insertedMatch = await db
      .insert(tables.matches)
      .values(newMatch)
      .returning({ id: tables.matches.id });
    const insertedMatchId = insertedMatch[0].id;

    const homeTeamSquad: TeamSquad<MatchSquadPlayer> = squadsData.homeTeam;
    const awayTeamSquad: TeamSquad<MatchSquadPlayer> = squadsData.awayTeam;

    homeTeamSquad.teamId = teamIdsMap[homeTeamSquad.teamId];
    homeTeamSquad.players.forEach((player) => {
      player.playerId = playerIdsMap[player.playerId];
    });

    awayTeamSquad.teamId = teamIdsMap[awayTeamSquad.teamId];
    awayTeamSquad.players.forEach((player) => {
      player.playerId = playerIdsMap[player.playerId];
    });

    const matchSquad: MatchSquad<MatchSquadPlayer> = {
      matchId: insertedMatchId,
      teams: [homeTeamSquad, awayTeamSquad],
    };

    scorecardData.matchId = insertedMatchId;
    for (const inningsKey in scorecardData.innings) {
      const currentInnings =
        scorecardData.innings[inningsKey as keyof ScorecardType["innings"]];

      if (!currentInnings) continue;

      currentInnings.teamId = teamIdsMap[currentInnings.teamId];

      currentInnings.batters.forEach((batter) => {
        batter.id = playerIdsMap[batter.id];
      });

      currentInnings.bowlers.forEach((bowler) => {
        bowler.id = playerIdsMap[bowler.id];
      });
    }

    const commentaryInnings = [
      {
        teamId: 0,
        commentaryList: await getMatchCommentary(seriesId, matchId, 0),
      },
    ];

    for (let i = 0; i < infoData.inningsScoreList.length; i++) {
      const innings = infoData.inningsScoreList[i];
      const commentaryList = await getMatchCommentary(
        seriesId,
        matchId,
        innings.inningsId
      );

      commentaryList.forEach((commentary) => {
        const batterId = commentary.batsmanStriker.id;
        const bowlerId = commentary.bowlerStriker.id;

        if (batterId > 0) commentary.batsmanStriker.id = playerIdsMap[batterId];
        if (bowlerId > 0) commentary.bowlerStriker.id = playerIdsMap[bowlerId];
      });

      commentaryInnings.push({
        teamId: teamIdsMap[innings.batTeamId],
        commentaryList,
      });
    }

    const commentaryData = {
      matchId: insertedMatchId,
      innings: commentaryInnings,
    };

    await MatchSquads.create(matchSquad);
    await Scorecard.create(scorecardData);
    await Commentary.create(commentaryData);

    console.log("Seeding match finished... ");
  } catch (err) {
    console.error("ERROR in seeding match ==> ", err);
  }
};

export const seedSeriesMatches = async (seriesId: number) => {
  try {
    const path = `${BASE_PATH}${seriesId}/matches`;
    const matchIds = await readDirectory(path);

    if (!matchIds) {
      console.log("Series does not have any matches...");
      return;
    }

    for (let i = 0; i < matchIds.length; i++) {
      const matchId = parseInt(matchIds[i]);
      await seedMatch(seriesId, matchId);
    }
  } catch (err) {
    console.error("ERROR in seedSeriesMatches ", err);
  }
};

const seedSeries = async () => {
  try {
    console.log("Seeding series started...");
    const contents = await readFileData(BASE_PATH + "index.json");

    if (!contents) {
      console.log("No series data found to seed...");
      return;
    }

    const data: SeriesData = JSON.parse(contents);

    const series: SeriesWithOptionalId[] = [];
    const seriesIds: number[] = [];
    for (const key in data) {
      const item = data[key];
      if (item.id) seriesIds.push(item.id);

      delete item.id;
      series.push(item);
    }

    const insertedSeries = await db
      .insert(tables.series)
      .values(series)
      .returning({ insertedId: tables.series.id });

    const seriesIdsMap: IdsMap = {};
    seriesIds.forEach((id, index) => {
      seriesIdsMap[id] = insertedSeries[index].insertedId;
    });

    await writeFileData(
      BASE_PATH + "idsMap.json",
      JSON.stringify(seriesIdsMap, null, 2)
    );

    for (let i = 0; i < seriesIds.length; i++) {
      const seriesId = seriesIds[i];

      await seedSeriesMatches(seriesId);
    }

    console.log("Seeding series finished...");
  } catch (err) {
    console.error("ERROR in seeding series ==> ", err);
  }
};

export default seedSeries;
