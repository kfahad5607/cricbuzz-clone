import { db } from "../../postgres";
import * as tables from "../../postgres/schema";
import slugify from "slugify";
import { sql } from "drizzle-orm";
import { readFileData, writeFileData } from "./helpers/file";

const BASE_PATH = "src/db/postgres/seeds/data/players/";

const seedPlayers = async () => {
  try {
    console.log("Seeding players started...");
    const contents = await readFileData(BASE_PATH + "index.json");

    if (!contents) {
      console.log("No players data found to seed...");
      return;
    }

    const data = JSON.parse(contents);

    const teamsSet: Set<string> = new Set();
    const players: any[] = [];
    const playerIds: number[] = [];

    for (const key in data) {
      const item = data[key];
      playerIds.push(item.id);

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

    const teamNameIdMap = teamData.reduce((acc, curr) => {
      acc[curr.name] = curr.id;

      return acc;
    }, {} as Record<string, number>);

    players.forEach((player) => {
      player.team = teamNameIdMap[player.team];
      return player;
    });

    const insertedPlayers = await db
      .insert(tables.players)
      .values(players)
      .returning({ insertedId: tables.players.id });

    const playerIdsMap: Record<number, number> = {};
    playerIds.forEach((id, index) => {
      playerIdsMap[id] = insertedPlayers[index].insertedId;
    });

    await writeFileData(
      BASE_PATH + "idsMap.json",
      JSON.stringify(playerIdsMap, null, 2)
    );

    console.log("Seeding players finished... ");
  } catch (err) {
    console.error("ERROR in seeding players ==> ", err);
  }
};

export default seedPlayers;
