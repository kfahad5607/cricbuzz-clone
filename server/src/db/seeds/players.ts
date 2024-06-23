import { sql } from "drizzle-orm";
import * as z from "zod";
import { PlayerWithId } from "../../types";
import { db } from "../postgres";
import * as tables from "../postgres/schema";
import { BASE_DATA_PATH } from "./helpers/constants";
import { readFileData, writeFileData } from "./helpers/file";

// validation schema
const PlayerWithOptionalId = PlayerWithId.partial({ id: true });
const PlayerWithTeamNameOptionalId = PlayerWithOptionalId.extend({
  team: z.string(),
});
const PlayersData = z.record(
  z.coerce.number().positive(),
  PlayerWithTeamNameOptionalId
);

// types
type PlayersData = z.infer<typeof PlayersData>;
type PlayerWithTeamNameOptionalId = z.infer<
  typeof PlayerWithTeamNameOptionalId
>;
type PlayerWithOptionalId = z.infer<typeof PlayerWithOptionalId>;
type TeamNameIdMap = Record<string, number>;
type IdsMap = Record<number, number>;

// consts
const BASE_PATH = BASE_DATA_PATH + "players/";

const mapTeamIds = (
  players: PlayerWithTeamNameOptionalId[],
  teamNameIdMap: TeamNameIdMap
): PlayerWithOptionalId[] => {
  const playersWithTeamId = players.map((player) => {
    const teamId = teamNameIdMap[player.team];

    return {
      ...player,
      team: teamId,
    };
  });

  return playersWithTeamId;
};

const seedPlayers = async () => {
  try {
    console.log("Seeding players started...");
    const contents = await readFileData(BASE_PATH + "index.json");

    if (!contents) {
      console.log("No players data found to seed...");
      return;
    }

    const data: PlayersData = JSON.parse(contents);
    // validate
    PlayersData.parse(data);

    const teamsNameSet: Set<string> = new Set();
    const players: PlayerWithTeamNameOptionalId[] = [];
    const playerIds: number[] = [];

    for (const key in data) {
      const item = data[key];
      if (item.id) playerIds.push(item.id);

      delete item.id;
      players.push(item);

      teamsNameSet.add(item.team);
    }

    const teamNames: string[] = Array.from(teamsNameSet);
    const teamData = await db
      .select({
        id: tables.teams.id,
        name: sql<string>`lower(${tables.teams.name})`,
      })
      .from(tables.teams)
      .where(sql`lower(${tables.teams.name}) in ${teamNames}`);

    const teamNameIdMap = teamData.reduce((acc, curr) => {
      acc[curr.name] = curr.id;

      return acc;
    }, {} as TeamNameIdMap);

    const playersWithTeamId = mapTeamIds(players, teamNameIdMap);

    const insertedPlayers = await db
      .insert(tables.players)
      .values(playersWithTeamId)
      .returning({ insertedId: tables.players.id });

    const playerIdsMap: IdsMap = {};
    playerIds.forEach((id, index) => {
      playerIdsMap[id] = insertedPlayers[index].insertedId;
    });

    await writeFileData(
      BASE_PATH + "idsMap.json",
      JSON.stringify(playerIdsMap, null, 2)
    );

    console.log("Seeding players finished... ");
  } catch (err) {
    console.error("ERROR in seeding players ==> ", err);
    if (err instanceof Error) throw new Error(err.message);
  }
};

export default seedPlayers;
