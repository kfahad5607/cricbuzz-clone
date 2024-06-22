import * as fs from "node:fs/promises";

export const readFileData = async (
  filePath: string
): Promise<string | null> => {
  try {
    const contents = await fs.readFile(filePath, { encoding: "utf8" });

    return contents;
  } catch (err) {
    console.error("ERROR in readFileData ", err);

    return null;
  }
};

export const writeFileData = async (filePath: string, data: string) => {
  try {
    await fs.writeFile(filePath, data);
  } catch (err) {
    console.error("ERROR in writeFileData ", err);
  }
};
