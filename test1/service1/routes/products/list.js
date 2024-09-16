import { leftovers, product } from "database/schema.js";
import db from "database/connection.js";
import { z } from "zod";
import { eq } from "drizzle-orm";
import createHttpError from "http-errors";
import endpointsFactory from "../../response-factory.js";
import { createInsertSchema } from "drizzle-zod";
import { stringMin3Max225Nullish } from "../../zod-common.js";
import addToHistory from "../../add-to-history.js";

const productsListEndpoint = endpointsFactory.build({
  method: "get",
  handler: async ({ input: { name, plu }, logger }) => {
    let selectProducts = db
      .select({
        id: product.id,
        name: product.name,
        plu: product.plu,
        leftovers: {
          id: leftovers.id,
          shopId: leftovers.shopId,
          shelfAmount: leftovers.shelfAmount,
          orderAmount: leftovers.orderAmount
        }
      })
      .from(product)
      .leftJoin(leftovers, eq(leftovers.productId, product.id));

    if (name) {
      selectProducts = selectProducts.where(eq(product.name, name));
    }
    if (plu) {
      selectProducts = selectProducts.where(eq(product.plu, plu));
    }

    const productsResult = await selectProducts;

    addToHistory({
      action: "products_listed"
    }).catch(e => logger.error(e));

    if (!productsResult.length) {
      throw createHttpError(404, "Products not found");
    }

    return productsResult;
  },
  input: z.object({
    name: stringMin3Max225Nullish,
    plu: stringMin3Max225Nullish
  }),
  output: z.array(
    createInsertSchema(product).extend({
      leftovers: createInsertSchema(leftovers).omit({
        productId: true
      })
    })
  )
});
export default productsListEndpoint;
