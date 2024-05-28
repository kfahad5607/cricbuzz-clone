import express from "express";
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  getCurrentMatches,
  updateOne,
  getMatchSquads,
  addMatchPlayer,
  removeMatchPlayer,
  updateMatchPlayer,
} from "../controllers/matches";
import { validateRequest } from "../middlewares";
import {
  MatchOptional,
  MatchSquadPlayer,
  MatchSquadPlayerOptional,
  NewMatch,
  getValidationSchema,
} from "../types";

const router = express.Router();

// public endpoints
router.get("/current", getCurrentMatches);

router.get(
  "/:id/squads",
  validateRequest({
    params: getValidationSchema({
      id: "DatabaseIntId",
    }),
  }),
  getMatchSquads
);

router.post(
  "/:id/squads/:teamId",
  validateRequest({
    params: getValidationSchema({
      id: "DatabaseIntId",
      teamId: "DatabaseIntId",
    }),
    body: MatchSquadPlayer,
  }),
  addMatchPlayer
);

router.delete(
  "/:id/squads/:teamId/players/:playerId",
  validateRequest({
    params: getValidationSchema({
      id: "DatabaseIntId",
      teamId: "DatabaseIntId",
      playerId: "DatabaseIntId",
    }),
  }),
  removeMatchPlayer
);

router.patch(
  "/:id/squads/:teamId",
  validateRequest({
    params: getValidationSchema({
      id: "DatabaseIntId",
      teamId: "DatabaseIntId",
    }),
    body: MatchSquadPlayerOptional,
  }),
  updateMatchPlayer
);

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
