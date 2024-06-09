import * as z from "zod";
import { InningsType } from "./scorecard";

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

export type DatabaseIntIdParam = z.infer<typeof DatabaseIntIdParam>;
export type InningsIdParam = z.infer<typeof InningsIdParam>;
export type DatabaseIntId = number;

// utility functions
const VALIDATION_SCHEMAS = {
  DatabaseIntIdParam,
  InningsIdParam,
  InningsType,
} as const;

type VALIDATION_SCHEMAS = {
  DatabaseIntIdParam: DatabaseIntIdParam;
  InningsIdParam: InningsIdParam;
  InningsType: InningsType;
};

type ValidationSchemas = typeof VALIDATION_SCHEMAS;
type ValidationSchemasKeys = keyof ValidationSchemas;
type ValidationResultInput = Record<string, ValidationSchemasKeys>;

export const getValidationSchema = <T extends ValidationResultInput>(
  shape: T
): z.ZodSchema => {
  let res = z.object({});

  for (const key in shape) {
    res = res.extend({
      [key]: VALIDATION_SCHEMAS[shape[key]],
    });
  }

  return res;
};

// utility types
export type getValidationType<T extends ValidationResultInput> = {
  [K in keyof T]: VALIDATION_SCHEMAS[T[K]];
};

// manual types
export type UpdateDocType<
  T extends Record<string, any>,
  Prefix extends string
> = {
  [K in keyof T as `${Prefix}${string & K}`]: T[K];
};
