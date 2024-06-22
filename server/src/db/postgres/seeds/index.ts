import mongoose from "mongoose";
import config from "../../../config";
import { client } from "../../postgres";
import seedPlayers from "./players";
import seedSeries from "./series";
import seedTeams from "./teams";
import seedVenues from "./venues";

const connectToDatabases = async () => {
  await mongoose.connect(config.MONGO_DB_URL);
};

const disconnectDatabases = async () => {
  client.end();
  await mongoose.disconnect();
};

const main = async () => {
  try {
    await connectToDatabases();
    await seedVenues();
    await seedTeams();
    await seedPlayers();
    await seedSeries();

    await disconnectDatabases();
  } catch (err) {
    console.error("ERROR in main ==> ", err);
  }
};

main();
