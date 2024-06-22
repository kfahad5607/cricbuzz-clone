import { eq } from "drizzle-orm";
import { db } from "../db/postgres";
import * as tables from "../db/postgres/schema";
import { DatabaseIntId } from "../types";

// tables
const matchesTable = tables.matches;

// DB based
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
