import axios from "axios";
import { mkdir } from "fs/promises";
import * as z from "zod";
import {
  CommentaryItem,
  MatchData,
  ScorecardBatter,
  ScorecardBowler,
  ScorecardInnings,
  ScorecardInningsEntry,
  ScorecardInningsType,
} from "../../types";
import { BASE_DATA_PATH } from "./helpers/constants";
import { readDirectory, readFileData, writeFileData } from "./helpers/file";
import { IdsMap } from "./helpers/types";
import { oversToballNum } from "../../helpers";
import { getIdsMap } from "./helpers";

// can these types be moved
const CommentaryData = z.array(
  CommentaryItem.extend({
    ballNbr: z.number().nonnegative(),
    batTeamScore: z.number().nonnegative(),
  })
);
type CommentaryData = z.infer<typeof CommentaryData>;

const seriesId = 7607;
const matchId = 89654;
const baseMatchPath = `${BASE_DATA_PATH}series/${seriesId}/matches/${matchId}/`;

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

const sendRequest = async (
  payload: ScorecardInningsEntry,
  matchId: number,
  inningsType: ScorecardInningsType
) => {
  const BASE_URL = "http://localhost:8000/";
  try {
    console.log(payload);

    const res = await axios.post(
      `${BASE_URL}matches/${matchId}/innings/${inningsType}/score`,
      payload
    );
    console.log("res ", res.data);
  } catch (err) {
    console.error("ERR in sendRequest ", err);
  }
};

const playInnings = async (
  inningsId: number,
  innings: ScorecardInnings,
  idsMap: { teams: IdsMap; players: IdsMap }
) => {
  try {
    const payloadData: ScorecardInningsEntry[] = [];
    const commentaryPath = `${baseMatchPath}commentary/${inningsId}.json`;

    const commentaryDataContents = await readFileData(commentaryPath);

    if (!commentaryDataContents) {
      console.log("No commentary data found");
      return;
    }

    const commentaryData: CommentaryData = JSON.parse(commentaryDataContents);
    CommentaryData.parse(commentaryData);

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

    commentaryData.forEach((commentary) => {
      if (commentary.ballNbr === 0) return;

      let batsmanStriker: ScorecardBatter = commentary.batsmanStriker;
      batsmanStriker.id = idsMap.players[batsmanStriker.id];

      let batsmanNonStriker: ScorecardBatter = lastBatsmanNonStriker;
      let bowlerStriker: ScorecardBowler | undefined = commentary.bowlerStriker;
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

      // if (lastBatsmanStriker.fallOfWicket) {
      //   lastBatsmanStriker = getNewBatsman(0);
      // } else if (lastBatsmanNonStriker.fallOfWicket) {
      //   lastBatsmanNonStriker = getNewBatsman(0);
      // }

      const payload: ScorecardInningsEntry = {
        teamId,
        overs,
        oversBowled: commentary.overs,
        score,
        wickets,
        extras: { ...extras },
        batsmanStriker,
        batsmanNonStriker,
      };

      if (bowlerStriker !== undefined) {
        payload.bowlerStriker = bowlerStriker;
      }
      if (bowlerNonStriker !== undefined) {
        payload.bowlerNonStriker = bowlerNonStriker;
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
          payloadData.push({
            ...payload,
            batsmanStriker: null,
          });
          payloadData.push({
            ...payload,
            batsmanStriker: lastBatsmanStriker,
          });
        } else {
          lastBatsmanNonStriker = getNewBatsman(idsMap.players[nextBatter.id]);
          payloadData.push({
            ...payload,
            batsmanNonStriker: null,
          });
          payloadData.push({
            ...payload,
            batsmanNonStriker: lastBatsmanNonStriker,
          });
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

const main = async () => {
  try {
    const matchDataPath = `${baseMatchPath}matchData.json`;
    const matchDataContents = await readFileData(matchDataPath);
    if (!matchDataContents) {
      console.log("No match data found");
      return;
    }

    const matchData: MatchData = JSON.parse(matchDataContents);
    MatchData.parse(matchData);

    const inningsTypeMap = {
      first: 1,
      second: 2,
      third: 3,
      fourth: 4,
    };

    // const seriesIdsMap = await getIdsMap("series");
    const teamIdsMap = await getIdsMap("teams");
    const playerIdsMap = await getIdsMap("players");

    await mkdir(`${baseMatchPath}payloads`, {
      recursive: true,
    });

    for (const inningsType in matchData.innings) {
      const _inningsType = inningsType as ScorecardInningsType;
      await playInnings(
        inningsTypeMap[_inningsType],
        matchData.innings[_inningsType]!,
        {
          teams: teamIdsMap,
          players: playerIdsMap,
        }
      );
    }
  } catch (err) {
    console.error("ERR in match play ", err);
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

    for (let i = 0; i < payloadFiles.length; i++) {
      const payloadFile = payloadFiles[i];
      const payloadData = await readFileData(`${basePath}/${payloadFile}`);

      if (!payloadData) {
        console.log("No payload data found");
        return;
      }
      const payloads: ScorecardInningsEntry[] = JSON.parse(payloadData);

      for (const payload of payloads) {
        await sendRequest(payload, nativeMatchId, "first");

        console.log("Sleeping ");
        await sleep(3000);
        console.log("Slept ");
      }

      console.log(typeof payloads);
    }
  } catch (err) {}
};

main();
// playMatch();
