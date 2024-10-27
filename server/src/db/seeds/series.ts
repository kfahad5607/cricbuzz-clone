import { mkdir } from "fs/promises";
import * as z from "zod";
import {
  CommentaryItem,
  Match,
  MatchSquad,
  MatchSquadPlayer,
  SeriesWithId,
  TeamSquad,
} from "../../types";
import { MatchData } from "../../types/matchData";
import Commentary from "../mongo/schema/commentary";
import MatchDataModel from "../mongo/schema/matchData";
import MatchSquads from "../mongo/schema/matchSquad";
import { db } from "../postgres";
import * as tables from "../postgres/schema";
import { getIdsMap } from "./helpers";
import { BASE_DATA_PATH } from "./helpers/constants";
import { readDirectory, readFileData, writeFileData } from "./helpers/file";
import { IdsMap } from "./helpers/types";

// validation schema
const InningsScoreItem = z.object({
  inningsId: z.coerce.number().positive(),
  batTeamId: z.coerce.number().positive(),
});
const InfoData = Match.extend({
  inningsScoreList: z.array(InningsScoreItem),
});

const SquadsData = z.object({
  homeTeam: TeamSquad,
  awayTeam: TeamSquad,
});

const SeriesWithOptionalId = SeriesWithId.partial({ id: true });
const SeriesData = z.record(z.coerce.number().positive(), SeriesWithOptionalId);
const CommentaryData = z.array(CommentaryItem);

// types
type InfoData = z.infer<typeof InfoData>;
type SquadsData = z.infer<typeof SquadsData>;

type SeriesWithOptionalId = z.infer<typeof SeriesWithOptionalId>;
type SeriesData = z.infer<typeof SeriesData>;

// consts
const BASE_PATH = BASE_DATA_PATH + "series/";

const getMatchCommentary = async (
  seriesId: number,
  matchId: number,
  inningsId: number
): Promise<CommentaryItem[]> => {
  try {
    const path = `${BASE_PATH}${seriesId}/matches/${matchId}/commentary/${inningsId}.json`;

    const contents = await readFileData(path);

    if (!contents)
      throw new Error(
        `No commentary found for match ${matchId} and innings ${inningsId}...`
      );

    const commentary = JSON.parse(contents);
    // validate
    CommentaryData.parse(commentary);

    return commentary;
  } catch (err) {
    if (err instanceof Error) throw new Error(err.message);
    throw new Error(String(err));
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
    // validate
    InfoData.parse(infoData);

    const squadsContents = await readFileData(BASE_MATCH_PATH + "squads.json");

    if (!squadsContents) {
      console.log("No match squads data found to seed...");
      return;
    }

    const squadsData: SquadsData = JSON.parse(squadsContents);
    // validate
    SquadsData.parse(squadsData);

    const matchDataContents = await readFileData(
      BASE_MATCH_PATH + "matchData.json"
    );

    if (!matchDataContents) {
      console.log("No scorecard data found to seed...");
      return;
    }

    const matchData: MatchData = JSON.parse(matchDataContents);
    // validate
    MatchData.parse(matchData);

    const tossResults = matchData.tossResults;
    if (tossResults.tossWinnerId)
      tossResults.tossWinnerId = teamIdsMap[tossResults.tossWinnerId];

    const matchResults = matchData.results;
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
      completeTime: new Date(infoData.completeTime),
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
      player.id = playerIdsMap[player.id];
    });

    awayTeamSquad.teamId = teamIdsMap[awayTeamSquad.teamId];
    awayTeamSquad.players.forEach((player) => {
      player.id = playerIdsMap[player.id];
    });

    const matchSquad: MatchSquad<MatchSquadPlayer> = {
      matchId: insertedMatchId,
      teams: [homeTeamSquad, awayTeamSquad],
    };

    matchData.matchId = insertedMatchId;
    for (const inningsKey in matchData.innings) {
      const currentInnings =
        matchData.innings[inningsKey as keyof MatchData["innings"]];

      if (!currentInnings) continue;

      currentInnings.teamId = teamIdsMap[currentInnings.teamId];

      currentInnings.batters.forEach((batter) => {
        batter.id = playerIdsMap[batter.id];

        const fallOfWicket = batter.fallOfWicket;
        if (fallOfWicket) {
          if (fallOfWicket.bowlerId) {
            fallOfWicket.bowlerId = playerIdsMap[fallOfWicket.bowlerId];
          }
          fallOfWicket.helpers = fallOfWicket.helpers.map(
            (id) => playerIdsMap[id]
          );
        }
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
        const batterId = commentary.batsmanStriker!.id;
        const bowlerId = commentary.bowlerStriker!.id;

        if (batterId > 0)
          commentary.batsmanStriker!.id = playerIdsMap[batterId];
        if (bowlerId > 0) commentary.bowlerStriker!.id = playerIdsMap[bowlerId];
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
    // temp for testing
    matchData.innings = {};
    // temp for testing
    await MatchDataModel.create(matchData);
    // temp for testing
    commentaryData.innings = [];
    // temp for testing
    await Commentary.create(commentaryData);

    console.log("Seeding match finished... ");

    return insertedMatchId;
  } catch (err) {
    console.error("ERROR in seeding match ==> ", err);
    if (err instanceof Error) throw new Error(err.message);
  }

  return 0;
};

const seedSeriesMatches = async (seriesId: number) => {
  try {
    const path = `${BASE_PATH}${seriesId}/matches`;
    const matchIds = await readDirectory(path);

    if (!matchIds) {
      console.log("Series does not have any matches...");
      return;
    }

    const matchIdsMap: IdsMap = {};
    for (let i = 0; i < matchIds.length; i++) {
      const matchId = parseInt(matchIds[i]);
      const insertedMatchId = await seedMatch(seriesId, matchId);

      if (insertedMatchId) {
        matchIdsMap[matchId] = insertedMatchId;
      }
    }

    await mkdir(`${BASE_DATA_PATH}matches`, {
      recursive: true,
    });
    await writeFileData(
      BASE_DATA_PATH + "matches/idsMap.json",
      JSON.stringify(matchIdsMap, null, 2)
    );
  } catch (err) {
    console.error("ERROR in seedSeriesMatches ", err);
    if (err instanceof Error) throw new Error(err.message);
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
    // validate
    SeriesData.parse(data);

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
      await seedSeriesMatches(seriesIds[i]);
    }

    console.log("Seeding series finished...");
  } catch (err) {
    console.error("ERROR in seeding series ==> ", err);
    if (err instanceof Error) throw new Error(err.message);
  }
};

export default seedSeries;
