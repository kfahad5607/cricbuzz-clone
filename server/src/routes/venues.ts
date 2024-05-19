import express from "express";
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from "../controllers/venues";
import { validateRequest } from "../middlewares";
import { NewVenue, ParamsWithNumId, VenueOptional } from "../types";

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
    body: NewVenue,
  }),
  createOne
);

router.patch(
  "/:id",
  validateRequest({
    params: ParamsWithNumId,
    body: VenueOptional,
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
