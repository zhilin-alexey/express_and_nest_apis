import { leftovers, shop, product } from "database/schema.js";
import db from "database/connection.js";
import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import endpointsFactory from "../../response-factory.js";
import { stringMin3Max225Nullish } from "../../zod-common.js";
import { and, eq, inArray, sql } from "drizzle-orm";
import addToHistory from "../../add-to-history.js";

const leftoversDecreaseEndpoint = endpointsFactory.build({
  method: "post",
  handler: async ({
    input: { plu, shopId, leftoversId, shelfAmount, orderAmount },
    logger
  }) => {
    const leftoversResult = (
      await db
        .update(leftovers)
        .set({
          shelfAmount: shelfAmount
            ? // @formatter:off
              sql`GREATEST(${leftovers.shelfAmount} - ${shelfAmount}, 0)`
            : undefined,
          orderAmount: orderAmount
            ? // @formatter:off
              sql`GREATEST(${leftovers.orderAmount} - ${orderAmount}, 0)`
            : undefined
        })
        .where(
          leftoversId
            ? eq(leftovers.id, leftoversId)
            : inArray(
                leftovers.id,
                db
                  .select({ id: leftovers.id })
                  .from(leftovers)
                  .innerJoin(product, eq(leftovers.productId, product.id))
                  .where(
                    and(eq(leftovers.shopId, shopId), eq(product.plu, plu))
                  )
              )
        )
        .returning({
          ...leftovers
        })
    )[0];

    addToHistory({
      action: "leftover_decreased",
      leftoversId,
      amount: shelfAmount || orderAmount
    }).catch(e => logger.error(e));

    return leftoversResult;
  },
  input: z
    .object({
      plu: stringMin3Max225Nullish,
      shopId: createSelectSchema(shop).shape.id.nullish(),
      leftoversId: createSelectSchema(leftovers).shape.id.nullish(),
      shelfAmount: z.number().positive().nullish(),
      orderAmount: z.number().positive().nullish()
    })
    .refine(({ plu, shopId, leftoversId }) => (plu && shopId) || leftoversId, {
      message: "Either plu and shopId or leftoversId must be provided"
    })
    .refine(({ shelfAmount, orderAmount }) => shelfAmount || orderAmount, {
      message: "Either shelfAmount or orderAmount must be provided"
    }),
  output: createInsertSchema(leftovers)
});

export default leftoversDecreaseEndpoint;
