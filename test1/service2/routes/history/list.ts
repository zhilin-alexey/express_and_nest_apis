import responseFactory from "@/response-factory";
import db from "database/connection.js";
import { z } from "zod";
import { history, shop, product } from "database/schema.js";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { and, eq, gte, lte } from "drizzle-orm";
import createHttpError from "http-errors";

const historyListEndpoint = responseFactory.build({
  method: "get",
  handler: async ({ input: { shopId, plu, at, action, page, onPage } }) => {
    const historyResult = await db
      .select({
        id: history.id,
        action: history.action,
        leftoverId: history.leftoverId,
        shopId: history.shopId,
        productId: history.productId,
        amount: history.amount,
        at: history.at
      })
      .from(history)
      .leftJoin(product, eq(history.productId, product.id))
      .where(
        and(
          (action && eq(history.action, action)) || undefined,
          (shopId && eq(history.shopId, shopId)) || undefined,
          (plu && eq(product.plu, plu)) || undefined,
          (at?.start && gte(history.at, at.start)) || undefined,
          (at?.end && lte(history.at, at.end)) || undefined
        )
      )
      .offset(page != null ? (page - 1) * (onPage || 10) : 0)
      .limit(onPage || (page ? 10 : 0));
    if (!historyResult.length) throw createHttpError(404);
    return historyResult;
  },
  input: z.object({
    shopId: createSelectSchema(shop).shape.id.nullish(),
    plu: z.string().min(3).max(225).or(z.string().nullish()),
    at: z
      .object({
        start: z.date().nullish(),
        end: z.date().nullish()
      })
      .nullish(),
    action: createInsertSchema(history).shape.action.nullish(),
    page: z.number().int().positive().min(1).nullish(),
    onPage: z.number().int().positive().min(1).nullish().default(10)
  }),
  // @ts-expect-error array will work
  output: z.array(createSelectSchema(history))
});
export default historyListEndpoint;
