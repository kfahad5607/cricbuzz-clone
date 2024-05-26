import express from "express";
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from "../controllers/teams";
import { validateRequest } from "../middlewares";
import { NewTeam, TeamOptional, getValidationSchema } from "../types";

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
    body: NewTeam,
  }),
  createOne
);

router.patch(
  "/:id",
  validateRequest({
    params: getValidationSchema({
      id: "DatabaseIntId",
    }),
    body: TeamOptional,
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
