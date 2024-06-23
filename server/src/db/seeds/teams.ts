import * as z from "zod";
import { TeamWithId } from "../../types";
import { db } from "../postgres";
import * as tables from "../postgres/schema";
import { BASE_DATA_PATH } from "./helpers/constants";
import { readFileData, writeFileData } from "./helpers/file";

// validation schema
const TeamWithOptionalId = TeamWithId.partial({ id: true });
const TeamsData = z.record(z.coerce.number().positive(), TeamWithOptionalId);

// types
type TeamWithOptionalId = z.infer<typeof TeamWithOptionalId>;
type TeamsData = z.infer<typeof TeamsData>;
type IdsMap = Record<number, number>;

// consts
const BASE_PATH = BASE_DATA_PATH + "teams/";

const seedTeams = async () => {
  try {
    console.log("Seeding teams started...");
    const contents = await readFileData(BASE_PATH + "index.json");

    if (!contents) {
      console.log("No teams data found to seed...");
      return;
    }

    const data: TeamsData = JSON.parse(contents);
    // validate
    TeamsData.parse(data);

    const teams: TeamWithOptionalId[] = [];
    const teamIds: number[] = [];
    for (const key in data) {
      const item = data[key];
      if (item.id) teamIds.push(item.id);

      delete item.id;
      teams.push(item);
    }

    const insertedTeams = await db
      .insert(tables.teams)
      .values(teams)
      .returning({ insertedId: tables.teams.id });

    const teamIdsMap: IdsMap = {};
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
    if (err instanceof Error) throw new Error(err.message);
  }
};

export default seedTeams;
