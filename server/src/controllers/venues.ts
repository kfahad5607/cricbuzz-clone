import { eq } from "drizzle-orm";
import { NextFunction, Request, Response } from "express";
import slugify from "slugify";
import { db } from "../db/postgres";
import * as tables from "../db/postgres/schema";
import {
  NewVenue,
  Venue,
  VenueOptional,
  VenueWithId,
  getValidationType,
} from "../types";

export async function getAll(
  req: Request,
  res: Response<VenueWithId[]>,
  next: NextFunction
) {
  try {
    const results = await db.select().from(tables.venues);

    res.status(200).json(results);
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
    const id = parseInt(req.params.id);
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
  req: Request<{}, VenueWithId, NewVenue>,
  res: Response,
  next: NextFunction
) {
  try {
    const slug = slugify(req.body.name, {
      lower: true,
    });
    const newVenue: Venue = { ...req.body, slug };

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

    if (venue.name && !venue.slug) {
      venue.slug = slugify(venue.name, {
        lower: true,
      });
    }

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
