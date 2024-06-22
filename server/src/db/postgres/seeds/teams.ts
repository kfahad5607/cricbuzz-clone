import { db } from "../../postgres";
import * as tables from "../../postgres/schema";
import slugify from "slugify";
import { readFileData, writeFileData } from "./helpers/file";

const BASE_PATH = "src/db/postgres/seeds/data/teams/";

const seedTeams = async () => {
  try {
    console.log("Seeding teams started...");
    const contents = await readFileData(BASE_PATH + "index.json");

    if (!contents) {
      console.log("No teams data found to seed...");
      return;
    }

    const data = JSON.parse(contents);

    const teams: any[] = [];
    const teamIds: number[] = [];
    for (const key in data) {
      const item = data[key];
      teamIds.push(item.id);

      delete item.id;
      item.slug = slugify(item.name, {
        lower: true,
      });
      teams.push(item);
    }

    const insertedTeams = await db
      .insert(tables.teams)
      .values(teams)
      .returning({ insertedId: tables.teams.id });

    const teamIdsMap: Record<number, number> = {};
    teamIds.forEach((id, index) => {
      teamIdsMap[id] = insertedTeams[index].insertedId;
    });

    await writeFileData(
      BASE_PATH + "idsMap.json",
      JSON.stringify(teamIdsMap, null, 2)
    );

    console.log("Seeding teams finished...");
  } catch (err) {
    console.error("ERROR in seeding teams ==> ", err);
  }
};

export default seedTeams;
