import { z } from "zod";

export const numberRangeNullish = z
  .object({
    start: z.number().positive().nullish(),
    end: z.number().positive().nullish()
  })
  .nullish();

export const stringMin3Max225 = z.string().min(3).max(225);

export const stringMin3Max225Nullish = stringMin3Max225.or(
  z.string().nullish()
);
