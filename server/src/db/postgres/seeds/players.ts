import * as fs from "node:fs/promises";
import { db } from "../../postgres";
import * as tables from "../../postgres/schema";
import slugify from "slugify";
import { sql } from "drizzle-orm";

const seedPlayers = async () => {
  try {
    console.log("Seeding players started...");
    const contents = await fs.readFile(
      "src/db/postgres/seeds/data/players/index.json",
      { encoding: "utf8" }
    );

    const data = JSON.parse(contents);

    const teamsSet: Set<string> = new Set();
    const players: any[] = [];
    for (const key in data) {
      const item = data[key];
      delete item.id;

      item.slug = slugify(item.name, {
        lower: true,
      });
      players.push(item);

      teamsSet.add(item.team);
    }

    const teamNames: string[] = Array.from(teamsSet);
    const teamData = await db
      .select({
        id: tables.teams.id,
        name: sql<string>`lower(${tables.teams.name})`,
      })
      .from(tables.teams)
      .where(sql`lower(${tables.teams.name}) in ${teamNames}`);

    const teamIdMap = teamData.reduce((acc, curr) => {
      acc[curr.name] = curr.id;

      return acc;
    }, {} as Record<string, number>);

    players.forEach((player) => {
      player.team = teamIdMap[player.team];
      return player;
    });

    await db.insert(tables.players).values(players);

    console.log("Seeding players finished... ");
  } catch (err) {
    console.error("ERROR in seeding players ==> ", err);
  }
};

export default seedPlayers;
