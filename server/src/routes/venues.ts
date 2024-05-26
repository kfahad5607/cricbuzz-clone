import express from "express";
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from "../controllers/venues";
import { validateRequest } from "../middlewares";
import { NewVenue, VenueOptional, getValidationSchema } from "../types";

const router = express.Router();

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
    body: NewVenue,
  }),
  createOne
);

router.patch(
  "/:id",
  validateRequest({
    params: getValidationSchema({
      id: "DatabaseIntId",
    }),
    body: VenueOptional,
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
