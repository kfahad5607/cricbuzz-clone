import express from "express";
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from "../controllers/venues";
import { validateRequest } from "../middlewares";
import { Venue, VenueOptional, getValidationSchema } from "../types";

const router = express.Router();

router.get(
  "/",
  validateRequest({
    query: getValidationSchema(
      {},
      {
        query: "ZString",
        page: "DatabaseIntIdParam",
      }
    ),
  }),
  getAll
);

router.get(
  "/:id",
  validateRequest({
    params: getValidationSchema({
      id: "DatabaseIntIdParam",
    }),
  }),
  getOne
);

router.post(
  "/",
  validateRequest({
    body: Venue,
  }),
  createOne
);

router.patch(
  "/:id",
  validateRequest({
    params: getValidationSchema({
      id: "DatabaseIntIdParam",
    }),
    body: VenueOptional,
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

export default router;
