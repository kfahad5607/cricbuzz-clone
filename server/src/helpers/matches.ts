import { eq, inArray } from "drizzle-orm";
import slugify from "slugify";
import { db } from "../db/postgres";
import * as tables from "../db/postgres/schema";
import { DatabaseIntId, SlugInputData } from "../types";

// tables
const seriesTable = tables.series;
const matchesTable = tables.matches;
const teamsTable = tables.teams;

// DB based
export async function generateSlug(data: SlugInputData): Promise<string> {
  const teamsInfo = await db
    .select({ shortName: teamsTable.shortName })
    .from(teamsTable)
    .where(inArray(teamsTable.id, [data.homeTeam, data.awayTeam]));

  if (teamsInfo.length < 2)
    throw Error(`'homeTeam' or 'awayTeam' does not exist`);

  const seriesInfo = await db
    .select({ slug: seriesTable.slug })
    .from(seriesTable)
    .where(eq(seriesTable.id, data.series));

  if (seriesInfo.length === 0) throw Error(`'series' does not exist`);

  let slugInput = `${teamsInfo[0].shortName}-vs-${teamsInfo[1].shortName}`;
  slugInput = `${slugInput}-${data.description}-${seriesInfo[0].slug}`;

  return slugify(slugInput, {
    lower: true,
  });
}

export async function verifyMatchAndTeam(
  matchId: DatabaseIntId,
  teamId: DatabaseIntId
) {
  const match = await db.query.matches.findFirst({
    where: eq(matchesTable.id, matchId),
    columns: {
      homeTeam: true,
      awayTeam: true,
    },
  });

  if (!match) throw new Error(`Match with Id '${matchId}' does not exist.`);
  if (![match.homeTeam, match.awayTeam].includes(teamId))
    throw new Error(
      `Team with Id '${teamId}' is not playing the current match.`
    );

  return match;
}
