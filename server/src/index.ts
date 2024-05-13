import express, { Express, Request, Response } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import MatchesRouter from "./routes/matches";

const app: Express = express();
const port = process.env.PORT || 8000;

app.get("/", async (req: Request, res: Response) => {
  try {
    return res.json({
      data: [],
    });
  } catch (error) {
    return res.json({
      error,
    });
  }
});

app.use("/matches", MatchesRouter);

async function main() {
  try {
    console.log("Connecting to MongoDB");
    await mongoose.connect(process.env.MONGO_DB_URL as string);
    console.log("Connected to MongoDB successfully! ");

    app.listen(port, () => {
      console.log(`[server]: Server is running at http://localhost:${port}`);
    });
  } catch (err) {
    console.log("ERROR while connecting ", err);
  }
}

main();
