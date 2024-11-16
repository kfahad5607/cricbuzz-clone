import { asc, eq, ilike, or, SQL, sql } from "drizzle-orm";
import { NextFunction, Request, Response } from "express";
import { db } from "../db/postgres";
import * as tables from "../db/postgres/schema";
import { Team, TeamOptional, TeamWithId, getValidationType } from "../types";
import { PaginatedResponse } from "../helpers/api";

export async function getAll(
  req: Request<
    {},
    {},
    {},
    getValidationType<{}, { query: "ZString"; page: "DatabaseIntIdParam" }>
  >,
  res: Response<PaginatedResponse<TeamWithId>>,
  next: NextFunction
) {
  try {
    let query = (req.query.query || "").trim();
    const limit = 20;
    const pageNo = parseInt(req.query.page || "1");
    const offset = (pageNo - 1) * limit;

    const baseQuery = db.select().from(tables.teams);
    let whereClause: SQL<unknown> | undefined = undefined;
    if (query) {
      query = `%${query}%`;

      whereClause = or(
        ilike(tables.teams.name, query),
        ilike(tables.teams.shortName, query)
      );
      baseQuery.where(whereClause);
    }

    const results = await baseQuery
      .orderBy(asc(tables.teams.name))
      .offset(offset)
      .limit(limit);

    const totalRecordsResults = await db
      .select({
        count: sql<number>`cast(count(${tables.series.id}) as int)`,
      })
      .from(tables.teams)
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
  req: Request<getValidationType<{ id: "DatabaseIntIdParam" }>, TeamWithId>,
  res: Response,
  next: NextFunction
) {
  try {
    const id = parseInt(req.params.id);
    const results = await db
      .select()
      .from(tables.teams)
      .where(eq(tables.teams.id, id));

    if (results.length === 0) {
      res.status(404);
      throw new Error(`Team with id '${id}' not found.`);
    }

    res.status(200).json(results[0]);
  } catch (err) {
    next(err);
  }
}

export async function createOne(
  req: Request<{}, TeamWithId, Team>,
  res: Response,
  next: NextFunction
) {
  try {
    const newTeam: Team = req.body;

    const results = await db
      .insert(tables.teams)
      .values(newTeam)
      .returning({ id: tables.teams.id });

    const savedTeam = { ...newTeam, id: results[0].id };

    res.status(201).json(savedTeam);
  } catch (err) {
    next(err);
  }
}

export async function updateOne(
  req: Request<
    getValidationType<{ id: "DatabaseIntIdParam" }>,
    TeamWithId,
    TeamOptional
  >,
  res: Response,
  next: NextFunction
) {
  try {
    const id = parseInt(req.params.id);
    const team = req.body;

    const results = await db
      .update(tables.teams)
      .set(team)
      .where(eq(tables.teams.id, id))
      .returning();

    console.log("results ", results);

    if (results.length === 0) {
      res.status(404);
      throw new Error(`Team with id '${id}' not found.`);
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

    await db.delete(tables.teams).where(eq(tables.teams.id, id));

    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
