import { eq, inArray } from "drizzle-orm";
import { PgColumn } from "drizzle-orm/pg-core";
import { NextFunction, Request, Response } from "express";
import slugify from "slugify";
import MatchSquads from "../db/mongo/schema/matchSquad";
import { db } from "../db/postgres";
import * as tables from "../db/postgres/schema";
import { isObjEmpty } from "../helpers";
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
  NewMatch,
  PlayerOptional,
  getValidationType,
} from "../types";

// tables
const seriesTable = tables.series;
const matchesTable = tables.matches;
const teamsTable = tables.teams;
const playersTable = tables.players;

const SLUG_INPUT_KEYS = [
  "awayTeam",
  "homeTeam",
  "series",
  "description",
] as const;

type SlugInputData = Pick<NewMatch, (typeof SLUG_INPUT_KEYS)[number]>;
type SlugInputColumns = {
  [key in keyof SlugInputData]: PgColumn;
};

type UpdateDocType<T extends Record<string, any>, Prefix extends string> = {
  [K in keyof T as `${Prefix}${K & string}`]: T[K];
};

async function generateSlug(data: SlugInputData): Promise<string> {
  const teamsInfo = await db
    .select({ shortName: teamsTable.shortName })
    .from(teamsTable)
    .where(inArray(teamsTable.id, [data.homeTeam, data.awayTeam]));

  if (teamsInfo.length < 2)
    throw Error(`'homeTeam' or 'awayTeam' does not exist`);

  const seriesInfo = await db
    .select({ slug: seriesTable.slug })
    .from(seriesTable)
    .where(eq(seriesTable.id, data.series));

  if (seriesInfo.length === 0) throw Error(`'series' does not exist`);

  let slugInput = `${teamsInfo[0].shortName}-vs-${teamsInfo[1].shortName}`;
  slugInput = `${slugInput}-${data.description}-${seriesInfo[0].slug}`;

  return slugify(slugInput, {
    lower: true,
  });
}

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
  req: Request<{}, MatchWithId, NewMatch>,
  res: Response,
  next: NextFunction
) {
  try {
    const slug = await generateSlug(req.body);
    const newMatch: Match = { ...req.body, slug };

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

    // extract slug-member properties
    let slugInput: Partial<SlugInputData> = Object.fromEntries(
      Object.entries(match).filter(([key]) => {
        return SLUG_INPUT_KEYS.includes(key as keyof SlugInputData);
      })
    );

    // if slug-member property is being updated
    if (!isObjEmpty(slugInput)) {
      // get remaining slug-member properties
      let columnsToFetch = SLUG_INPUT_KEYS.filter(
        (key) => !(key in slugInput)
      ).reduce((acc, key) => {
        acc[key] = matchesTable[key];
        return acc;
      }, {} as SlugInputColumns);

      if (!isObjEmpty(columnsToFetch)) {
        let results = await db.select(columnsToFetch).from(matchesTable);
        slugInput = { ...slugInput, ...results[0] };
      }

      match.slug = await generateSlug(slugInput as SlugInputData);

      // Needs to update match squad if team ID changes
    }

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
        slug: true,
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

    const result = await db.query.matches.findFirst({
      columns: {
        id: true,
        slug: true,
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
            slug: true,
            shortName: true,
          },
        },
        awayTeam: {
          columns: {
            id: true,
            name: true,
            slug: true,
            shortName: true,
          },
        },
      },
    });

    if (!result) {
      res.status(404);
      throw new Error(`Match with ID '${matchId}' does not exist.`);
    }

    res.status(200).json(result);
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

    console.log("delete ", results);

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

export async function getMatchSquads(
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
        slug: playersTable.slug,
        roleInfo: playersTable.roleInfo,
      })
      .from(playersTable)
      .where(inArray(playersTable.id, playerIds));

    let playersInfoMap: { [key: DatabaseIntId]: PlayerOptional } = {};
    playersInfoMap = playersData.reduce((acc, val) => {
      acc[val.id] = val;
      return acc;
    }, playersInfoMap);

    let matchSquadWithPlayerInfo: MatchSquad<MatchSquadPlayerWithInfo> = {
      matchId: results.matchId,
      teams: [],
    } as MatchSquad<MatchSquadPlayerWithInfo>;

    matchSquadWithPlayerInfo.teams = results.teams.map(
      (team): { teamId: number; players: MatchSquadPlayerWithInfo[] } => {
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

    res.status(200).json(matchSquadWithPlayerInfo);
  } catch (err) {
    next(err);
  }
}
