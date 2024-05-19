import { NextFunction, Request, Response } from "express";
import { ZodError, ZodSchema } from "zod";

interface RequestValidators {
  params?: ZodSchema;
  body?: ZodSchema;
  query?: ZodSchema;
}

interface MessageResponse {
  message: string;
}

interface ErrorResponse extends MessageResponse {
  stack?: string;
}

export function validateRequest(validators: RequestValidators) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (validators.params) {
        req.params = await validators.params.parseAsync(req.params);
      }
      if (validators.body) {
        req.body = await validators.body.parseAsync(req.body);
      }
      if (validators.query) {
        req.query = await validators.query.parseAsync(req.query);
      }

      next();
    } catch (err) {
      if (err instanceof Error) {
        if (err instanceof ZodError) res.status(422);
        next(err);
      }
    }
  };
}

export function notFound(req: Request, res: Response, next: NextFunction) {
  res.status(404);
  const error = new Error(`🔍 - Not Found - ${req.originalUrl}`);
  next(error);
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response<ErrorResponse>,
  next: NextFunction
) {
  console.log("errorHandler: ", err.message);

  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode);
  return res.json({
    message: err.message,
    stack: err.stack,
  });
}
