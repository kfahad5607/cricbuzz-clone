import axios from "axios";
import { mkdir } from "fs/promises";
import * as z from "zod";
import { oversToballNum } from "../../helpers";
import {
  BaseMatchDataPartial,
  CommentaryInningsEntry,
  CommentaryInningsType,
  CommentaryItem,
  MatchData,
  ScorecardBatter,
  ScorecardBowler,
  ScorecardInnings,
  ScorecardInningsEntry,
} from "../../types";
import { getIdsMap } from "./helpers";
import { BASE_DATA_PATH } from "./helpers/constants";
import { readDirectory, readFileData, writeFileData } from "./helpers/file";
import { IdsMap } from "./helpers/types";

// can these types be moved
const CommentaryData = z.array(
  CommentaryItem.extend({
    ballNbr: z.number().nonnegative(),
    batTeamScore: z.number().nonnegative(),
  })
);
type CommentaryData = z.infer<typeof CommentaryData>;

type Payload =
  | {
      type: "commentary";
      data: CommentaryInningsEntry;
    }
  | {
      type: "scorecard";
      data: ScorecardInningsEntry;
    };

type MatchDataPayload = BaseMatchDataPartial;

type Bookmark = {
  file: number;
  itemIdx: number;
};

const seriesId = 5945;
const matchId = 66337;
const baseMatchPath = `${BASE_DATA_PATH}series/${seriesId}/matches/${matchId}/`;
const BASE_URL = "http://localhost:8000/";

const inningsIdMap: { [k: number]: CommentaryInningsType } = {
  0: "preview",
  1: "first",
  2: "second",
  3: "third",
  4: "fourth",
};

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const getNewBatsman = (id: number) => {
  return {
    id: id,
    batRuns: 0,
    ballsPlayed: 0,
    dotBalls: 0,
    batFours: 0,
    batSixes: 0,
  };
};

const getNewBowler = (id: number) => {
  return {
    id: id,
    bowlOvers: 0,
    bowlMaidens: 0,
    bowlRuns: 0,
    bowlWickets: 0,
    bowlWides: 0,
    bowlNoBalls: 0,
  };
};

const isOdd = (num: number) => {
  return num % 2 == 1;
};

const isLastOverBall = (ballNbr: number) => {
  if (ballNbr < 6) return false;

  return ballNbr % 6 === 0;
};

const rotateStrike = (
  runScored: number,
  ballNbr: number,
  isExtraBall: boolean
) => {
  const offset = isExtraBall ? 1 : 0;
  const isLastBall = isLastOverBall(ballNbr) && !isExtraBall;
  const isOddRun = isOdd(runScored - offset);

  return isOddRun !== isLastBall;
};

const sendPayload = async (
  payload: Payload,
  matchId: number,
  inningsType: CommentaryInningsType
) => {
  try {
    let url = `${BASE_URL}matches/${matchId}/innings/${inningsType}/commentary`;
    if (payload.type === "scorecard") {
      url = `${BASE_URL}matches/${matchId}/innings/${inningsType}/score`;
    }

    const res = await axios.post<{}, any, Payload["data"]>(url, payload.data);

    return res.status === 200;
  } catch (err) {
    console.error("ERR in sendPayload ", err);
  }

  return false;
};

const updateMatchData = async (payload: MatchDataPayload, matchId: number) => {
  try {
    let url = `${BASE_URL}matches/data/${matchId}`;
    const res = await axios.patch<{}, any, MatchDataPayload>(url, payload);

    return res.status === 200;
  } catch (err) {
    console.error("ERR in updateMatchData ", err);
  }

  return false;
};

