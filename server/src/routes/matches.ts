import express from "express";
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  getCurrentMatches,
  updateOne,
} from "../controllers/matches";
import { validateRequest } from "../middlewares";
import { MatchOptional, NewMatch, getValidationSchema } from "../types";

const router = express.Router();

// public endpoints
router.get("/current", getCurrentMatches);

// private endpoints
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
    body: NewMatch,
  }),
  createOne
);

router.patch(
  "/:id",
  validateRequest({
    params: getValidationSchema({
      id: "DatabaseIntId",
    }),
    body: MatchOptional,
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
