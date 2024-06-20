import * as fs from "node:fs/promises";
import { db, client } from "../../postgres";
import * as tables from "../../postgres/schema";
import slugify from "slugify";

const seedSeries = async () => {
  try {
    console.log("Seeding series started...");
    const contents = await fs.readFile(
      "src/db/postgres/seeds/data/series/index.json",
      { encoding: "utf8" }
    );

    const data = JSON.parse(contents);

    const series: any[] = [];
    for (const key in data) {
      const item = data[key];
      delete item.id;

      item.slug = slugify(item.title, {
        lower: true,
      });
      series.push(item);
    }

    await db.insert(tables.series).values(series);

    client.end();

    console.log("Seeding series finished...");
  } catch (err) {
    console.error("ERROR in seeding series ==> ", err);
  }
};

export default seedSeries;
