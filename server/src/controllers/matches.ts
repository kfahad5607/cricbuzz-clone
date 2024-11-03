import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { and, eq, gt, inArray, lt } from "drizzle-orm";
import { NextFunction, Request, Response } from "express";
import Commentary from "../db/mongo/schema/commentary";
import MatchData from "../db/mongo/schema/matchData";
import MatchSquads from "../db/mongo/schema/matchSquad";
import { db } from "../db/postgres";
import * as tables from "../db/postgres/schema";
import {
  addScorecardBatter,
  addScorecardBowler,
  baseScorecardInningsKeys,
  batterHolderKeys,
  bowlerHolderKeys,
} from "../helpers/matchData";
import { verifyMatchAndTeam } from "../helpers/matches";
import {
  BaseMatchDataPartial,
  BaseScorecardInnings,
  COMMENTARY_INNINGS_TYPES,
  CommentaryInningsType,
  DatabaseIntId,
  getValidationType,
  Match,
  MatchCard,
  MatchData as MatchDataType,
  MatchPartial,
  MatchSquad,
  MatchSquadPlayer,
  MatchSquadPlayerPartial,
  MatchSquadPlayerWithInfo,
  MatchWithId,
  PlayerPartial,
  PlayerWithId,
  SCORECARD_INNINGS_TYPES,
  ScorecardBatter,
  ScorecardBowler,
  ScorecardInnings,
  ScorecardInningsEntry,
  ScorecardInningsType,
  TeamSquad,
  UpdateDocType,
} from "../types";
import { CommentaryInningsEntry, CommentaryItem } from "../types/commentary";
import { WICKETS_PER_INNINGS } from "../helpers/constants";

dayjs.extend(utc);

// tables
const matchesTable = tables.matches;
const playersTable = tables.players;

export const getInningsKeys = (inningsType: ScorecardInningsType) => {
  return {
    teamId: `$innings.${inningsType}.teamId`,
    score: `$innings.${inningsType}.score`,
    wickets: `$innings.${inningsType}.wickets`,
    overs: `$innings.${inningsType}.overs`,
    oversBowled: `$innings.${inningsType}.oversBowled`,
  };
};

export async function getAll(
  req: Request,
  res: Response<MatchWithId[]>,
  next: NextFunction
) {
  try {
    const results = await db.select().from(matchesTable);

    res.status(200).json(results);
  } catch (err) {
    next(err);
  }
}

export async function getOne(
  req: Request<getValidationType<{ id: "DatabaseIntIdParam" }>, MatchWithId>,
  res: Response,
  next: NextFunction
) {
  try {
    const id = parseInt(req.params.id);
    const results = await db
      .select()
      .from(matchesTable)
      .where(eq(matchesTable.id, id));

    if (results.length === 0) {
      res.status(404);
      throw new Error(`Match with id '${id}' not found.`);
    }

    res.status(200).json(results[0]);
  } catch (err) {
    next(err);
  }
}

export async function createOne(
  req: Request<{}, MatchWithId, Match>,
  res: Response,
  next: NextFunction
) {
  try {
    const newMatch: Match = req.body;

    const results = await db
      .insert(matchesTable)
      .values(newMatch)
      .returning({ id: matchesTable.id });

    const matchId = results[0].id;
    const squadTeam = {
      players: [],
    };

    const matchSquad = new MatchSquads({
      matchId,
      teams: [
        {
          ...squadTeam,
          teamId: newMatch.homeTeam,
        },
        {
          ...squadTeam,
          teamId: newMatch.awayTeam,
        },
      ],
    });

    const matchSquadResults = await matchSquad.save();

    const savedMatch = { ...newMatch, id: matchId };

    res.status(201).json(savedMatch);
  } catch (err) {
    next(err);
  }
}

export async function updateOne(
  req: Request<
    getValidationType<{ id: "DatabaseIntIdParam" }>,
    MatchWithId,
    MatchPartial
  >,
  res: Response,
  next: NextFunction
) {
  try {
    const id = parseInt(req.params.id);
    const match = req.body;

    const results = await db
      .update(matchesTable)
      .set(match)
      .where(eq(matchesTable.id, id))
      .returning();

    if (results.length === 0) {
      res.status(404);
      throw new Error(`Match with id '${id}' not found.`);
    }

    res.status(200).json(results[0]);
  } catch (err) {
    next(err);
  }
}

