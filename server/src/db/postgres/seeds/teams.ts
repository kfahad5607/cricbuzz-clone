import * as fs from "node:fs/promises";
import { db } from "../../postgres";
import * as tables from "../../postgres/schema";
import slugify from "slugify";

const seedTeams = async () => {
  try {
    console.log("Seeding teams started...");
    const contents = await fs.readFile(
      "src/db/postgres/seeds/data/teams/index.json",
      { encoding: "utf8" }
    );

    const data = JSON.parse(contents);

    const teams: any[] = [];
    for (const key in data) {
      const item = data[key];
      delete item.id;

      item.slug = slugify(item.name, {
        lower: true,
      });
      teams.push(item);
    }

    await db.insert(tables.teams).values(teams);

    console.log("Seeding teams finished...");
  } catch (err) {
    console.error("ERROR in seeding teams ==> ", err);
  }
};

export default seedTeams;
