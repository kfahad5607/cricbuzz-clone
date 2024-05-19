import { eq } from "drizzle-orm";
import { NextFunction, Request, Response } from "express";
import slugify from "slugify";
import { db } from "../db/postgres";
import * as tables from "../db/postgres/schema";
import {
  NewTeam,
  ParamsWithNumId,
  Team,
  TeamOptional,
  TeamWithId,
} from "../types";

export async function getAll(
  req: Request,
  res: Response<TeamWithId[]>,
  next: NextFunction
) {
  try {
    const results = await db.select().from(tables.teams);

    res.status(200).json(results);
  } catch (err) {
    next(err);
  }
}

export async function getOne(
  req: Request<ParamsWithNumId, TeamWithId>,
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
  req: Request<{}, TeamWithId, NewTeam>,
  res: Response,
  next: NextFunction
) {
  try {
    const slug = slugify(req.body.name, {
      lower: true,
    });
    const newTeam: Team = { ...req.body, slug };

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
  req: Request<ParamsWithNumId, TeamWithId, TeamOptional>,
  res: Response,
  next: NextFunction
) {
  try {
    const id = parseInt(req.params.id);
    const team = req.body;

    if (team.name && !team.slug) {
      team.slug = slugify(team.name, {
        lower: true,
      });
    }

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
  req: Request<ParamsWithNumId>,
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
