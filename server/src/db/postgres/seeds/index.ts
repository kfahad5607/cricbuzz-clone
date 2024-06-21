import { client } from "../../postgres";
import seedVenues from "./venues";
import seedSeries from "./series";
import seedTeams from "./teams";
import seedPlayers from "./players";

const main = async () => {
  // await seedVenues();
  // await seedSeries();
  // await seedTeams();
  await seedPlayers();

  client.end();
};

main();
