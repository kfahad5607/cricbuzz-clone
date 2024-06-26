import { eq, inArray } from "drizzle-orm";
import { NextFunction, Request, Response } from "express";
import MatchSquads from "../db/mongo/schema/matchSquad";
import Scorecard from "../db/mongo/schema/scorecard";
import { db } from "../db/postgres";
import * as tables from "../db/postgres/schema";
import { verifyMatchAndTeam } from "../helpers/matches";
import {
  addScorecardBatter,
  addScorecardBowler,
  baseScorecardKeys,
  batterHolderKeys,
  bowlerHolderKeys,
} from "../helpers/scorecard";
import {
  DatabaseIntId,
  Match,
  MatchCard,
  MatchOptional,
  MatchSquad,
  MatchSquadPlayer,
  MatchSquadPlayerOptional,
  MatchSquadPlayerWithInfo,
  MatchWithId,
  PlayerOptional,
  TeamSquad,
  UpdateDocType,
  getValidationType,
} from "../types";
import {
  SCORECARD_INNINGS_TYPES,
  COMMENTARY_INNINGS_TYPES,
  ScorecardInningsType,
  CommentaryInningsType,
  ScorecardInnings,
  ScorecardInningsEntry,
} from "../types";
import Commentary from "../db/mongo/schema/commentary";
import { CommentaryInningsEntry } from "../types/commentary";