export async function deleteOne(
  req: Request<getValidationType<{ id: "DatabaseIntIdParam" }>>,
  res: Response,
  next: NextFunction
) {
  try {
    const matchId = parseInt(req.params.id);

    await db.delete(matchesTable).where(eq(matchesTable.id, matchId));
    await MatchData.deleteOne({
      matchId,
    });
    await MatchSquads.deleteOne({
      matchId,
    });

    const results = await MatchSquads.deleteOne({ matchId });

    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

export async function updateMatchData(
  req: Request<
    getValidationType<{ id: "DatabaseIntIdParam" }>,
    MatchWithId,
    BaseMatchDataPartial
  >,
  res: Response,
  next: NextFunction
) {
  try {
    const matchId = parseInt(req.params.id);
    const matchData = req.body;

    if (matchData.tossResults) {
      matchData.state = "toss";
    }

    if (Object.keys(matchData).length > 0) {
      const result = await MatchData.updateOne(
        {
          matchId,
        },
        {
          $set: matchData,
        }
      );

      if (result.matchedCount === 0) {
        res.status(404);
        throw new Error(`Match with id '${matchId}' not found.`);
      }
    }

    res.status(200).json({
      status: "success",
      message: "Updated successfully!",
    });
  } catch (err) {
    next(err);
  }
}

// scorecard and commentary
export async function getAllInningsScore(
  req: Request<
    getValidationType<{
      id: "DatabaseIntIdParam";
    }>
  >,
  res: Response,
  next: NextFunction
) {
  try {
    const matchId = parseInt(req.params.id);

    const matchData = await MatchData.findOne(
      {
        matchId,
      },
      {
        innings: 1,
      }
    );

    if (!matchData) {
      res.status(404);
      throw new Error(`No match found.`);
    }

    res.status(200).json({
      status: "success",
      data: matchData.innings,
    });
  } catch (err) {
    next(err);
  }
}

export async function getInningsScore(
  req: Request<
    getValidationType<{
      id: "DatabaseIntIdParam";
      inningsType: "ScorecardInningsType";
    }>
  >,
  res: Response,
  next: NextFunction
) {
  try {
    const matchId = parseInt(req.params.id);
    const inningsType = req.params.inningsType;

    const matchData = await MatchData.findOne(
      {
        matchId,
      },
      {
        [`innings.${inningsType}`]: 1,
      }
    );

    if (!matchData || !matchData.innings[inningsType]) {
      res.status(404);
      throw new Error(`Innings does not exist`);
    }

    const innings = matchData.innings[inningsType];

    res.status(200).json({
      status: "success",
      data: innings,
    });
  } catch (err) {
    next(err);
  }
}

export async function addInningsScore(
  req: Request<
    getValidationType<{
      id: "DatabaseIntIdParam";
      inningsType: "ScorecardInningsType";
    }>,
    {},
    ScorecardInningsEntry
  >,
  res: Response,
  next: NextFunction
) {
  try {
    const matchId = parseInt(req.params.id);
    const inningsType: ScorecardInningsType = req.params.inningsType;
    const prevInningsType: ScorecardInningsType | undefined =
      SCORECARD_INNINGS_TYPES[SCORECARD_INNINGS_TYPES.indexOf(inningsType) - 1];
    const scorecardInningsEntry = req.body;
    const teamId = scorecardInningsEntry.teamId;

    const columnsToFetch = { [`innings.${inningsType}`]: 1 };
    if (prevInningsType) {
      columnsToFetch[`innings.${prevInningsType}.teamId`] = 1;
      columnsToFetch[`innings.${prevInningsType}.score`] = 1;
    }

    let matchData = await MatchData.findOne(
      {
        matchId,
      },
      {
        ...columnsToFetch,
      }
    );

    if (!matchData) {
      // document does not exist
      if (prevInningsType)
        throw new Error(
          `Cannot add score for '${inningsType}' innings before '${prevInningsType}' innings`
        );

      // validate match
      await verifyMatchAndTeam(matchId, teamId);

      matchData = new MatchData({
        matchId,
        innings: {
          first: {
            teamId,
            overs: 0,
            oversBowled: 0,
            score: 0,
            wickets: 0,
            extras: {
              nos: 0,
              wides: 0,
              legByes: 0,
              byes: 0,
              penalties: 0,
            },
            batters: [],
            bowlers: [],
          },
        },
      });
    }

    if (prevInningsType && !matchData.innings[prevInningsType]) {
      throw new Error(
        `Cannot add score for '${inningsType}' innings before '${prevInningsType}' innings`
      );
    }

    let innings: ScorecardInnings | undefined = matchData.innings[inningsType];
    if (!innings) {
      matchData.innings[inningsType] = {
        teamId: scorecardInningsEntry.teamId,
        overs: 0,
        oversBowled: 0,
        score: 0,
        wickets: 0,
        extras: {
          nos: 0,
          wides: 0,
          legByes: 0,
          byes: 0,
          penalties: 0,
        },
        batters: [],
        bowlers: [],
      };

      innings = matchData.innings[inningsType];

      if (matchData.innings[prevInningsType]) {
        innings.target = matchData.innings[prevInningsType].score + 1;
      }
    }

    baseScorecardInningsKeys.forEach((key) => {
      let val = scorecardInningsEntry[key];
      if (val !== undefined) (innings![key] as typeof val) = val;
    });
    matchData.state = "in-progress";
    if (inningsType === "first" && innings.overs === innings.oversBowled) {
      matchData.state = "innings-break";
    } else if (inningsType === "second") {
      if (innings.score >= (innings.target || 1)) {
        matchData.results = {
          resultType: "win",
          winningMargin: WICKETS_PER_INNINGS - innings.wickets,
          winningTeamId: innings.teamId,
          winByRuns: false,
          winByInnings: false,
        };

        matchData.state = "complete";
      } else if (
        innings.overs === innings.oversBowled ||
        innings.wickets === WICKETS_PER_INNINGS
      ) {
        matchData.results = {
          resultType: "win",
          winningMargin:
            matchData.innings[prevInningsType]!.score - innings.score,
          winningTeamId: matchData.innings[prevInningsType]!.teamId,
          winByRuns: true,
          winByInnings: false,
        };

        matchData.state = "complete";
      }
    }

    batterHolderKeys.forEach((key) => {
      let batter = scorecardInningsEntry[key];
      if (!batter) return;

      batter.isStriker = key === "batsmanStriker";
      addScorecardBatter(innings!.batters, batter);
    });

    bowlerHolderKeys.forEach((key) => {
      let bowler = scorecardInningsEntry[key];
      if (!bowler) return;

      if (key === "bowlerStriker") {
        // why need two flags for striker?
        bowler.isStriker = true;
        bowler.isNonStriker = false;
      } else if (key === "bowlerNonStriker") {
        bowler.isStriker = false;
        bowler.isNonStriker = true;
      }
      addScorecardBowler(innings!.bowlers, bowler);
    });

    await matchData.save();

    res.status(200).json({
      status: "success",
      message: "Added successfully",
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteInningsScore(
  req: Request<
    getValidationType<{
      id: "DatabaseIntIdParam";
      inningsType: "ScorecardInningsType";
    }>,
    {},
    ScorecardInningsEntry
  >,
  res: Response,
  next: NextFunction
) {
  try {
    const matchId = parseInt(req.params.id);
    const inningsType: ScorecardInningsType = req.params.inningsType;

    const nextInningsType: ScorecardInningsType | undefined =
      SCORECARD_INNINGS_TYPES[SCORECARD_INNINGS_TYPES.indexOf(inningsType) + 1];

    const columnsToFetch = { [`innings.${inningsType}.teamId`]: 1 };
    if (nextInningsType) {
      columnsToFetch[`innings.${nextInningsType}.teamId`] = 1;
    }

    let matchData = await MatchData.findOne(
      {
        matchId,
      },
      {
        ...columnsToFetch,
      }
    );

    if (!matchData) {
      res.status(404);
      throw new Error("Match does not exist.");
    }

    if (matchData.innings[nextInningsType]) {
      res.status(400);
      throw new Error(
        `Cannot delete '${inningsType}' innings before '${nextInningsType}' innings.`
      );
    }

    matchData.innings[inningsType] = undefined;

    if (inningsType === "first") {
      await matchData.deleteOne();
    } else {
      await matchData.save();
    }

    res.status(200).json({
      status: "success",
      message: "Innings deleted successfully",
    });
  } catch (err) {
    next(err);
  }
}

export async function getHighlights(
  req: Request<
    getValidationType<{
      id: "DatabaseIntIdParam";
      inningsType: "ScorecardInningsType";
    }>
  >,
  res: Response,
  next: NextFunction
) {
  try {
    const matchId = parseInt(req.params.id);
    const inningsType = req.params.inningsType;
    const inningsIndex = COMMENTARY_INNINGS_TYPES.indexOf(inningsType);

    let result = await Commentary.aggregate([
      {
        $match: {
          matchId,
        },
      },
      {
        $project: {
          innings: { $arrayElemAt: ["$innings", inningsIndex] },
        },
      },
      {
        $project: {
          innings: {
            teamId: "$innings.teamId",
            currentInnings: inningsType,
            commentaryList: {
              $reverseArray: {
                $filter: {
                  input: "$innings.commentaryList",
                  as: "item",
                  cond: { $ne: ["$$item.events", []] },
                },
              },
            },
          },
        },
      },
    ]);

    const matchDataResult = await MatchData.aggregate<
      Pick<MatchDataType, "tossResults"> & {
        innings: {
          teamId: number;
        }[];
      }
    >([
      { $match: { matchId } },
      {
        $project: {
          inningsArray: {
            $map: {
              input: { $objectToArray: "$innings" },
              as: "inning",
              in: {
                teamId: "$$inning.v.teamId",
              },
            },
          },
        },
      },
      {
        $project: {
          innings: "$inningsArray",
        },
      },
    ]);

    if (matchDataResult.length === 0) {
      res.status(404);
      throw new Error(`No commentary found.`);
    }

    if (!result[0] || !result[0].innings) {
      result = [
        {
          innings: {
            teamId: 0,
            currentInnings: inningsType,
            commentaryList: [],
          },
        },
      ];
    }

    if (!result[0].innings.commentaryList) {
      result[0].innings.commentaryList = [];
    }

    res.status(200).json({
      ...result[0].innings,
      ...matchDataResult[0],
    });
  } catch (err) {
    next(err);
  }
}

export async function getFullCommentary(
  req: Request<
    getValidationType<{
      id: "DatabaseIntIdParam";
      inningsType: "CommentaryInningsType";
    }>
  >,
  res: Response,
  next: NextFunction
) {
  try {
    const matchId = parseInt(req.params.id);
    const inningsType = req.params.inningsType;
    const inningsIndex = COMMENTARY_INNINGS_TYPES.indexOf(inningsType);

    let result = await Commentary.aggregate([
      {
        $match: {
          matchId,
        },
      },
      {
        $project: {
          innings: { $arrayElemAt: ["$innings", inningsIndex] },
        },
      },
      {
        $project: {
          innings: {
            teamId: "$innings.teamId",
            currentInnings: inningsType,
            commentaryList: {
              $reverseArray: "$innings.commentaryList",
            },
          },
        },
      },
    ]);

    const matchDataResult = await MatchData.aggregate<
      Pick<MatchDataType, "tossResults"> & {
        batters?: Pick<MatchSquadPlayer, "id">[];
        bowlers?: Pick<MatchSquadPlayer, "id">[];
        innings: {
          teamId: number;
          batters: Pick<MatchSquadPlayer, "id">[];
          bowlers: Pick<MatchSquadPlayer, "id">[];
        }[];
      }
    >([
      { $match: { matchId } },
      {
        $project: {
          tossResults: 1,
          inningsArray: {
            $map: {
              input: { $objectToArray: "$innings" },
              as: "inning",
              in: {
                teamId: "$$inning.v.teamId",
                batters: [],
                bowlers: [],
              },
            },
          },
          batters: {
            $map: {
              input: `$innings.${inningsType}.batters`,
              as: "batter",
              in: {
                id: "$$batter.id",
              },
            },
          },
          bowlers: {
            $map: {
              input: `$innings.${inningsType}.bowlers`,
              as: "bowler",
              in: {
                id: "$$bowler.id",
              },
            },
          },
        },
      },
      {
        $project: {
          tossResults: 1,
          innings: "$inningsArray",
          batters: 1,
          bowlers: 1,
        },
      },
    ]);

    console.log("HERE ", result);
    console.log("HERE 2 ", matchDataResult);

    if (matchDataResult.length === 0) {
      res.status(404);
      throw new Error(`No commentary found.`);
    }

    if (!result[0] || !result[0].innings) {
      result = [
        {
          innings: {
            teamId: 0,
            currentInnings: inningsType,
            commentaryList: [],
          },
        },
      ];
    }

    if (matchDataResult[0].batters) {
      matchDataResult[0].innings[inningsIndex - 1].batters =
        matchDataResult[0].batters;
      delete matchDataResult[0].batters;
    }
    if (matchDataResult[0].bowlers) {
      matchDataResult[0].innings[inningsIndex - 1].bowlers =
        matchDataResult[0].bowlers;
      delete matchDataResult[0].bowlers;
    }

    res.status(200).json({
      ...result[0].innings,
      ...matchDataResult[0],
    });
  } catch (err) {
    next(err);
  }
}

async function getCommentaryData(
  matchId: number,
  inningsIdx: number,
  timestamp?: number
): Promise<{
  commentaryList: CommentaryItem[];
  lastFetchedInnings: CommentaryInningsType;
  hasMore: boolean;
}> {
  const COMMENTARY_ITEMS_COUNT = 20;
  const COMMENTARY_ITEMS_MIN_COUNT = 10;

  let commentaryListFilter: unknown = {
    $getField: {
      input: { $arrayElemAt: ["$innings", inningsIdx] },
      field: "commentaryList",
    },
  };

  if (timestamp) {
    commentaryListFilter = {
      $filter: {
        input: commentaryListFilter,
        as: "item",
        cond: {
          $lte: ["$$item.timestamp", timestamp],
        },
      },
    };
  }

  const results = await Commentary.aggregate<{
    commentaryList: CommentaryItem[] | null;
    totalInnings: number;
    totalRemainingItems: number;
  }>([
    { $match: { matchId } },
    {
      $project: {
        commentaryList: commentaryListFilter,
        lastInning: { $arrayElemAt: ["$innings", inningsIdx] },
        totalInnings: {
          $size: "$innings",
        },
      },
    },
    {
      $project: {
        totalInnings: 1,
        totalRemainingItems: {
          $size: {
            $ifNull: ["$commentaryList", []],
          },
        },
        commentaryList: {
          $reverseArray: {
            $lastN: {
              input: { $ifNull: ["$commentaryList", []] },
              n: COMMENTARY_ITEMS_COUNT,
            },
          },
        },
      },
    },
  ]);

  if (results.length === 0)
    return {
      lastFetchedInnings: COMMENTARY_INNINGS_TYPES[0],
      hasMore: false,
      commentaryList: [],
    };

  if (!results[0].commentaryList) results[0].commentaryList = [];
  if (inningsIdx === -1) inningsIdx = results[0].totalInnings - 1;
  let lastFetchedInnings: CommentaryInningsType | undefined =
    COMMENTARY_INNINGS_TYPES[inningsIdx];
  let hasMore =
    inningsIdx > 0 ||
    results[0].totalRemainingItems > results[0].commentaryList.length;

  if (results[0].commentaryList.length < COMMENTARY_ITEMS_MIN_COUNT) {
    inningsIdx--;

    if (inningsIdx > -1) {
      const newResults = await getCommentaryData(matchId, inningsIdx);
      results[0].commentaryList = results[0].commentaryList.concat(
        newResults.commentaryList
      );
      lastFetchedInnings = newResults.lastFetchedInnings;
      hasMore = newResults.hasMore;
    }
  }

  return {
    commentaryList: results[0].commentaryList,
    lastFetchedInnings,
    hasMore,
  };
}

async function getMatchData(matchId: number) {
  const matchDataResult = await MatchData.aggregate<
    Pick<MatchDataType, "results" | "tossResults" | "state" | "status"> & {
      innings: ScorecardInnings[];
      batsmanStriker?: ScorecardBatter;
      batsmanNonStriker?: ScorecardBatter;
      bowlerStriker: ScorecardBowler;
      bowlerNonStriker?: ScorecardBowler;
    }
  >([
    { $match: { matchId } },
    {
      $project: {
        results: 1,
        tossResults: 1,
        state: 1,
        status: 1,
        inningsArray: {
          $map: {
            input: { $objectToArray: "$innings" },
            as: "inning",
            in: "$$inning.v",
          },
        },
      },
    },
    {
      $addFields: {
        results: "$results",
        tossResults: "$tossResults",
        state: "$state",
        status: "$status",
        lastInnings: {
          $let: {
            vars: {
              lastInnings: {
                $arrayElemAt: ["$inningsArray", -1],
              },
            },
            in: {
              currentBatters: {
                $filter: {
                  input: "$$lastInnings.batters",
                  as: "batter",
                  cond: {
                    $not: { $ifNull: ["$$batter.fallOfWicket", false] },
                  },
                },
              },
              currentBowlers: {
                $sortArray: {
                  input: {
                    $filter: {
                      input: "$$lastInnings.bowlers",
                      as: "bowler",
                      cond: {
                        $or: [
                          { $eq: ["$$bowler.isStriker", true] },
                          { $eq: ["$$bowler.isNonStriker", true] },
                        ],
                      },
                    },
                  },
                  sortBy: { isStriker: -1 },
                },
              },
            },
          },
        },
        inningsArray: {
          $map: {
            input: "$inningsArray",
            as: "inning",
            in: {
              teamId: "$$inning.teamId",
              overs: "$$inning.overs",
              oversBowled: "$$inning.oversBowled",
              score: "$$inning.score",
              wickets: "$$inning.wickets",
              isDeclared: "$$inning.isDeclared",
              isFollowOn: "$$inning.isFollowOn",
              extras: "$$inning.extras",
            },
          },
        },
      },
    },
    {
      $project: {
        results: 1,
        tossResults: 1,
        state: 1,
        status: 1,
        innings: "$inningsArray",
        batsmanStriker: {
          $arrayElemAt: [
            {
              $filter: {
                input: "$lastInnings.currentBatters",
                as: "batter",
                cond: { $eq: ["$$batter.isStriker", true] },
              },
            },
            0,
          ],
        },
        batsmanNonStriker: {
          $arrayElemAt: [
            {
              $filter: {
                input: "$lastInnings.currentBatters",
                as: "batter",
                cond: {
                  $eq: [{ $ifNull: ["$$batter.isStriker", false] }, false],
                },
              },
            },
            0,
          ],
        },
        bowlerStriker: { $arrayElemAt: ["$lastInnings.currentBowlers", 0] },
        bowlerNonStriker: {
          $arrayElemAt: ["$lastInnings.currentBowlers", 1],
        },
      },
    },
  ]);

  return matchDataResult[0];
}

export async function getCommentary(
  req: Request<
    getValidationType<{
      id: "DatabaseIntIdParam";
    }>
  >,
  res: Response,
  next: NextFunction
) {
  try {
    const matchId = parseInt(req.params.id);
    const inningsIdx = -1;

    const commentaryResult = await getCommentaryData(matchId, inningsIdx);
    const matchDataResult = await getMatchData(matchId);

    if (!matchDataResult) {
      res.status(404);
      throw new Error(`No commentary found.`);
    }

    res.status(200).json({
      ...matchDataResult,
      ...commentaryResult,
    });
  } catch (err) {
    next(err);
  }
}

export async function getCommentaryPagination(
  req: Request<
    getValidationType<{
      id: "DatabaseIntIdParam";
      inningsType: "CommentaryInningsType";
      timestamp: "TimestampParam";
    }>
  >,
  res: Response,
  next: NextFunction
) {
  try {
    const matchId = parseInt(req.params.id);
    const inningsType = req.params.inningsType;
    const timestamp = parseInt(req.params.timestamp);
    const inningsIdx = COMMENTARY_INNINGS_TYPES.indexOf(inningsType);

    const commentaryResult = await getCommentaryData(
      matchId,
      inningsIdx,
      timestamp
    );
    const matchDataResult = await getMatchData(matchId);

    if (commentaryResult.commentaryList.length === 0 || !matchDataResult) {
      res.status(404);
      throw new Error(`No commentary found.`);
    }

    res.status(200).json({ ...matchDataResult, ...commentaryResult });
  } catch (err) {
    next(err);
  }
}

export async function addInningsCommentary(
  req: Request<
    getValidationType<{
      id: "DatabaseIntIdParam";
      inningsType: "CommentaryInningsType";
    }>,
    {},
    CommentaryInningsEntry
  >,
  res: Response,
  next: NextFunction
) {
  try {
    const matchId = parseInt(req.params.id);
    const inningsType: CommentaryInningsType = req.params.inningsType;
    const inningsIndex = COMMENTARY_INNINGS_TYPES.indexOf(inningsType);
    const prevInningsType: CommentaryInningsType | undefined =
      COMMENTARY_INNINGS_TYPES[inningsIndex - 1];
    const commentaryEntry = req.body;
    const scorecardInningsEntry = commentaryEntry.scorecard;
    const teamId = commentaryEntry.teamId;

    if (inningsType !== "preview" && teamId === 0) {
      throw new Error(`Invalid Team ID ${teamId}`);
    }

    const commentaryItem = {
      commText: commentaryEntry.commText,
      timestamp: new Date().getTime(),
      overs: scorecardInningsEntry?.oversBowled || 0,
      events: commentaryEntry.events,
      batsmanStriker: scorecardInningsEntry?.batsmanStriker,
      bowlerStriker: scorecardInningsEntry?.bowlerStriker,
    };

    const matchDataColumnsToFetch = { [`innings.${inningsType}`]: 1 };
    const commentaryFilter: Record<string, unknown> = {
      matchId,
    };

    if (prevInningsType) {
      if (prevInningsType !== "preview") {
        matchDataColumnsToFetch[`innings.${prevInningsType}.teamId`] = 1;
        matchDataColumnsToFetch[`innings.${prevInningsType}.score`] = 1;
      }
      commentaryFilter[`innings.${inningsIndex - 1}`] = { $exists: true };
    }

    if (scorecardInningsEntry && inningsType !== "preview") {
      let matchData = await MatchData.findOne(
        {
          matchId,
        },
        {
          ...matchDataColumnsToFetch,
        }
      );

      if (!matchData) {
        // document does not exist
        if (prevInningsType)
          throw new Error(
            `Cannot add score for '${inningsType}' innings before '${prevInningsType}' innings`
          );

        // validate match
        await verifyMatchAndTeam(matchId, teamId);

        matchData = new MatchData({
          matchId,
          innings: {
            first: {
              teamId,
              overs: 0,
              oversBowled: 0,
              score: 0,
              wickets: 0,
              extras: {
                nos: 0,
                wides: 0,
                legByes: 0,
                byes: 0,
                penalties: 0,
              },
              batters: [],
              bowlers: [],
            },
          },
        });
      }

      if (
        prevInningsType &&
        prevInningsType !== "preview" &&
        !matchData.innings[prevInningsType]
      ) {
        throw new Error(
          `Cannot add score for '${inningsType}' innings before '${prevInningsType}' innings`
        );
      }

      let innings: ScorecardInnings | undefined =
        matchData.innings[inningsType];
      if (!innings) {
        matchData.innings[inningsType] = {
          teamId,
          overs: 0,
          oversBowled: 0,
          score: 0,
          wickets: 0,
          extras: {
            nos: 0,
            wides: 0,
            legByes: 0,
            byes: 0,
            penalties: 0,
          },
          batters: [],
          bowlers: [],
        };

        innings = matchData.innings[inningsType];

        if (
          prevInningsType !== "preview" &&
          matchData.innings[prevInningsType]
        ) {
          innings.target = matchData.innings[prevInningsType].score + 1;
        }
      }

      baseScorecardInningsKeys.forEach((key) => {
        let val = scorecardInningsEntry[key];
        if (val !== undefined) (innings![key] as typeof val) = val;
      });

      matchData.state = "in-progress";
      if (inningsType === "first" && innings.overs === innings.oversBowled) {
        matchData.state = "innings-break";
      } else if (inningsType === "second") {
        if (innings.score >= (innings.target || 1)) {
          matchData.results = {
            resultType: "win",
            winningMargin: WICKETS_PER_INNINGS - innings.wickets,
            winningTeamId: innings.teamId,
            winByRuns: false,
            winByInnings: false,
          };

          matchData.state = "complete";
        } else if (
          innings.overs === innings.oversBowled ||
          innings.wickets === WICKETS_PER_INNINGS
        ) {
          if (prevInningsType !== "preview") {
            matchData.results = {
              resultType: "win",
              winningMargin:
                matchData.innings[prevInningsType]!.score - innings.score,
              winningTeamId: matchData.innings[prevInningsType]!.teamId,
              winByRuns: true,
              winByInnings: false,
            };
          }

          matchData.state = "complete";
        }
      }

      batterHolderKeys.forEach((key) => {
        let batter = scorecardInningsEntry[key];
        if (!batter) return;

        batter.isStriker = key === "batsmanStriker";
        addScorecardBatter(innings!.batters, batter);
      });

      bowlerHolderKeys.forEach((key) => {
        let bowler = scorecardInningsEntry[key];
        if (!bowler) return;

        if (key === "bowlerStriker") {
          bowler.isStriker = true;
          bowler.isNonStriker = false;
        } else if (key === "bowlerNonStriker") {
          bowler.isStriker = false;
          bowler.isNonStriker = true;
        }

        addScorecardBowler(innings!.bowlers, bowler);
      });

      await matchData.save();
    }

    const results = await Commentary.updateOne(commentaryFilter, {
      $set: {
        [`innings.${inningsIndex}.teamId`]: teamId,
      },
      $push: {
        [`innings.${inningsIndex}.commentaryList`]: commentaryItem,
      },
    });

    if (results.matchedCount === 0) {
      // commentary does not exist

      // validate match
      if (teamId > 0) {
        await verifyMatchAndTeam(matchId, teamId);
      }

      if (prevInningsType)
        throw new Error(
          `Cannot add commentary for '${inningsType}' innings before '${prevInningsType}' innings.`
        );

      await Commentary.create({
        matchId,
        innings: [
          {
            teamId,
            commentaryList: [commentaryItem],
          },
        ],
      });
    }

    res.status(200).json({
      status: "success",
      message: "Added successfully",
    });
  } catch (err) {
    next(err);
  }
}

// public
export async function getCurrentMatches(
  req: Request,
  res: Response<MatchCard[]>,
  next: NextFunction
) {
  try {
    const currentTime = dayjs("2024-03-24").utc().startOf("day");
    const fromTime = currentTime.subtract(4, "days").toDate();
    const endTime = currentTime.add(5, "days").toDate();

    const matches = await db.query.matches.findMany({
      // where: and(
      //   // can we use between clause?
      //   gt(matchesTable.startTime, fromTime),
      //   lt(matchesTable.startTime, endTime)
      // ),
      offset: 5,
      limit: 10,
      columns: {
        id: true,
        description: true,
        matchFormat: true,
        startTime: true,
        completeTime: true,
      },
      with: {
        series: {
          columns: {
            title: true,
          },
        },
        homeTeam: {
          columns: {
            id: true,
            name: true,
            shortName: true,
          },
        },
        awayTeam: {
          columns: {
            id: true,
            name: true,
            shortName: true,
          },
        },
      },
    });

    const matchIds = matches.map((match) => match.id);

    const matchDataResults = await MatchData.aggregate<{
      id: MatchDataType["matchId"];
      state: MatchDataType["state"];
      status: MatchDataType["status"];
      tossResults: MatchDataType["tossResults"];
      results: MatchDataType["results"];
      innings: (
        | Omit<
            BaseScorecardInnings,
            "overs" | "extras" | "isDeclared" | "isFollowOn"
          >
        | {}
      )[];
    }>([
      {
        $match: {
          matchId: {
            $in: matchIds,
          },
        },
      },
      {
        $project: {
          id: "$matchId",
          status: 1,
          state: 1,
          tossResults: 1,
          results: 1,
          innings: SCORECARD_INNINGS_TYPES.map((inningsType) =>
            getInningsKeys(inningsType)
          ),
        },
      },
    ]);

    const matchDataMap: Record<
      number,
      {
        id: number;
        status: string;
        innings: Omit<
          BaseScorecardInnings,
          "overs" | "extras" | "isDeclared" | "isFollowOn"
        >[];
      }
    > = {};
    matchDataResults.forEach((matchData) => {
      matchDataMap[matchData.id] = {
        ...matchData,
        innings: matchData.innings.filter(
          // Why do we need this filter?
          (inningsItem) => "oversBowled" in inningsItem
        ),
      };
    });

    const matchwithDataResults = matches.map((match) => {
      return {
        ...match,
        ...matchDataMap[match.id],
      };
    });

    res.status(200).json(matchwithDataResults);
  } catch (err) {
    next(err);
  }
}

export async function getMatchInfo(
  req: Request<getValidationType<{ id: "DatabaseIntIdParam" }>>,
  res: Response,
  next: NextFunction
) {
  try {
    const matchId = parseInt(req.params.id);

    const matchData = await db.query.matches.findFirst({
      columns: {
        id: true,
        description: true,
        matchFormat: true,
        startTime: true,
        completeTime: true,
      },
      where: eq(matchesTable.id, matchId),
      with: {
        series: {
          columns: {
            description: false,
          },
        },
        venue: {
          columns: {
            country: false,
          },
        },
        homeTeam: {
          columns: {
            id: true,
            name: true,
            shortName: true,
          },
        },
        awayTeam: {
          columns: {
            id: true,
            name: true,
            shortName: true,
          },
        },
      },
    });

    if (!matchData) {
      res.status(404);
      throw new Error(`Match with ID '${matchId}' does not exist.`);
    }

    const matchSquad = await MatchSquads.findOne<MatchSquad<MatchSquadPlayer>>({
      matchId,
    }).lean();

    // if (!matchSquad) {
    //   res.status(400);
    //   throw new Error("Match squad does not exist.");
    // }

    let squads: TeamSquad<MatchSquadPlayerWithInfo>[] = [];
    if (matchSquad) {
      const playerIds: DatabaseIntId[] = [];
      matchSquad.teams.forEach((team) => {
        team.players.map((player) => playerIds.push(player.id));
      });

      let playersData: Omit<PlayerWithId, "personalInfo" | "team">[] = [];
      if (playerIds.length > 0) {
        playersData = await db
          .select({
            id: playersTable.id,
            name: playersTable.name,
            shortName: playersTable.shortName,
            roleInfo: playersTable.roleInfo,
          })
          .from(playersTable)
          .where(inArray(playersTable.id, playerIds));
      }

      let playersInfoMap: { [key: DatabaseIntId]: PlayerPartial } = {};
      playersInfoMap = playersData.reduce((acc, val) => {
        acc[val.id] = val;
        return acc;
      }, playersInfoMap);

      squads = matchSquad.teams.map(
        (team): { teamId: number; players: MatchSquadPlayerWithInfo[] } => {
          team.players = team.players.map(
            (player): MatchSquadPlayerWithInfo => {
              let playerWithInfo: MatchSquadPlayerWithInfo = {
                ...player,
                ...playersInfoMap[player.id],
              };

              return playerWithInfo;
            }
          );

          return team;
        }
      );
    }

    const matchDataWithSquads: typeof matchData & {
      squads: TeamSquad<MatchSquadPlayerWithInfo>[];
    } = {
      ...matchData,
      squads,
    };

    res.status(200).json(matchDataWithSquads);
  } catch (err) {
    next(err);
  }
}

export async function getMatchScorecard(
  req: Request<getValidationType<{ id: "DatabaseIntIdParam" }>>,
  res: Response,
  next: NextFunction
) {
  try {
    const matchId = parseInt(req.params.id);

    const matchData = await MatchData.aggregate([
      {
        $match: { matchId },
      },
      {
        $project: {
          state: 1,
          status: 1,
          tossResults: 1,
          results: 1,
          innings: {
            $map: {
              input: { $objectToArray: "$innings" },
              as: "inning",
              in: "$$inning.v",
            },
          },
        },
      },
    ]);

    if (matchData.length === 0) {
      res.status(404);
      throw new Error(`No match found.`);
    }

    res.status(200).json(matchData[0]);
  } catch (err) {
    next(err);
  }
}

export async function addMatchPlayer(
  req: Request<
    getValidationType<{
      id: "DatabaseIntIdParam";
      teamId: "DatabaseIntIdParam";
    }>,
    {},
    MatchSquadPlayer
  >,
  res: Response,
  next: NextFunction
) {
  try {
    const matchId = parseInt(req.params.id);
    const teamId = parseInt(req.params.teamId);
    const player = req.body;
    const { id: playerId } = player;

    // verify if player exists
    const playerExists = await db
      .select({ id: playersTable.id })
      .from(playersTable)
      .where(eq(playersTable.id, playerId));

    if (playerExists.length === 0) {
      res.status(404);
      throw new Error(`Player with id '${playerId}' does not exist.`);
    }

    const updatedResults = await MatchSquads.updateOne(
      {
        matchId,
      },
      {
        $set: {
          "teams.$[team].players.$[player]": player,
        },
      },
      {
        arrayFilters: [{ "team.teamId": teamId }, { "player.id": playerId }],
      }
    );

    if (updatedResults.modifiedCount === 0) {
      await MatchSquads.updateOne(
        {
          matchId,
          "teams.teamId": teamId,
        },
        {
          $push: {
            "teams.$.players": player,
          },
        }
      );
    } else {
    }

    res.status(200).json({
      status: "success",
      message: "Player added to squad successfully.",
    });
  } catch (err) {
    next(err);
  }
}

export async function removeMatchPlayer(
  req: Request<
    getValidationType<{
      id: "DatabaseIntIdParam";
      teamId: "DatabaseIntIdParam";
      playerId: "DatabaseIntIdParam";
    }>
  >,
  res: Response,
  next: NextFunction
) {
  try {
    const matchId = parseInt(req.params.id);
    const teamId = parseInt(req.params.teamId);
    const playerId = parseInt(req.params.playerId);

    const results = await MatchSquads.updateOne(
      { matchId, "teams.teamId": teamId },
      {
        $pull: {
          "teams.$.players": {
            id: playerId,
          },
        },
      }
    );

    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

export async function updateMatchPlayer(
  req: Request<
    getValidationType<{
      id: "DatabaseIntIdParam";
      teamId: "DatabaseIntIdParam";
    }>,
    {},
    MatchSquadPlayerPartial
  >,
  res: Response,
  next: NextFunction
) {
  try {
    const matchId = parseInt(req.params.id);
    const teamId = parseInt(req.params.teamId);
    const player = req.body;
    const { id: playerId } = player;

    type UpdateMatchSquadPlayerType = UpdateDocType<
      MatchSquadPlayerPartial,
      "teams.$[team].players.$[player]."
    >;

    let updateQuery: UpdateMatchSquadPlayerType = Object.fromEntries(
      Object.entries(player).map(([key, value]) => {
        return [`teams.$[team].players.$[player].${key}`, value];
      })
    );

    const updatedResults = await MatchSquads.updateOne(
      {
        matchId,
      },
      {
        $set: updateQuery,
      },
      {
        arrayFilters: [{ "team.teamId": teamId }, { "player.id": playerId }],
      }
    );

    res.status(200).json(updatedResults);
  } catch (err) {
    next(err);
  }
}

export async function getMatchPlayers(
  req: Request<
    getValidationType<{ id: "DatabaseIntIdParam" }>,
    {},
    MatchSquad<MatchSquadPlayerWithInfo>
  >,
  res: Response,
  next: NextFunction
) {
  try {
    const matchId = parseInt(req.params.id);
    let results: MatchSquad<MatchSquadPlayer> | null =
      await MatchSquads.findOne({
        matchId,
      }).lean();

    if (!results) {
      res.status(404);
      throw new Error(`Squad for this match does not exist.`);
    }

    const playerIds: DatabaseIntId[] = [];
    results.teams.forEach((team) => {
      team.players.map((player) => playerIds.push(player.id));
    });

    let playersData: Omit<PlayerWithId, "personalInfo" | "team">[] = [];

    if (playerIds.length > 0) {
      playersData = await db
        .select({
          id: playersTable.id,
          name: playersTable.name,
          shortName: playersTable.shortName,
          roleInfo: playersTable.roleInfo,
        })
        .from(playersTable)
        .where(inArray(playersTable.id, playerIds));
    }

    let playersInfoMap: { [key: DatabaseIntId]: PlayerPartial } = {};
    playersInfoMap = playersData.reduce((acc, val) => {
      acc[val.id] = val;
      return acc;
    }, playersInfoMap);

    const teamSquads = results.teams.map(
      (team): TeamSquad<MatchSquadPlayerWithInfo> => {
        team.players = team.players.map((player): MatchSquadPlayerWithInfo => {
          let playerWithInfo: MatchSquadPlayerWithInfo = {
            ...player,
            ...playersInfoMap[player.id],
          };
          return playerWithInfo;
        });

        return team;
      }
    );

    res.status(200).json(teamSquads);
  } catch (err) {
    next(err);
  }
}
