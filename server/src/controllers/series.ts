import { eq, inArray, sql } from "drizzle-orm";
import { NextFunction, Request, Response } from "express";
import MatchData from "../db/mongo/schema/matchData";
import { db } from "../db/postgres";
import * as tables from "../db/postgres/schema";
import {
  BaseScorecardInnings,
  DatabaseIntId,
  MatchData as MatchDataType,
  SCORECARD_INNINGS_TYPES,
  Series,
  SeriesMatchCard,
  SeriesOptional,
  SeriesWithId,
  TeamWithId,
  VenueWithId,
  getValidationType,
} from "../types";
import { getInningsKeys } from "./matches";
import { set } from "mongoose";

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

export async function getSeriesInfo(
  req: Request<getValidationType<{ id: "DatabaseIntIdParam" }>>,
  res: Response,
  next: NextFunction
) {
  try {
    const seriesId = parseInt(req.params.id);

    const seriesData = await db
      .select({
        title: tables.series.title,
        totalMatches: sql<number>`CAST(COUNT(${tables.matches.id}) as int)`,
        matchFormat: tables.matches.matchFormat,
        startTime: sql<string>`MIN(${tables.matches.startTime})`,
        endTime: sql<string>`MAX(${tables.matches.startTime})`,
      })
      .from(tables.series)
      .innerJoin(tables.matches, eq(tables.matches.series, tables.series.id))
      .where(eq(tables.series.id, seriesId))
      .groupBy(tables.series.title, tables.matches.matchFormat)
      .orderBy(sql<string>`MIN(${tables.matches.startTime})`);

    if (seriesData.length === 0) {
      res.status(404);
      throw new Error(`Series with ID '${seriesId}' does not exist.`);
    }

    let startTime: Date | null = null;
    let endTime: Date | null = null;

    const matches = seriesData.map((item) => {
      const _startTime = new Date(item.startTime);
      const _endTime = new Date(item.endTime);

      if (!startTime) {
        startTime = _startTime;
      }
      if (!endTime) {
        endTime = _endTime;
      }

      if (_startTime < startTime) {
        startTime = _startTime;
      }
      if (_endTime > endTime) {
        endTime = _endTime;
      }

      return {
        format: item.matchFormat,
        count: item.totalMatches,
      };
    });

    const data = {
      id: seriesId,
      title: seriesData[0].title,
      startTime,
      endTime,
      matches,
    };

    res.status(200).json(data);
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
        homeTeam: true,
        awayTeam: true,
        venue: true,
      },
      // with: {
      //   homeTeam: {
      //     columns: {
      //       id: true,
      //       name: true,
      //       shortName: true,
      //     },
      //   },
      //   awayTeam: {
      //     columns: {
      //       id: true,
      //       name: true,
      //       shortName: true,
      //     },
      //   },
      // },
    });

    const matchIds: number[] = [];
    const teamIds = new Set<number>();
    const venueIds = new Set<number>();
    matches.forEach((match) => {
      matchIds.push(match.id);
      teamIds.add(match.homeTeam);
      teamIds.add(match.awayTeam);
      venueIds.add(match.venue);
    });

    const teamsData = await db
      .select({
        id: tables.teams.id,
        name: tables.teams.name,
        shortName: tables.teams.shortName,
      })
      .from(tables.teams)
      .where(inArray(tables.teams.id, Array.from(teamIds)));

    const venuesData = await db
      .select({
        id: tables.venues.id,
        name: tables.venues.name,
        city: tables.venues.city,
      })
      .from(tables.venues)
      .where(inArray(tables.venues.id, Array.from(venueIds)));

    let teamsMap: { [key: DatabaseIntId]: TeamWithId } = {};
    teamsMap = teamsData.reduce((acc, val) => {
      acc[val.id] = val;
      return acc;
    }, teamsMap);

    let venuesMap: { [key: DatabaseIntId]: Omit<VenueWithId, "country"> } = {};
    venuesMap = venuesData.reduce((acc, val) => {
      acc[val.id] = val;
      return acc;
    }, venuesMap);

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
        homeTeam: teamsMap[match.homeTeam],
        awayTeam: teamsMap[match.awayTeam],
        venue: venuesMap[match.venue],
      };
    });

    res.status(200).json(matchwithDataResults);
  } catch (err) {
    next(err);
  }
}