// tables
const matchesTable = tables.matches;
const playersTable = tables.players;

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

    console.log("createOne ", newMatch);

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
    console.log("matchSquadResults ", matchSquadResults);

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
    MatchOptional
  >,
  res: Response,
  next: NextFunction
) {
  try {
    const id = parseInt(req.params.id);
    const match = req.body!;

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

    const results = await MatchSquads.deleteOne({ matchId });

    res.status(204).end();
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

    console.log("getAllInningsScore ", matchId);

    const scorecard = await Scorecard.findOne({
      matchId,
    });

    if (!scorecard) {
      res.status(404);
      throw new Error(`No scorecard found.`);
    }

    console.log("results ", scorecard);

    res.status(200).json({
      status: "success",
      data: scorecard,
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

    console.log("getInningsScore ", matchId, inningsType);

    const scorecard = await Scorecard.findOne(
      {
        matchId,
      },
      {
        [`innings.${inningsType}`]: 1,
      }
    );

    if (!scorecard || !scorecard.innings[inningsType]) {
      res.status(404);
      throw new Error(`Scorecard innings does not exist`);
    }

    const innings = scorecard.innings[inningsType];

    console.log("results ", scorecard);

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
    }

    let scorecard = await Scorecard.findOne(
      {
        matchId,
      },
      {
        ...columnsToFetch,
      }
    );

    if (!scorecard) {
      // document does not exist
      if (inningsType !== "first")
        throw new Error(
          `Cannot add score for '${inningsType}' innings before '${prevInningsType}' innings`
        );

      // validate match
      await verifyMatchAndTeam(matchId, teamId);

      scorecard = new Scorecard({
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

    if (prevInningsType && !scorecard.innings[prevInningsType]) {
      throw new Error(
        `Cannot add score for '${inningsType}' innings before '${prevInningsType}' innings`
      );
    }

    let innings: ScorecardInnings | undefined = scorecard.innings[inningsType];
    if (!innings) {
      scorecard.innings[inningsType] = {
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

      innings = scorecard.innings[inningsType];
    }

    baseScorecardKeys.forEach((key) => {
      let val = scorecardInningsEntry[key];
      if (val !== undefined) (innings![key] as typeof val) = val;
    });

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

    let results = await scorecard.save();

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

    let scorecard = await Scorecard.findOne(
      {
        matchId,
      },
      {
        ...columnsToFetch,
      }
    );

    if (!scorecard) {
      res.status(404);
      throw new Error("Scorecard does not exist.");
    }

    if (scorecard.innings[nextInningsType]) {
      res.status(400);
      throw new Error(
        `Cannot delete '${inningsType}' innings before '${nextInningsType}' innings.`
      );
    }

    scorecard.innings[inningsType] = undefined;

    if (inningsType === "first") {
      await scorecard.deleteOne();
    } else {
      await scorecard.save();
    }

    res.status(200).json({
      status: "success",
      message: "Innings deleted successfully",
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

    const result = await Commentary.aggregate([
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
    ]);

    if (!result[0] || !result[0].innings) {
      res.status(404);
      throw new Error(`No commentary found.`);
    }

    console.log("results ", result);

    res.status(200).json({
      status: "success",
      data: result[0].innings,
    });
  } catch (err) {
    next(err);
  }
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

    const commentaryResult = await Commentary.aggregate([
      { $match: { matchId } },
      {
        $project: {
          lastInning: { $arrayElemAt: ["$innings", -1] },
        },
      },
      {
        $project: {
          commentaryList: {
            $slice: ["$lastInning.commentaryList", -20],
          },
        },
      },
    ]);

    const scorecardResult = await Scorecard.aggregate([
      { $match: { matchId } },
      {
        $project: {
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
          lastInnings: {
            $let: {
              vars: {
                lastInnings: {
                  $arrayElemAt: ["$inningsArray", -1],
                },
              },
              in: {
                currentBatters: {
                  $sortArray: {
                    input: {
                      $filter: {
                        input: "$$lastInnings.batters",
                        as: "batter",
                        cond: {
                          $not: { $ifNull: ["$$batter.fallOfWicket", false] },
                        },
                      },
                    },
                    sortBy: { isStriker: -1 },
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
                currentBatters_: {
                  $filter: {
                    input: "$$lastInnings.batters",
                    as: "batter",
                    cond: {
                      $not: { $ifNull: ["$$batter.fallOfWicket", false] },
                    },
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
          innings: "$inningsArray",
          batsmanStriker: { $arrayElemAt: ["$lastInnings.currentBatters", 0] },
          batsmanNonStriker: {
            $arrayElemAt: ["$lastInnings.currentBatters", 1],
          },
          bowlerStriker: { $arrayElemAt: ["$lastInnings.currentBowlers", 0] },
          bowlerNonStriker: {
            $arrayElemAt: ["$lastInnings.currentBowlers", 1],
          },
        },
      },
    ]);

    // things to get
    // batsmanStriker, batsmanNonStriker # last innings
    // bowlerStriker, bowlerNonStriker # last innings
    // inningsScoreList # all innings
    // match state, tossResults, results

    if (commentaryResult.length === 0 || scorecardResult.length === 0) {
      res.status(404);
      throw new Error(`No commentary found.`);
    }

    res.status(200).json({ ...commentaryResult[0], ...scorecardResult[0] });
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
    const commentaryStriker =
      scorecardInningsEntry[commentaryEntry.ballStrikerKey];
    const teamId = scorecardInningsEntry.teamId;

    const commentaryItem = {
      commText: commentaryEntry.commText,
      timestamp: new Date().getTime(),
      overs: scorecardInningsEntry.oversBowled,
      events: commentaryEntry.events,
      batsmanStriker: commentaryStriker,
      bowlerStriker: scorecardInningsEntry.bowlerStriker,
    };

    const scoreColumnsToFetch = { [`innings.${inningsType}`]: 1 };
    const commentaryFilter: Record<string, unknown> = {
      matchId,
    };

    if (prevInningsType) {
      if (prevInningsType !== "preview")
        scoreColumnsToFetch[`innings.${prevInningsType}.teamId`] = 1;
      commentaryFilter[`innings.${inningsIndex - 1}`] = { $exists: true };
    }

    if (inningsType !== "preview") {
      let scorecard = await Scorecard.findOne(
        {
          matchId,
        },
        {
          ...scoreColumnsToFetch,
        }
      );

      if (!scorecard) {
        // document does not exist
        if (prevInningsType)
          throw new Error(
            `Cannot add score for '${inningsType}' innings before '${prevInningsType}' innings`
          );

        // validate match
        await verifyMatchAndTeam(matchId, teamId);

        scorecard = new Scorecard({
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
        !scorecard.innings[prevInningsType]
      ) {
        throw new Error(
          `Cannot add score for '${inningsType}' innings before '${prevInningsType}' innings`
        );
      }

      let innings: ScorecardInnings | undefined =
        scorecard.innings[inningsType];
      if (!innings) {
        scorecard.innings[inningsType] = {
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

        innings = scorecard.innings[inningsType];
      }

      baseScorecardKeys.forEach((key) => {
        let val = scorecardInningsEntry[key];
        if (val !== undefined) (innings![key] as typeof val) = val;
      });

      batterHolderKeys.forEach((key) => {
        let batter = scorecardInningsEntry[key];
        if (!batter) return;

        batter.isStriker = key === "batsmanStriker";
        addScorecardBatter(innings!.batters, batter);
      });

      bowlerHolderKeys.forEach((key) => {
        let bowler = scorecardInningsEntry[key];
        if (!bowler) return;

        addScorecardBowler(innings!.bowlers, bowler);
      });

      await scorecard.save();
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
      await verifyMatchAndTeam(matchId, teamId);

      if (prevInningsType)
        throw new Error(
          `Cannot add commentary for '${inningsType}' innings before '${prevInningsType}' innings.`
        );

      const commentary = await Commentary.create({
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
    const results = await db.query.matches.findMany({
      columns: {
        id: true,
        description: true,
        matchFormat: true,
        startTime: true,
        status: true,
      },
      with: {
        series: {
          columns: {
            title: true,
          },
        },
        homeTeam: {
          columns: {
            name: true,
            shortName: true,
          },
        },
        awayTeam: {
          columns: {
            name: true,
            shortName: true,
          },
        },
      },
    });

    res.status(200).json(results);
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
        status: true,
      },
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

    const matchSquads: MatchSquad<MatchSquadPlayer>[] =
      await MatchSquads.aggregate([
        { $match: { matchId } },
        {
          $project: {
            teams: {
              $map: {
                input: "$teams",
                as: "team",
                in: {
                  teamId: "$$team.teamId",
                  players: {
                    $filter: {
                      input: "$$team.players",
                      as: "player",
                      cond: {
                        $or: [
                          { $eq: ["$$player.isPlaying", true] },
                          { $eq: ["$$player.isInSubs", true] },
                        ],
                      },
                    },
                  },
                },
              },
            },
          },
        },
      ]);

    if (matchSquads.length === 0) {
      res.status(400);
      throw new Error("Match squad does not exist.");
    }

    const playerIds: DatabaseIntId[] = [];
    matchSquads[0].teams.forEach((team) => {
      team.players.map((player) => playerIds.push(player.playerId));
    });

    const playersData = await db
      .select({
        id: playersTable.id,
        name: playersTable.name,
        shortName: playersTable.shortName,
        roleInfo: playersTable.roleInfo,
      })
      .from(playersTable)
      .where(inArray(playersTable.id, playerIds));

    let playersInfoMap: { [key: DatabaseIntId]: PlayerOptional } = {};
    playersInfoMap = playersData.reduce((acc, val) => {
      acc[val.id] = val;
      return acc;
    }, playersInfoMap);

    const squads: TeamSquad<MatchSquadPlayerWithInfo>[] =
      matchSquads[0].teams.map(
        (team): { teamId: number; players: MatchSquadPlayerWithInfo[] } => {
          team.players = team.players.map(
            (player): MatchSquadPlayerWithInfo => {
              let playerWithInfo: MatchSquadPlayerWithInfo = {
                ...player,
                ...playersInfoMap[player.playerId],
              };
              return playerWithInfo;
            }
          );

          return team;
        }
      );

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

export async function getMatchScore(
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
        status: true,
      },
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

    const matchSquads: MatchSquad<MatchSquadPlayer>[] =
      await MatchSquads.aggregate([
        { $match: { matchId } },
        {
          $project: {
            teams: {
              $map: {
                input: "$teams",
                as: "team",
                in: {
                  teamId: "$$team.teamId",
                  players: {
                    $filter: {
                      input: "$$team.players",
                      as: "player",
                      cond: {
                        $or: [
                          { $eq: ["$$player.isPlaying", true] },
                          { $eq: ["$$player.isInSubs", true] },
                        ],
                      },
                    },
                  },
                },
              },
            },
          },
        },
      ]);

    if (matchSquads.length === 0) {
      res.status(400);
      throw new Error("Match squad does not exist.");
    }

    const playerIds: DatabaseIntId[] = [];
    matchSquads[0].teams.forEach((team) => {
      team.players.map((player) => playerIds.push(player.playerId));
    });

    const playersData = await db
      .select({
        id: playersTable.id,
        name: playersTable.name,
        shortName: playersTable.shortName,
        roleInfo: playersTable.roleInfo,
      })
      .from(playersTable)
      .where(inArray(playersTable.id, playerIds));

    let playersInfoMap: { [key: DatabaseIntId]: PlayerOptional } = {};
    playersInfoMap = playersData.reduce((acc, val) => {
      acc[val.id] = val;
      return acc;
    }, playersInfoMap);

    const squads: TeamSquad<MatchSquadPlayerWithInfo>[] =
      matchSquads[0].teams.map(
        (team): { teamId: number; players: MatchSquadPlayerWithInfo[] } => {
          team.players = team.players.map(
            (player): MatchSquadPlayerWithInfo => {
              let playerWithInfo: MatchSquadPlayerWithInfo = {
                ...player,
                ...playersInfoMap[player.playerId],
              };
              return playerWithInfo;
            }
          );

          return team;
        }
      );

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

export async function addMatchPlayer(
  req: Request<
    getValidationType<{
      id: "DatabaseIntIdParam";
      teamId: "DatabaseIntIdParam";
    }>,
    MatchSquadPlayer
  >,
  res: Response,
  next: NextFunction
) {
  try {
    const matchId = parseInt(req.params.id);
    const teamId = parseInt(req.params.teamId);
    const player = req.body;
    const { playerId } = player;

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
        arrayFilters: [
          { "team.teamId": teamId },
          { "player.playerId": player.playerId },
        ],
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
            playerId,
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
    MatchSquadPlayerOptional
  >,
  res: Response,
  next: NextFunction
) {
  try {
    const matchId = parseInt(req.params.id);
    const teamId = parseInt(req.params.teamId);
    const player = req.body;
    const { playerId } = player;

    type UpdateMatchSquadPlayerType = UpdateDocType<
      MatchSquadPlayerOptional,
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
        arrayFilters: [
          { "team.teamId": teamId },
          { "player.playerId": playerId },
        ],
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
      team.players.map((player) => playerIds.push(player.playerId));
    });

    const playersData = await db
      .select({
        id: playersTable.id,
        name: playersTable.name,
        shortName: playersTable.shortName,
        roleInfo: playersTable.roleInfo,
      })
      .from(playersTable)
      .where(inArray(playersTable.id, playerIds));

    let playersInfoMap: { [key: DatabaseIntId]: PlayerOptional } = {};
    playersInfoMap = playersData.reduce((acc, val) => {
      acc[val.id] = val;
      return acc;
    }, playersInfoMap);

    const teamSquads = results.teams.map(
      (team): TeamSquad<MatchSquadPlayerWithInfo> => {
        team.players = team.players.map((player): MatchSquadPlayerWithInfo => {
          let playerWithInfo: MatchSquadPlayerWithInfo = {
            ...player,
            ...playersInfoMap[player.playerId],
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
