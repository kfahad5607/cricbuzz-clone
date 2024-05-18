import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodError } from "zod";

interface RequestValidators {
  params?: AnyZodObject;
  body?: AnyZodObject;
  query?: AnyZodObject;
}

interface MessageResponse {
  message: string;
}

interface ErrorResponse extends MessageResponse {
  stack?: string;
}

export function validateRequest(validators: RequestValidators) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (validators.params) {
        req.params = validators.params.parse(req.params);
      }
      if (validators.body) {
        req.body = validators.body.parse(req.body);
      }
      if (validators.query) {
        req.query = validators.query.parse(req.query);
      }

      next();
    } catch (err) {
      if (err instanceof Error) {
        console.log("ZodError ", err.message);

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
  console.log("errorHandler: ", err);

  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode);
  return res.json({
    message: err.message,
    stack: err.stack,
  });
}
