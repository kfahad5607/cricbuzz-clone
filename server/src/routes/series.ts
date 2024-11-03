import express, { Router } from "express";
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
  getSeriesMatches,
  getSeriesInfo,
} from "../controllers/series";
import { validateRequest } from "../middlewares";
import { Series, SeriesOptional, getValidationSchema } from "../types";

const router: Router = express.Router();

router.get("/", getAll);

router.get(
  "/:id",
  validateRequest({
    params: getValidationSchema({
      id: "DatabaseIntIdParam",
    }),
  }),
  getOne
);

router.get(
  "/:id/info",
  validateRequest({
    params: getValidationSchema({
      id: "DatabaseIntIdParam",
    }),
  }),
  getSeriesInfo
);

router.post(
  "/",
  validateRequest({
    body: Series,
  }),
  createOne
);

router.patch(
  "/:id",
  validateRequest({
    params: getValidationSchema({
      id: "DatabaseIntIdParam",
    }),
    body: SeriesOptional,
  }),
  updateOne
);

router.delete(
  "/:id",
  validateRequest({
    params: getValidationSchema({
      id: "DatabaseIntIdParam",
    }),
  }),
  deleteOne
);

router.get(
  "/:id/matches",
  validateRequest({
    params: getValidationSchema({
      id: "DatabaseIntIdParam",
    }),
  }),
  getSeriesMatches
);

export default router;
