import { asc, eq, ilike, or, SQL, sql } from "drizzle-orm";
import { NextFunction, Request, Response } from "express";
import { db } from "../db/postgres";
import * as tables from "../db/postgres/schema";
import {
  ApiPlayer,
  Player,
  PlayerPartial,
  PlayerWithId,
  getValidationType,
} from "../types";
import { PaginatedResponse } from "../helpers/api";

export async function getAll(
  req: Request<
    {},
    {},
    {},
    getValidationType<{}, { query: "ZString"; page: "DatabaseIntIdParam" }>
  >,
  res: Response<PaginatedResponse<ApiPlayer>>,
  next: NextFunction
) {
  try {
    let query = (req.query.query || "").trim();
    const limit = 20;
    const pageNo = parseInt(req.query.page || "1");
    const offset = (pageNo - 1) * limit;

    let whereClause: SQL<unknown> | undefined = undefined;
    if (query) {
      query = `%${query}%`;
      whereClause = ilike(tables.players.name, query);
    }

    const results = await db.query.players.findMany({
      columns: {
        id: true,
        name: true,
        roleInfo: true,
        personalInfo: true,
      },
      with: {
        team: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
      limit: limit,
      offset: offset,
      orderBy: [asc(tables.players.name)],
      where: whereClause,
    });

    const totalRecordsResults = await db
      .select({
        count: sql<number>`cast(count(${tables.players.id}) as int)`,
      })
      .from(tables.players)
      .where(whereClause);

    res.status(200).json({
      data: results,
      currentPage: pageNo,
      pageSize: limit,
      totalRecords: totalRecordsResults[0].count,
    });
  } catch (err) {
    next(err);
  }
}

export async function getOne(
  req: Request<getValidationType<{ id: "DatabaseIntIdParam" }>, PlayerWithId>,
  res: Response,
  next: NextFunction
) {
  try {
    const id = parseInt(req.params.id);
    const results = await db
      .select()
      .from(tables.players)
      .where(eq(tables.players.id, id));

    if (results.length === 0) {
      res.status(404);
      throw new Error(`Player with id '${id}' not found.`);
    }

    res.status(200).json(results[0]);
  } catch (err) {
    next(err);
  }
}

export async function createOne(
  req: Request<{}, PlayerWithId, Player>,
  res: Response,
  next: NextFunction
) {
  try {
    const newPlayer: Player = req.body;

    const results = await db
      .insert(tables.players)
      .values(newPlayer)
      .returning({ id: tables.players.id });

    const savedPlayer = { ...newPlayer, id: results[0].id };

    res.status(201).json(savedPlayer);
  } catch (err) {
    next(err);
  }
}

export async function updateOne(
  req: Request<
    getValidationType<{ id: "DatabaseIntIdParam" }>,
    PlayerWithId,
    PlayerPartial
  >,
  res: Response,
  next: NextFunction
) {
  try {
    const id = parseInt(req.params.id);
    const player = req.body;

    const results = await db
      .update(tables.players)
      .set(player)
      .where(eq(tables.players.id, id))
      .returning();

    if (results.length === 0) {
      res.status(404);
      throw new Error(`Player with id '${id}' not found.`);
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
    const id = parseInt(req.params.id);

    await db.delete(tables.players).where(eq(tables.players.id, id));

    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
