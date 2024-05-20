import { eq, inArray } from "drizzle-orm";
import { NextFunction, Request, Response } from "express";
import slugify from "slugify";
import { db } from "../db/postgres";
import * as tables from "../db/postgres/schema";
import {
  Match,
  MatchOptional,
  MatchWithId,
  NewMatch,
  ParamsWithNumId,
} from "../types";
import { PgColumn } from "drizzle-orm/pg-core";
import { isObjEmpty } from "../helpers";

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
  req: Request<ParamsWithNumId, MatchWithId>,
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

    console.log("createOne match ", newMatch);

    const results = await db
      .insert(tables.matches)
      .values(newMatch)
      .returning({ id: tables.matches.id });

    const savedMatch = { ...newMatch, id: results[0].id };

    res.status(201).json(savedMatch);
  } catch (err) {
    next(err);
  }
}

export async function updateOne(
  req: Request<ParamsWithNumId, MatchWithId, MatchOptional>,
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

        console.log("slugInput ==> ", slugInput, results);
      }

      match.slug = await generateSlug(slugInput as SlugInputData);
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
  req: Request<ParamsWithNumId>,
  res: Response,
  next: NextFunction
) {
  try {
    const id = parseInt(req.params.id);

    await db.delete(tables.matches).where(eq(tables.matches.id, id));

    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
