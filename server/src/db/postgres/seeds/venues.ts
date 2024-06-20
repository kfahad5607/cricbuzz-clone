import * as fs from "node:fs/promises";
import { db, client } from "../../postgres";
import * as tables from "../../postgres/schema";
import slugify from "slugify";

const seedVenues = async () => {
  try {
    console.log("Seeding venues started...");
    const contents = await fs.readFile(
      "src/db/postgres/seeds/data/venues/index.json",
      { encoding: "utf8" }
    );

    const data = JSON.parse(contents);

    const venues: any[] = [];
    for (const key in data) {
      const item = data[key];
      delete item.id;

      item.slug = slugify(item.name, {
        lower: true,
      });
      venues.push(item);
    }

    await db.insert(tables.venues).values(venues);

    client.end();

    console.log("Seeding venues finished...");
  } catch (err) {
    console.error("ERROR in seeding venues ==> ", err);
  }
};

export default seedVenues;