const generateInningsPayloads = async (
  inningsId: number,
  innings: ScorecardInnings | undefined,
  idsMap: { teams: IdsMap; players: IdsMap }
) => {
  try {
    const payloadData: Payload[] = [];
    const commentaryPath = `${baseMatchPath}commentary/${inningsId}.json`;

    const commentaryDataContents = await readFileData(commentaryPath);

    if (!commentaryDataContents) {
      console.log("No commentary data found");
      return;
    }

    const commentaryData: CommentaryData = JSON.parse(commentaryDataContents);
    CommentaryData.parse(commentaryData);

    if (!innings) {
      commentaryData.forEach((commentary) => {
        const payload: Payload = {
          type: "commentary",
          data: {
            teamId: 0,
            commText: commentary.commText,
            events: commentary.events,
          },
        };

        payloadData.push(payload);
      });

      await writeFileData(
        `${baseMatchPath}/payloads/${inningsId}.json`,
        JSON.stringify(payloadData, null, 2)
      );
      return;
    }

    const teamId = idsMap.teams[innings.teamId];
    const overs = innings.overs;
    const extras = {
      nos: 0,
      wides: 0,
      legByes: 0,
      byes: 0,
      penalties: 0,
    };
    let lastScore = 0;
    let wickets = 0;

    const lastBatsmanStrikerId = idsMap.players[innings.batters[0].id!];
    const lastBatsmanNonStrikerId = idsMap.players[innings.batters[1].id!];
    const lastBowlerStrikerId = idsMap.players[innings.bowlers[0].id!];

    let lastBatsmanStriker: ScorecardBatter =
      getNewBatsman(lastBatsmanStrikerId);
    let lastBatsmanNonStriker: ScorecardBatter = getNewBatsman(
      lastBatsmanNonStrikerId
    );

    const batters = {
      [lastBatsmanStrikerId]: lastBatsmanStriker,
      [lastBatsmanNonStrikerId]: lastBatsmanNonStriker,
    };

    let lastBowlerStriker: ScorecardBowler | undefined =
      getNewBowler(lastBowlerStrikerId);
    let lastBowlerNonStriker: ScorecardBowler | undefined = undefined;

    const bowlers = {
      [lastBowlerStrikerId]: lastBowlerStriker,
    };

    const fallOfWickets: {
      [k: number]: {
        batterId: number;
        fallOfWicket: ScorecardBatter["fallOfWicket"];
      };
    } = {};
    innings.batters.forEach((batter) => {
      const fallOfWicket = batter.fallOfWicket;
      if (!fallOfWicket) return;

      if (fallOfWicket.bowlerId) {
        fallOfWicket.bowlerId = idsMap.players[fallOfWicket.bowlerId];
      }
      fallOfWicket.helpers = fallOfWicket.helpers.map(
        (id) => idsMap.players[id]
      );

      fallOfWickets[oversToballNum(fallOfWicket.overs)] = {
        batterId: idsMap.players[batter.id],
        fallOfWicket,
      };
    });

    const battedSoFar = new Set<number>([
      lastBatsmanStrikerId,
      lastBatsmanNonStrikerId,
    ]);

    let initScorecardPlayers = false;
    commentaryData.forEach((commentary, commentaryIdx) => {
      if (commentary.ballNbr === 0) {
        const basePayload: Payload = {
          type: "commentary",
          data: {
            teamId,
            commText: commentary.commText,
            events: commentary.events,
          },
        };

        if (!initScorecardPlayers) {
          basePayload.data.scorecard = {
            teamId,
            overs,
            oversBowled: commentary.overs,
            score: lastScore,
            wickets,
            extras: { ...extras },
            batsmanStriker: lastBatsmanStriker,
            batsmanNonStriker: lastBatsmanNonStriker,
            bowlerStriker: lastBowlerStriker,
          };
          initScorecardPlayers = true;
        }

        payloadData.push(basePayload);

        return;
      }

      let batsmanStriker: ScorecardBatter = commentary.batsmanStriker!;
      batsmanStriker.id = idsMap.players[batsmanStriker.id];

      let batsmanNonStriker: ScorecardBatter = lastBatsmanNonStriker;
      let bowlerStriker: ScorecardBowler | undefined =
        commentary.bowlerStriker!;
      bowlerStriker.id = idsMap.players[bowlerStriker.id];

      let bowlerNonStriker: ScorecardBowler | undefined = lastBowlerNonStriker;

      if (!(batsmanStriker.id in batters)) {
        batters[batsmanStriker.id] = getNewBatsman(batsmanStriker.id);
      }
      if (!(bowlerStriker.id in bowlers)) {
        bowlers[bowlerStriker.id] = getNewBowler(bowlerStriker.id);
      }

      const batterScored =
        batsmanStriker.batRuns - batters[batsmanStriker.id].batRuns;
      const events = commentary.events;
      const score = commentary.batTeamScore;
      const runScored = score - lastScore;

      if (events.includes("WICKET")) {
        wickets += 1;
        const fallOfWicketData = fallOfWickets[commentary.ballNbr];
        delete fallOfWickets[commentary.ballNbr];

        if (fallOfWicketData.batterId === batsmanStriker.id) {
          batsmanStriker.fallOfWicket = fallOfWicketData.fallOfWicket;
        }
        if (fallOfWicketData.batterId === batsmanNonStriker.id) {
          batsmanNonStriker.fallOfWicket = fallOfWicketData.fallOfWicket;
        }
      }

      let isExtraBall = false;
      if (runScored > batterScored) {
        let extraType: keyof typeof extras = "legByes";
        if (bowlerStriker.bowlWides > bowlers[bowlerStriker.id].bowlWides) {
          extraType = "wides";
          isExtraBall = true;
        } else if (
          bowlerStriker.bowlNoBalls > bowlers[bowlerStriker.id].bowlNoBalls
        ) {
          extraType = "nos";
          isExtraBall = true;
        }

        extras[extraType] += runScored;
      }

      if (rotateStrike(runScored, commentary.ballNbr, isExtraBall)) {
        [batsmanStriker, batsmanNonStriker] = [
          batsmanNonStriker,
          batsmanStriker,
        ];
      }

      const isLastBall = isLastOverBall(commentary.ballNbr) && !isExtraBall;
      if (isLastBall) {
        [bowlerStriker, bowlerNonStriker] = [bowlerNonStriker, bowlerStriker];
      }

      batters[batsmanStriker.id] = batsmanStriker;
      batters[batsmanNonStriker.id] = batsmanNonStriker;
      if (bowlerStriker !== undefined) {
        bowlers[bowlerStriker.id] = bowlerStriker;
      }

      lastBatsmanStriker = batsmanStriker;
      lastBatsmanNonStriker = batsmanNonStriker;
      lastBowlerStriker = bowlerStriker;
      lastBowlerNonStriker = bowlerNonStriker;

      const payload: Payload = {
        type: "commentary",
        data: {
          teamId,
          commText: commentary.commText,
          events: commentary.events,
          scorecard: {
            teamId,
            overs,
            oversBowled: commentary.overs,
            score,
            wickets,
            extras: { ...extras },
            batsmanStriker,
            batsmanNonStriker,
          },
        },
      };

      if (bowlerStriker !== undefined && payload.data.scorecard) {
        payload.data.scorecard.bowlerStriker = bowlerStriker;
      }
      if (bowlerNonStriker !== undefined && payload.data.scorecard) {
        payload.data.scorecard.bowlerNonStriker = bowlerNonStriker;
      }

      lastScore = score;
      payloadData.push(payload);

      if (
        lastBatsmanStriker.fallOfWicket ||
        lastBatsmanNonStriker.fallOfWicket
      ) {
        const nextBatter = innings.batters.find((batter) => {
          if (!battedSoFar.has(idsMap.players[batter.id])) {
            return true;
          }

          return false;
        });

        if (!nextBatter) return;

        battedSoFar.add(idsMap.players[nextBatter.id]);
        if (lastBatsmanStriker.fallOfWicket) {
          lastBatsmanStriker = getNewBatsman(idsMap.players[nextBatter.id]);

          let _payload: Payload = {
            type: "scorecard",
            data: { ...payload.data.scorecard!, batsmanStriker: null },
          };

          payloadData.push(_payload);

          _payload.data = {
            ..._payload.data,
            batsmanStriker: lastBatsmanStriker,
          };

          payloadData.push(_payload);
        } else {
          lastBatsmanNonStriker = getNewBatsman(idsMap.players[nextBatter.id]);

          let _payload: Payload = {
            type: "scorecard",
            data: { ...payload.data.scorecard!, batsmanNonStriker: null },
          };

          payloadData.push(_payload);

          _payload.data = {
            ..._payload.data,
            batsmanNonStriker: lastBatsmanNonStriker,
          };

          payloadData.push(_payload);
        }
      }
    });

    await writeFileData(
      `${baseMatchPath}/payloads/${inningsId}.json`,
      JSON.stringify(payloadData, null, 2)
    );
  } catch (err) {
    console.error("ERR in match play ", err);
  }
};

