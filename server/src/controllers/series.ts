import { NextFunction, Request, Response } from "express";
import { db } from "../db/postgres";
import * as tables from "../db/postgres/schema";
import {
  Series,
  SeriesOptional,
  SeriesWithId,
  getValidationType,
} from "../types";
import { eq } from "drizzle-orm";

export async function getAll(
  req: Request,
  res: Response<SeriesWithId[]>,
  next: NextFunction
) {
  try {
    const results = await db.select().from(tables.series);

    res.status(200).json(results);
  } catch (err) {
    next(err);
  }
}

export async function getOne(
  req: Request<getValidationType<{ id: "DatabaseIntIdParam" }>, SeriesWithId>,
  res: Response,
  next: NextFunction
) {
  try {
    const id = parseInt(req.params.id);
    const results = await db
      .select()
      .from(tables.series)
      .where(eq(tables.series.id, id));

    if (results.length === 0) {
      res.status(404);
      throw new Error(`Series with id '${id}' not found.`);
    }

    res.status(200).json(results[0]);
  } catch (err) {
    next(err);
  }
}

export async function createOne(
  req: Request<{}, SeriesWithId, Series>,
  res: Response,
  next: NextFunction
) {
  try {
    const newSeries: Series = req.body;

    const results = await db
      .insert(tables.series)
      .values(newSeries)
      .returning({ id: tables.series.id });

    const savedSeries = { ...newSeries, id: results[0].id };

    res.status(201).json(savedSeries);
  } catch (err) {
    next(err);
  }
}

export async function updateOne(
  req: Request<
    getValidationType<{ id: "DatabaseIntIdParam" }>,
    SeriesWithId,
    SeriesOptional
  >,
  res: Response,
  next: NextFunction
) {
  try {
    const id = parseInt(req.params.id);
    const series = req.body;

    const results = await db
      .update(tables.series)
      .set(series)
      .where(eq(tables.series.id, id))
      .returning();

    console.log("results ", results);

    if (results.length === 0) {
      res.status(404);
      throw new Error(`Series with id '${id}' not found.`);
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

    await db.delete(tables.series).where(eq(tables.series.id, id));

    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
