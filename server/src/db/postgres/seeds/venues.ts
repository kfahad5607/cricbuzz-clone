import { db } from "../../postgres";
import * as tables from "../../postgres/schema";
import slugify from "slugify";
import { readFileData, writeFileData } from "./helpers/file";

const BASE_PATH = "src/db/postgres/seeds/data/venues/";

const seedVenues = async () => {
  try {
    console.log("Seeding venues started...");
    const contents = await readFileData(BASE_PATH + "index.json");

    if (!contents) {
      console.log("No venues data found to seed...");
      return;
    }

    const data = JSON.parse(contents);

    const venues: any[] = [];
    const venueIds: number[] = [];
    for (const key in data) {
      const item = data[key];
      venueIds.push(item.id);

      delete item.id;
      item.slug = slugify(item.name, {
        lower: true,
      });
      venues.push(item);
    }

    const insertedVenues = await db
      .insert(tables.venues)
      .values(venues)
      .returning({ insertedId: tables.venues.id });

    const venueIdsMap: Record<number, number> = {};
    venueIds.forEach((id, index) => {
      venueIdsMap[id] = insertedVenues[index].insertedId;
    });

    await writeFileData(
      BASE_PATH + "idsMap.json",
      JSON.stringify(venueIdsMap, null, 2)
    );

    console.log("Seeding venues finished...");
  } catch (err) {
    console.error("ERROR in seeding venues ==> ", err);
  }
};

export default seedVenues;