const generateMatchPayloads = async () => {
  try {
    const matchDataPath = `${baseMatchPath}matchData.json`;
    const matchDataContents = await readFileData(matchDataPath);
    if (!matchDataContents) {
      console.log("No match data found");
      return;
    }

    const matchData: MatchData = JSON.parse(matchDataContents);
    MatchData.parse(matchData);

    // const seriesIdsMap = await getIdsMap("series");
    const teamIdsMap = await getIdsMap("teams");
    const playerIdsMap = await getIdsMap("players");

    await mkdir(`${baseMatchPath}payloads`, {
      recursive: true,
    });

    const commentaryFiles = await readDirectory(`${baseMatchPath}commentary`);
    if (!commentaryFiles) {
      console.log("No commentary files found");
      return;
    }

    for (let i = 0; i < commentaryFiles.length; i++) {
      const _inningsType = inningsIdMap[i];
      let innings =
        _inningsType === "preview"
          ? undefined
          : matchData.innings[_inningsType];

      await generateInningsPayloads(i, innings, {
        teams: teamIdsMap,
        players: playerIdsMap,
      });
    }
  } catch (err) {
    console.error("ERR in match play ", err);
  }
};

const readBookmark = async (): Promise<Bookmark> => {
  try {
    const bookmark = await readFileData(
      `${baseMatchPath}payload-bookmark.json`
    );

    if (!bookmark) {
      throw new Error("Invalid bookmark");
    }

    return JSON.parse(bookmark);
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
    }
  }

  return {
    file: 0,
    itemIdx: -1,
  };
};

