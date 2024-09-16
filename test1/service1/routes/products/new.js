import { leftovers, product, shop } from "database/schema.js";
import db from "database/connection.js";
import { z } from "zod";
import createHttpError from "http-errors";
import endpointsFactory from "../../response-factory.js";
import { createInsertSchema } from "drizzle-zod";
import { eq } from "drizzle-orm";
import { stringMin3Max225, stringMin3Max225Nullish } from "../../zod-common.js";
import addToHistory from "../../add-to-history.js";

const getNewProductEndpoint = endpointsFactory.build({
  method: "post",
  handler: async ({
    input: { plu, name, shopName, numberOnShelf, numberInOrder },
    logger
  }) => {
    let newProduct;
    try {
      newProduct = (
        await db
          .insert(product)
          .values({
            plu,
            name
          })
          .returning()
      )[0];
    } catch (error) {
      if (error?.code === "23505") {
        throw createHttpError(409, "Product already exists");
      }
      throw error;
    }
    let newShop;
    await db.transaction(async tx => {
      newShop = (
        await db.select().from(shop).where(eq(shop.name, shopName)).limit(1)
      )[0];
      if (!newShop) {
        newShop = (
          await tx.insert(shop).values({ name: shopName }).returning()
        )[0];
      }
    });
    if (!newShop) {
      await db.delete(newProduct).where(eq(product.id, newProduct.id));
      throw createHttpError(500);
    }
    const newLeftovers = (
      await db
        .insert(leftovers)
        .values({
          productId: newProduct.id,
          shopId: newShop.id,
          shelfAmount: numberOnShelf,
          orderAmount: numberInOrder
        })
        .returning()
    )[0];

    addToHistory({
      action: "product_created",
      productId: newProduct.id,
      shopId: newShop.id,
      leftoverId: newLeftovers.id
    }).catch(e => logger.error(e));

    return { ...newProduct, leftovers: newLeftovers, shop: newShop };
  },
  input: z.object({
    plu: stringMin3Max225,
    name: stringMin3Max225,
    numberOnShelf: z.number().positive(),
    numberInOrder: z.number().positive(),
    shopName: stringMin3Max225Nullish
  }),
  output: createInsertSchema(product).extend({
    leftovers: createInsertSchema(leftovers),
    shop: createInsertSchema(shop)
  })
});

export default getNewProductEndpoint;
