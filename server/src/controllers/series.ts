import { eq } from "drizzle-orm";
import { NextFunction, Request, Response } from "express";
import MatchData from "../db/mongo/schema/matchData";
import { db } from "../db/postgres";
import * as tables from "../db/postgres/schema";
import {
  BaseScorecardInnings,
  MatchData as MatchDataType,
  SCORECARD_INNINGS_TYPES,
  Series,
  SeriesMatchCard,
  SeriesOptional,
  SeriesWithId,
  getValidationType,
} from "../types";
import { getInningsKeys } from "./matches";

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

export async function getSeriesMatches(
  req: Request<getValidationType<{ id: "DatabaseIntIdParam" }>>,
  res: Response<SeriesMatchCard[]>,
  next: NextFunction
) {
  try {
    const seriesId = parseInt(req.params.id);

    const matches = await db.query.matches.findMany({
      where: eq(tables.matches.series, seriesId),
      columns: {
        id: true,
        description: true,
        matchFormat: true,
        startTime: true,
        completeTime: true,
      },
      with: {
        homeTeam: {
          columns: {
            id: true,
            name: true,
            shortName: true,
          },
        },
        awayTeam: {
          columns: {
            id: true,
            name: true,
            shortName: true,
          },
        },
      },
    });

    const matchIds = matches.map((match) => match.id);

    const matchDataResults = await MatchData.aggregate<{
      id: MatchDataType["matchId"];
      state: MatchDataType["state"];
      status: MatchDataType["status"];
      tossResults: MatchDataType["tossResults"];
      results: MatchDataType["results"];
      innings: (
        | Omit<
            BaseScorecardInnings,
            "overs" | "extras" | "isDeclared" | "isFollowOn"
          >
        | {}
      )[];
    }>([
      {
        $match: {
          matchId: {
            $in: matchIds,
          },
        },
      },
      {
        $project: {
          id: "$matchId",
          status: 1,
          state: 1,
          tossResults: 1,
          results: 1,
          innings: SCORECARD_INNINGS_TYPES.map((inningsType) =>
            getInningsKeys(inningsType)
          ),
        },
      },
    ]);

    const matchDataMap: Record<
      number,
      {
        id: number;
        status: string;
        innings: Omit<
          BaseScorecardInnings,
          "overs" | "extras" | "isDeclared" | "isFollowOn"
        >[];
      }
    > = {};
    matchDataResults.forEach((matchData) => {
      matchDataMap[matchData.id] = {
        ...matchData,
        innings: matchData.innings.filter(
          // Why do we need this filter?
          (inningsItem) => "oversBowled" in inningsItem
        ),
      };
    });

    const matchwithDataResults = matches.map((match) => {
      return {
        ...match,
        ...matchDataMap[match.id],
      };
    });

    res.status(200).json(matchwithDataResults);
  } catch (err) {
    next(err);
  }
}
