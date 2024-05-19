import express from "express";
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from "../controllers/teams";
import { validateRequest } from "../middlewares";
import { NewTeam, ParamsWithNumId, TeamOptional } from "../types";

const router = express.Router();

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
    body: NewTeam,
  }),
  createOne
);

router.patch(
  "/:id",
  validateRequest({
    params: ParamsWithNumId,
    body: TeamOptional,
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
