import db from "database/connection.js";
import { leftovers, product, shop } from "database/schema.js";
import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { eq, gte, lte } from "drizzle-orm";
import endpointsFactory from "../../response-factory.js";
import { numberRangeNullish } from "../../zod-common.js";
import createHttpError from "http-errors";
import addToHistory from "../../add-to-history.js";

const getLeftoversListEndpoint = endpointsFactory.build({
  method: "get",
  handler: async ({
    input: { plu, shopId, shelfAmount, orderAmount },
    logger
  }) => {
    let selectLeftovers = db
      .select({
        id: leftovers.id,
        shelfAmount: leftovers.shelfAmount,
        orderAmount: leftovers.orderAmount,
        product: {
          id: product.id,
          plu: product.plu,
          name: product.name
        },
        shop: {
          id: shop.id,
          name: shop.name
        }
      })
      .from(leftovers)
      .innerJoin(product, eq(leftovers.productId, product.id))
      .innerJoin(shop, eq(leftovers.shopId, shop.id));

    if (plu) {
      selectLeftovers = selectLeftovers.where(eq(product.plu, plu));
    }
    if (shopId) {
      selectLeftovers = selectLeftovers.where(eq(shop.id, shopId));
    }
    if (shelfAmount?.start) {
      selectLeftovers = selectLeftovers.where(
        gte(leftovers.shelfAmount, shelfAmount?.start)
      );
    }
    if (shelfAmount?.end) {
      selectLeftovers = selectLeftovers.where(
        lte(leftovers.shelfAmount, shelfAmount?.end)
      );
    }
    if (orderAmount?.start) {
      selectLeftovers = selectLeftovers.where(
        gte(leftovers.orderAmount, orderAmount?.start)
      );
    }
    if (orderAmount?.end) {
      selectLeftovers = selectLeftovers.where(
        lte(leftovers.orderAmount, orderAmount?.end)
      );
    }

    const leftoversResult = await selectLeftovers;

    addToHistory({
      action: "leftovers_listed",
      shopId
    }).catch(e => logger.error(e));

    if (!leftoversResult.length)
      throw createHttpError(404, "Leftovers not found");

    return leftoversResult;
  },
  input: z.object({
    plu: z.string().min(1).min(3).max(225).or(z.string().nullish()),
    shopId: createSelectSchema(shop).shape.id.or(z.string().nullish()),
    shelfAmount: numberRangeNullish,
    orderAmount: numberRangeNullish
  }),
  output: z.array(
    createInsertSchema(leftovers)
      .omit({
        productId: true,
        shopId: true
      })
      .extend({
        product: createInsertSchema(product),
        shop: createInsertSchema(shop)
      })
  )
});
export default getLeftoversListEndpoint;
