import { leftovers, shop, product } from "database/schema.js";
import db from "database/connection.js";
import { z } from "zod";
import { createSelectSchema } from "drizzle-zod";
import endpointsFactory from "../../response-factory.js";
import { stringMin3Max225Nullish } from "../../zod-common.js";
import { and, eq, inArray, sql } from "drizzle-orm";
import addToHistory from "../../add-to-history.js";
import createHttpError from "http-errors";

const leftoversIncreaseEndpoint = endpointsFactory.build({
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
            ? sql`${leftovers.shelfAmount}
                  +
                  ${shelfAmount}`
            : undefined,
          orderAmount: orderAmount
            ? sql`${leftovers.orderAmount}
                  +
                  ${orderAmount}`
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
      action: "leftover_increased",
      leftoverId: leftoversResult.id,
      amount: shelfAmount || orderAmount
    }).catch(e => logger.error(e));

    if (!leftoversResult) {
      throw createHttpError(404, "Leftover not found");
    }

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
  output: createSelectSchema(leftovers)
});

export default leftoversIncreaseEndpoint;
