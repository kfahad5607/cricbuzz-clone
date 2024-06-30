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
  getMatchScore,
  addInningsCommentary,
  getFullCommentary,
  getCommentary,
  getCommentaryPagination,
} from "../controllers/matches";
import { validateRequest } from "../middlewares";
import {
  MatchOptional,
  MatchSquadPlayer,
  MatchSquadPlayerOptional,
  Match,
  getValidationSchema,
} from "../types";
import { ScorecardInningsEntry } from "../types/matchData";
import { CommentaryInningsEntry } from "../types/commentary";

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

router.get(
  "/:id/score",
  validateRequest({
    params: getValidationSchema({
      id: "DatabaseIntIdParam",
    }),
  }),
  getMatchScore
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
    body: Match,
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
      inningsType: "ScorecardInningsType",
    }),
  }),
  getInningsScore
);

router.post(
  "/:id/innings/:inningsType/score",
  validateRequest({
    params: getValidationSchema({
      id: "DatabaseIntIdParam",
      inningsType: "ScorecardInningsType",
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
      inningsType: "ScorecardInningsType",
    }),
  }),
  deleteInningsScore
);

router.get(
  "/:id/innings/:inningsType/commentary",
  validateRequest({
    params: getValidationSchema({
      id: "DatabaseIntIdParam",
      inningsType: "CommentaryInningsType",
    }),
  }),
  getFullCommentary
);

router.get(
  "/:id/commentary-pagination/:inningsType/:timestamp",
  validateRequest({
    params: getValidationSchema({
      id: "DatabaseIntIdParam",
      inningsType: "CommentaryInningsType",
      timestamp: "TimestampParam",
    }),
  }),
  getCommentaryPagination
);

router.get(
  "/:id/commentary",
  validateRequest({
    params: getValidationSchema({
      id: "DatabaseIntIdParam",
    }),
  }),
  getCommentary
);

router.post(
  "/:id/innings/:inningsType/commentary",
  validateRequest({
    params: getValidationSchema({
      id: "DatabaseIntIdParam",
      inningsType: "CommentaryInningsType",
    }),
    body: CommentaryInningsEntry,
  }),
  addInningsCommentary
);

export default router;
