import express, { query, Router } from "express";
import { getOptions } from "../controllers/common";
import { validateRequest } from "../middlewares";
import { getValidationSchema } from "../types";

const router: Router = express.Router();

router.get(
  "/options/:resourceType",
  validateRequest({
    params: getValidationSchema({
      resourceType: "ApiResourceType",
    }),
    query: getValidationSchema(
      {},
      {
        query: "ZString",
        recordId: "DatabaseIntIdParam",
      }
    ),
  }),
  getOptions
);

export default router;
