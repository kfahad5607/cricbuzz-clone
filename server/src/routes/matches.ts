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
import { MatchOptional, NewMatch, ParamsWithNumId } from "../types";

const router = express.Router();

// public endpoints
router.get("/current", getCurrentMatches);

// private endpoints
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
    body: NewMatch,
  }),
  createOne
);

router.patch(
  "/:id",
  validateRequest({
    params: ParamsWithNumId,
    body: MatchOptional,
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
