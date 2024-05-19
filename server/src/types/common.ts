import * as z from "zod";

export const ParamsWithNumId = z.object({
  id: z
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
    }),
});

export type ParamsWithNumId = z.infer<typeof ParamsWithNumId>;
