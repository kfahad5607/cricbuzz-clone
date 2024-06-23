import { db } from "../../postgres";
import * as tables from "../../postgres/schema";
import { readFileData, writeFileData } from "./helpers/file";
import { BASE_DATA_PATH } from "./helpers/constants";
import { Optional, VenueWithId } from "../../../types";

// types
type VenueWithOptionalId = Optional<VenueWithId, "id">;
type VenuesData = Record<number, VenueWithOptionalId>;
type IdsMap = Record<number, number>;

const BASE_PATH = BASE_DATA_PATH + "venues/";

const seedVenues = async () => {
  try {
    console.log("Seeding venues started...");
    const contents = await readFileData(BASE_PATH + "index.json");

    if (!contents) {
      console.log("No venues data found to seed...");
      return;
    }

    const data: VenuesData = JSON.parse(contents);

    const venues: VenueWithOptionalId[] = [];
    const venueIds: number[] = [];
    for (const key in data) {
      const item = data[key];

      if (item.id) venueIds.push(item.id);

      delete item.id;
      venues.push(item);
    }

    const insertedVenues = await db
      .insert(tables.venues)
      .values(venues)
      .returning({ insertedId: tables.venues.id });

    const venueIdsMap: IdsMap = {};
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
