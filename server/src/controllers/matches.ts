import { eq, inArray } from "drizzle-orm";
import { PgColumn } from "drizzle-orm/pg-core";
import { NextFunction, Request, Response } from "express";
import slugify from "slugify";
import MatchSquads from "../db/mongo/schema/matchSquad";
import { db } from "../db/postgres";
import * as tables from "../db/postgres/schema";
import { isObjEmpty } from "../helpers";
import {
  Match,
  MatchCard,
  MatchOptional,
  MatchSquad,
  MatchSquadPlayer,
  MatchSquadPlayerOptional,
  MatchWithId,
  NewMatch,
  getValidationType,
} from "../types";

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
    .select({ shortName: tables.teams.shortName })
    .from(tables.teams)
    .where(inArray(tables.teams.id, [data.homeTeam, data.awayTeam]));

  if (teamsInfo.length < 2)
    throw Error(`'homeTeam' or 'awayTeam' does not exist`);

  const seriesInfo = await db
    .select({ slug: tables.series.slug })
    .from(tables.series)
    .where(eq(tables.series.id, data.series));

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
    const results = await db.select().from(tables.matches);

    res.status(200).json(results);
  } catch (err) {
    next(err);
  }
}

export async function getOne(
  req: Request<getValidationType<{ id: "DatabaseIntId" }>, MatchWithId>,
  res: Response,
  next: NextFunction
) {
  try {
    const id = parseInt(req.params.id);
    const results = await db
      .select()
      .from(tables.matches)
      .where(eq(tables.matches.id, id));

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
      .insert(tables.matches)
      .values(newMatch)
      .returning({ id: tables.matches.id });

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
    getValidationType<{ id: "DatabaseIntId" }>,
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
        acc[key] = tables.matches[key];
        return acc;
      }, {} as SlugInputColumns);

      if (!isObjEmpty(columnsToFetch)) {
        let results = await db.select(columnsToFetch).from(tables.matches);
        slugInput = { ...slugInput, ...results[0] };
      }

      match.slug = await generateSlug(slugInput as SlugInputData);

      // Needs to update match squad if team ID changes
    }

    const results = await db
      .update(tables.matches)
      .set(match)
      .where(eq(tables.matches.id, id))
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
  req: Request<getValidationType<{ id: "DatabaseIntId" }>>,
  res: Response,
  next: NextFunction
) {
  try {
    const matchId = parseInt(req.params.id);

    await db.delete(tables.matches).where(eq(tables.matches.id, matchId));

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

export async function addMatchPlayer(
  req: Request<
    getValidationType<{ id: "DatabaseIntId"; teamId: "DatabaseIntId" }>,
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
      .select({ id: tables.players.id })
      .from(tables.players)
      .where(eq(tables.players.id, playerId));

    if (playerExists.length === 0)
      throw new Error(`Player with id '${playerId}' does not exist.`);

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
      id: "DatabaseIntId";
      teamId: "DatabaseIntId";
      playerId: "DatabaseIntId";
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
    getValidationType<{ id: "DatabaseIntId"; teamId: "DatabaseIntId" }>,
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
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const results = await MatchSquads.find();

    res.status(200).json(results);
  } catch (err) {
    next(err);
  }
}
