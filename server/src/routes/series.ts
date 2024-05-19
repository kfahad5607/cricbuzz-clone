import express, { Router } from "express";
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from "../controllers/series";
import { validateRequest } from "../middlewares";
import { NewSeries, ParamsWithNumId, Series, SeriesOptional } from "../types";

const router: Router = express.Router();

router.get("/", getAll);

router.get(
  "/:id",
  validateRequest({
    params: ParamsWithNumId,
  }),
  getOne
);

router.post(
  "/",
  validateRequest({
    body: NewSeries,
  }),
  createOne
);

router.patch(
  "/:id",
  validateRequest({
    params: ParamsWithNumId,
    body: SeriesOptional,
  }),
  updateOne
);

router.delete(
  "/:id",
  validateRequest({
    params: ParamsWithNumId,
  }),
  deleteOne
);

export default router;
