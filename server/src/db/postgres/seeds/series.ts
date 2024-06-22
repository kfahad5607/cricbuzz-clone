import { db } from "../../postgres";
import * as tables from "../../postgres/schema";
import slugify from "slugify";
import { readFileData, writeFileData } from "./helpers/file";

const BASE_PATH = "src/db/postgres/seeds/data/series/";

const seedSeries = async () => {
  try {
    console.log("Seeding series started...");
    const contents = await readFileData(BASE_PATH + "index.json");

    if (!contents) {
      console.log("No series data found to seed...");
      return;
    }

    const data = JSON.parse(contents);

    const series: any[] = [];
    const seriesIds: number[] = [];
    for (const key in data) {
      const item = data[key];
      seriesIds.push(item.id);

      delete item.id;
      item.slug = slugify(item.title, {
        lower: true,
      });
      series.push(item);
    }

    const insertedSeries = await db
      .insert(tables.series)
      .values(series)
      .returning({ insertedId: tables.series.id });

    const seriesIdsMap: Record<number, number> = {};
    seriesIds.forEach((id, index) => {
      seriesIdsMap[id] = insertedSeries[index].insertedId;
    });

    await writeFileData(
      BASE_PATH + "idsMap.json",
      JSON.stringify(seriesIdsMap, null, 2)
    );

    console.log("Seeding series finished...");
  } catch (err) {
    console.error("ERROR in seeding series ==> ", err);
  }
};

export default seedSeries;
