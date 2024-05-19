import express, { Express, Request, Response } from "express";
import mongoose from "mongoose";
import config from "./config";
import { notFound, errorHandler } from "./middlewares";
import VenuesRouter from "./routes/venues";
import SeriesRouter from "./routes/series";
import MatchesRouter from "./routes/matches";

const app: Express = express();
const port = config.PORT;

app.use(express.json());

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

app.use("/venues", VenuesRouter);
app.use("/series", SeriesRouter);
app.use("/matches", MatchesRouter);

app.use(notFound);
app.use(errorHandler);

async function main() {
  try {
    console.log("Connecting to MongoDB");
    await mongoose.connect(config.MONGO_DB_URL);
    console.log("Connected to MongoDB successfully! ");

    app.listen(port, () => {
      console.log(`[server]: Server is running at http://localhost:${port}`);
    });
  } catch (err) {
    console.log("ERROR while connecting ", err);
  }
}

main();
