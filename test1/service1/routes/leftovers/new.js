import endpointsFactory from "../../response-factory.js";
import { leftovers } from "database/schema.js";
import { createInsertSchema } from "drizzle-zod";
import db from "database/connection.js";
import addToHistory from "../../add-to-history.js";

const getNewLeftoversEndpoint = endpointsFactory.build({
  method: "post",
  handler: async ({
    input: { productId, shopId, shelfAmount, orderAmount },
    logger
  }) => {
    const newLeftover = (
      await db
        .insert(leftovers)
        .values({
          productId,
          shopId,
          shelfAmount,
          orderAmount
        })
        .returning()
    )[0];

    addToHistory({
      action: "leftover_created",
      leftoverId: newLeftover.id
    }).catch(e => logger.error(e));

    return newLeftover;
  },
  input: createInsertSchema(leftovers),
  output: createInsertSchema(leftovers)
});
export default getNewLeftoversEndpoint;
