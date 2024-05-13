import express from "express";
import { db } from "../db/postgres";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await db.query.matches.findMany();
    return res.send("Matches");
  } catch (error) {
    return res.json({
      status: "fail",
      error,
    });
  }
});

export default router;
