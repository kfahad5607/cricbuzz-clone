import * as z from "zod";

export const IdsMap = z.record(
  z.coerce.number().positive(),
  z.coerce.number().positive()
);

// inferred types
export type IdsMap = z.infer<typeof IdsMap>;
