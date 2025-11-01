import { NextFunction, Request, Response } from "express";
import { getValidationType } from "../types";
import { db } from "../db/postgres";
import * as tables from "../db/postgres/schema";
import { asc, eq, ilike, not, or, SQL } from "drizzle-orm";
import { setTimeout } from "node:timers/promises";
import { PgSelectBase, union } from "drizzle-orm/pg-core";

export async function getOptions(
  req: Request<
    getValidationType<{ resourceType: "ApiResourceType" }>,
    {},
    {},
    getValidationType<{}, { query: "ZString"; recordId: "DatabaseIntIdParam" }>
  >,
  res: Response,
  next: NextFunction
) {
  try {
    await setTimeout(2000);
    const resourceType = req.params.resourceType;
    let query = (req.query.query || "").trim();
    const recordId = req.query.recordId
      ? parseInt(req.query.recordId)
      : undefined;
    const limit = 5;

    let whereClause: SQL<unknown> | undefined = undefined;
    let results: {
      label: string;
      value: number;
    }[] = [];
    if (resourceType === "teams") {
      const baseQuery = db
        .select({
          label: tables.teams.name,
          value: tables.teams.id,
        })
        .from(tables.teams)
        .orderBy(asc(tables.teams.name))
        .limit(limit);

      if (query) {
        query = `%${query}%`;

        whereClause = ilike(tables.teams.name, query);
        results = await baseQuery.where(whereClause);
      } else if (recordId) {
        const unionQuery = union(
          db
            .select({
              label: tables.teams.name,
              value: tables.teams.id,
            })
            .from(tables.teams)
            .where(eq(tables.teams.id, recordId)),
          baseQuery.where(not(eq(tables.teams.id, recordId)))
        );

        results = await unionQuery;
      } else {
        results = await baseQuery;
      }
    }

    res.status(200).json(results);
  } catch (err) {
    next(err);
  }
}
