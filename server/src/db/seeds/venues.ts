import * as z from "zod";
import { VenueWithId } from "../../types";
import { db } from "../postgres";
import * as tables from "../postgres/schema";
import { BASE_DATA_PATH } from "./helpers/constants";
import { readFileData, writeFileData } from "./helpers/file";

// validation schema
const VenueWithOptionalId = VenueWithId.partial({ id: true });
const VenuesData = z.record(z.coerce.number().positive(), VenueWithOptionalId);

// types
type VenueWithOptionalId = z.infer<typeof VenueWithOptionalId>;
type VenuesData = z.infer<typeof VenuesData>;
type IdsMap = Record<number, number>;

// consts
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
    // validate
    VenuesData.parse(data);

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
    if (err instanceof Error) throw new Error(err.message);
  }
};

export default seedVenues;
