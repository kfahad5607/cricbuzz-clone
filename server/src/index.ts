import express, { Express, Request, Response } from "express";
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

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
