import express, { Router } from "express";
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from "../controllers/series";
import { validateRequest } from "../middlewares";
import { NewSeries, SeriesOptional, getValidationSchema } from "../types";

const router: Router = express.Router();

router.get("/", getAll);

router.get(
  "/:id",
  validateRequest({
    params: getValidationSchema({
      id: "DatabaseIntId",
    }),
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
    params: getValidationSchema({
      id: "DatabaseIntId",
    }),
    body: SeriesOptional,
  }),
  updateOne
);

router.delete(
  "/:id",
  validateRequest({
    params: getValidationSchema({
      id: "DatabaseIntId",
    }),
  }),
  deleteOne
);

export default router;
