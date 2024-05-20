import express from "express";
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from "../controllers/players";
import { validateRequest } from "../middlewares";
import { NewPlayer, ParamsWithNumId, PlayerOptional } from "../types";

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
    body: NewPlayer,
  }),
  createOne
);

router.patch(
  "/:id",
  validateRequest({
    params: ParamsWithNumId,
    body: PlayerOptional,
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