const writeBookmark = async (bookmark: Bookmark) => {
  try {
    await writeFileData(
      `${baseMatchPath}payload-bookmark.json`,
      JSON.stringify(bookmark)
    );
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
    }
  }
};

const addToss = async (matchId: number) => {
  const matchDataPath = `${baseMatchPath}matchData.json`;
  const matchDataContents = await readFileData(matchDataPath);
  if (!matchDataContents) {
    console.log("No match data found");
    return;
  }

  const matchData: MatchData = JSON.parse(matchDataContents);
  MatchData.parse(matchData);

  if (!matchData.tossResults) {
    console.log("No Toss to add!");
    return;
  }

  const teamIdsMap = await getIdsMap("teams");

  matchData.tossResults.tossWinnerId =
    teamIdsMap[matchData.tossResults.tossWinnerId];
  const matchDataPayload: MatchDataPayload = {
    tossResults: matchData.tossResults,
  };
  const isSuccess = await updateMatchData(matchDataPayload, matchId);

  if (isSuccess) {
    console.log("Toss Added successfully!");
    await sleep(4000);
  } else {
    throw Error("Error adding toss!");
  }
};

const playMatch = async () => {
  try {
    const basePath = `${baseMatchPath}payloads`;
    const payloadFiles = await readDirectory(basePath);
    const matchIdsMap = await getIdsMap("matches");
    const nativeMatchId = matchIdsMap[matchId];

    if (!payloadFiles) {
      console.log("No payloads found");
      return;
    }

    const lastBookmark = await readBookmark();
    console.log("lastBookmark ", lastBookmark);

    for (let i = lastBookmark.file; i < payloadFiles.length; i++) {
      const payloadFile = payloadFiles[i];
      const payloadData = await readFileData(`${basePath}/${payloadFile}`);

      if (!payloadData) {
        console.log("No payload data found");
        return;
      }
      const payloads: Payload[] = JSON.parse(payloadData);

      await sleep(700);
      let timeout = 100;
      let tossAdded = false;
      for (let j = lastBookmark.itemIdx + 1; j < payloads.length; j++) {
        const payload = payloads[j];
        const isSuccess = await sendPayload(
          payload,
          nativeMatchId,
          inningsIdMap[i]
        );
        if (isSuccess) {
          if (j === payloads.length - 1) {
            lastBookmark.file = i + 1;
            lastBookmark.itemIdx = -1;
          } else {
            lastBookmark.file = i;
            lastBookmark.itemIdx = j;
          }

          writeBookmark(lastBookmark);
        } else {
          break;
        }

        if (i === 0 && !tossAdded && j > payloads.length - 5) {
          await addToss(nativeMatchId);
          tossAdded = true;
        }

        console.log("Sleeping ");
        await sleep(timeout);
        console.log("Slept ");
      }

      if (i === 0) {
      }

      console.log(`Ended innings ${i}`);
      console.log("Sleeping for 6 seconds");
      await sleep(6000);
    }
  } catch (err) {
    console.log("ERR in playmatch ", err);
  }
};

const main = async () => {
  await generateMatchPayloads();
  await playMatch();
};

main();
