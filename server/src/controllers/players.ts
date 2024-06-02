import { eq } from "drizzle-orm";
import { NextFunction, Request, Response } from "express";
import slugify from "slugify";
import { db } from "../db/postgres";
import * as tables from "../db/postgres/schema";
import {
  NewPlayer,
  Player,
  PlayerOptional,
  PlayerWithId,
  getValidationType,
} from "../types";

export async function getAll(
  req: Request,
  res: Response<PlayerWithId[]>,
  next: NextFunction
) {
  try {
    const results = await db.select().from(tables.players);

    res.status(200).json(results);
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
  req: Request<{}, PlayerWithId, NewPlayer>,
  res: Response,
  next: NextFunction
) {
  try {
    const slug = slugify(req.body.name, {
      lower: true,
    });
    const newPlayer: Player = { ...req.body, slug };

    console.log("createOne player ", newPlayer);

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
    PlayerOptional
  >,
  res: Response,
  next: NextFunction
) {
  try {
    const id = parseInt(req.params.id);
    const player = req.body;

    if (player.name && !player.slug) {
      player.slug = slugify(player.name, {
        lower: true,
      });
    }

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
