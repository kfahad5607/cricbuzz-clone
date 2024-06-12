import express from "express";
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  getCurrentMatches,
  updateOne,
  addMatchPlayer,
  removeMatchPlayer,
  updateMatchPlayer,
  getMatchInfo,
  addInningsScore,
  getInningsScore,
  getAllInningsScore,
  deleteInningsScore,
  getMatchPlayers,
} from "../controllers/matches";
import { validateRequest } from "../middlewares";
import {
  MatchOptional,
  MatchSquadPlayer,
  MatchSquadPlayerOptional,
  NewMatch,
  getValidationSchema,
} from "../types";
import { ScorecardInningsEntry } from "../types/scorecard";

const router = express.Router();

// public endpoints
router.get("/current", getCurrentMatches);

router.get(
  "/:id/info",
  validateRequest({
    params: getValidationSchema({
      id: "DatabaseIntIdParam",
    }),
  }),
  getMatchInfo
);

router.get(
  "/:id/players",
  validateRequest({
    params: getValidationSchema({
      id: "DatabaseIntIdParam",
    }),
  }),
  getMatchPlayers
);

router.post(
  "/:id/squads/:teamId",
  validateRequest({
    params: getValidationSchema({
      id: "DatabaseIntIdParam",
      teamId: "DatabaseIntIdParam",
    }),
    body: MatchSquadPlayer,
  }),
  addMatchPlayer
);

router.delete(
  "/:id/squads/:teamId/players/:playerId",
  validateRequest({
    params: getValidationSchema({
      id: "DatabaseIntIdParam",
      teamId: "DatabaseIntIdParam",
      playerId: "DatabaseIntIdParam",
    }),
  }),
  removeMatchPlayer
);

router.patch(
  "/:id/squads/:teamId",
  validateRequest({
    params: getValidationSchema({
      id: "DatabaseIntIdParam",
      teamId: "DatabaseIntIdParam",
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
      id: "DatabaseIntIdParam",
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
      id: "DatabaseIntIdParam",
    }),
    body: MatchOptional,
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
  "/:id/innings/score",
  validateRequest({
    params: getValidationSchema({
      id: "DatabaseIntIdParam",
    }),
  }),
  getAllInningsScore
);

router.get(
  "/:id/innings/:inningsType/score",
  validateRequest({
    params: getValidationSchema({
      id: "DatabaseIntIdParam",
      inningsType: "InningsType",
    }),
  }),
  getInningsScore
);

router.post(
  "/:id/innings/:inningsType/score",
  validateRequest({
    params: getValidationSchema({
      id: "DatabaseIntIdParam",
      inningsType: "InningsType",
    }),
    body: ScorecardInningsEntry,
  }),
  addInningsScore
);

router.delete(
  "/:id/innings/:inningsType/score",
  validateRequest({
    params: getValidationSchema({
      id: "DatabaseIntIdParam",
      inningsType: "InningsType",
    }),
  }),
  deleteInningsScore
);

export default router;
