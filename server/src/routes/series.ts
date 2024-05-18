import express, { Router } from "express";
import { createOne } from "../controllers/series";
import { validateRequest } from "../middlewares";
import { NewSeries } from "../types";

const router: Router = express.Router();

router.post(
  "/",
  validateRequest({
    body: NewSeries,
  }),
  createOne
);

export default router;
