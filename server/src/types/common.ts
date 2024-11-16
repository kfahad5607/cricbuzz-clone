import * as z from "zod";
import { ScorecardInningsType } from "./matchData";
import { CommentaryInningsType } from "./commentary";
import { MatchFormat, ScheduleType } from "./matches";

const ZString = z.string();
type ZString = z.infer<typeof ZString>;

const DatabaseIntIdParam = z
  .string({
    required_error: "ID is required.",
  })
  .refine((val) => {
    try {
      const num = Number(val);
      if (isNaN(num) || num < 1) throw Error("");
      return num;
    } catch (err) {
      return false;
    }
  });

const InningsIdParam = z
  .string({
    required_error: "Innings ID is required.",
  })
  .refine((val) => {
    try {
      const num = Number(val);
      if (isNaN(num) || num < 1 || num > 4) throw Error("");
      return num;
    } catch (err) {
      return false;
    }
  });

const TimestampParam = z.coerce.number().positive();

export type DatabaseIntIdParam = z.infer<typeof DatabaseIntIdParam>;
export type InningsIdParam = z.infer<typeof InningsIdParam>;
export type DatabaseIntId = number;
export type TimestampParam = string;

// utility functions
const VALIDATION_SCHEMAS = {
  DatabaseIntIdParam,
  InningsIdParam,
  ScorecardInningsType,
  CommentaryInningsType,
  TimestampParam,
  MatchFormat,
  ScheduleType,
  ZString,
} as const;

type VALIDATION_SCHEMAS = {
  DatabaseIntIdParam: DatabaseIntIdParam;
  InningsIdParam: InningsIdParam;
  ScorecardInningsType: ScorecardInningsType;
  CommentaryInningsType: CommentaryInningsType;
  TimestampParam: TimestampParam;
  MatchFormat: MatchFormat;
  ScheduleType: ScheduleType;
  ZString: ZString;
};

type ValidationSchemas = typeof VALIDATION_SCHEMAS;
type ValidationSchemasKeys = keyof ValidationSchemas;
type ValidationResultInput = Record<string, ValidationSchemasKeys>;

export const getValidationSchema = <T extends ValidationResultInput>(
  shape: T,
  shapeOptionals?: T
): z.ZodSchema => {
  let res = z.object({});

  for (const key in shape) {
    res = res.extend({
      [key]: VALIDATION_SCHEMAS[shape[key]],
    });
  }

  if (shapeOptionals) {
    for (const key in shapeOptionals) {
      console.log(
        "KEY ",
        key,
        shapeOptionals[key],
        VALIDATION_SCHEMAS[shapeOptionals[key]]
      );

      res = res.extend({
        [key]: VALIDATION_SCHEMAS[shapeOptionals[key]].optional(),
      });
    }
  }

  return res;
};

// utility types
export type getValidationType<
  T extends ValidationResultInput,
  TOptionals extends ValidationResultInput = {}
> = {
  [K in keyof T]: VALIDATION_SCHEMAS[T[K]];
} & {
  [K in keyof TOptionals]?: VALIDATION_SCHEMAS[TOptionals[K]];
};

// manual types
export type UpdateDocType<
  T extends Record<string, any>,
  Prefix extends string
> = {
  [K in keyof T as `${Prefix}${string & K}`]: T[K];
};
