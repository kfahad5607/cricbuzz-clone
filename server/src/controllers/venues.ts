import { asc, eq, ilike, or, sql } from "drizzle-orm";
import { NextFunction, Request, Response } from "express";
import { setTimeout } from "node:timers/promises";
import { db } from "../db/postgres";
import * as tables from "../db/postgres/schema";
import { PaginatedResponse } from "../helpers/api";
import { Venue, VenueOptional, VenueWithId, getValidationType } from "../types";

export async function getAll(
  req: Request<
    {},
    {},
    {},
    getValidationType<{}, { query: "ZString"; page: "DatabaseIntIdParam" }>
  >,
  res: Response<PaginatedResponse<VenueWithId>>,
  next: NextFunction
) {
  try {
    let query = (req.query.query || "").trim();
    const limit = 5;
    const pageNo = parseInt(req.query.page || "1");
    const offset = (pageNo - 1) * limit;

    // await setTimeout(2000);

    const baseQuery = db.select().from(tables.venues);
    const baseCountQuery = db
      .select({
        count: sql<number>`cast(count(${tables.venues.id}) as int)`,
      })
      .from(tables.venues);
    if (query) {
      query = `%${query}%`;
      baseQuery.where(
        or(
          ilike(tables.venues.name, query),
          ilike(tables.venues.city, query),
          ilike(tables.venues.country, query)
        )
      );
      baseCountQuery.where(
        or(
          ilike(tables.venues.name, query),
          ilike(tables.venues.city, query),
          ilike(tables.venues.country, query)
        )
      );
    }

    const results = await baseQuery
      .orderBy(asc(tables.venues.name))
      .offset(offset)
      .limit(limit);

    const totalRecordsResults = await baseCountQuery;

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
  req: Request<getValidationType<{ id: "DatabaseIntIdParam" }>, VenueWithId>,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Math.max(parseInt(req.params.id), 1);
    const results = await db
      .select()
      .from(tables.venues)
      .where(eq(tables.venues.id, id));

    if (results.length === 0) {
      res.status(404);
      throw new Error(`Venue with id '${id}' not found.`);
    }

    res.status(200).json(results[0]);
  } catch (err) {
    next(err);
  }
}

export async function createOne(
  req: Request<{}, VenueWithId, Venue>,
  res: Response,
  next: NextFunction
) {
  try {
    const newVenue: Venue = req.body;

    //await setTimeout(1100);

    // res.status(500);
    // throw new Error(`Could not create the venue.`);
    // return res.status(201).json({
    //   ...newVenue,
    //   id: 1000,
    // });

    const results = await db
      .insert(tables.venues)
      .values(newVenue)
      .returning({ id: tables.venues.id });

    const savedVenue = { ...newVenue, id: results[0].id };

    res.status(201).json(savedVenue);
  } catch (err) {
    next(err);
  }
}

export async function updateOne(
  req: Request<
    getValidationType<{ id: "DatabaseIntIdParam" }>,
    VenueWithId,
    VenueOptional
  >,
  res: Response,
  next: NextFunction
) {
  try {
    const id = parseInt(req.params.id);
    const venue = req.body;

    const results = await db
      .update(tables.venues)
      .set(venue)
      .where(eq(tables.venues.id, id))
      .returning();

    console.log("results ", results);

    if (results.length === 0) {
      res.status(404);
      throw new Error(`Venue with id '${id}' not found.`);
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

    await db.delete(tables.venues).where(eq(tables.venues.id, id));

    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
