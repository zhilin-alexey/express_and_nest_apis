import responseFactory from "@/response-factory";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { history } from "database/schema.js";
import db from "database/connection.js";

const historyAddEndpoint = responseFactory.build({
  method: "post",
  handler: async ({
    input: { action, leftoverId, shopId, productId, amount }
  }) => {
    return (
      await db
        .insert(history)
        .values({ action, leftoverId, shopId, productId, amount })
        .returning()
    )[0];
  },
  input: createInsertSchema(history).omit({ id: true, at: true }),
  output: createSelectSchema(history)
});

export default historyAddEndpoint;
