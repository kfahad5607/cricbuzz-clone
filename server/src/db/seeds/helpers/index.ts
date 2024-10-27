import { Entities, IdsMap } from "./types";
import { BASE_DATA_PATH } from "./constants";
import { readFileData } from "./file";

export const getIdsMap = async (entity: Entities): Promise<IdsMap> => {
  try {
    const idsMapContents = await readFileData(
      `${BASE_DATA_PATH}${entity}/idsMap.json`
    );

    if (!idsMapContents)
      throw new Error(`No ${entity} ids map data found to seed...`);

    const idsMapData = JSON.parse(idsMapContents);
    // validate
    IdsMap.parse(idsMapData);

    return idsMapData;
  } catch (err) {
    if (err instanceof Error) throw new Error(err.message);
    throw new Error(String(err));
  }
};
