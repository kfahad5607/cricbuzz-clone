import { NextFunction, Request, Response } from "express";
import slugify from "slugify";
import { db } from "../db/postgres";
import * as tables from "../db/postgres/schema";
import {
  ParamsWithNumId,
  NewSeries,
  Series,
  SeriesOptional,
  SeriesWithId,
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
  req: Request<ParamsWithNumId, SeriesWithId>,
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
  req: Request<{}, SeriesWithId, NewSeries>,
  res: Response,
  next: NextFunction
) {
  try {
    const slug = slugify(req.body.title, {
      lower: true,
    });
    const newSeries: Series = { ...req.body, slug };

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
  req: Request<ParamsWithNumId, SeriesWithId, SeriesOptional>,
  res: Response,
  next: NextFunction
) {
  try {
    const id = parseInt(req.params.id);
    const series = req.body;

    if (series.title && !series.slug) {
      series.slug = slugify(series.title, {
        lower: true,
      });
    }

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
  req: Request<ParamsWithNumId>,
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
