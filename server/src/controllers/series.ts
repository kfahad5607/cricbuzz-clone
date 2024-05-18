import { NextFunction, Request, Response } from "express";
import slugify from "slugify";
import { db } from "../db/postgres";
import * as tables from "../db/postgres/schema";
import { NewSeries, Series } from "../types";

export async function createOne(
  req: Request<{}, NewSeries>,
  res: Response,
  next: NextFunction
) {
  try {
    const newSeries: Series = req.body;
    newSeries.slug = slugify(newSeries.title, {
      lower: true,
    });

    let result = await db
      .insert(tables.series)
      .values(newSeries)
      .returning({ id: tables.series.id });

    newSeries.id = result[0].id;

    res.status(201);
    res.json(newSeries);
  } catch (err) {
    next(err);
  }
}
