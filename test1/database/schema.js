//noinspection JSUnusedGlobalSymbols

import {
  integer,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const product = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  plu: varchar("plu").notNull().unique(),
  name: varchar("name").notNull()
});

export const productRelations = relations(product, ({ many }) => ({
  leftovers: many(leftovers)
}));

export const shop = pgTable("shops", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name").notNull().unique()
});

export const shopRelations = relations(shop, ({ many }) => ({
  products: many(product)
}));

export const leftovers = pgTable("leftovers", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .references(() => product.id)
    .notNull(),
  shopId: uuid("shop_id")
    .references(() => shop.id)
    .notNull(),
  shelfAmount: integer("shelf_amount").notNull(),
  orderAmount: integer("order_amount").notNull()
});

export const leftoversRelations = relations(leftovers, ({ one }) => ({
  product: one(product, {
    fields: [leftovers.productId],
    references: [product.id]
  }),
  shop: one(shop, {
    fields: [leftovers.shopId],
    references: [shop.id]
  })
}));

export const actionType = pgEnum("action_type", [
  "leftovers_listed",
  "leftover_created",
  "leftover_increased",
  "leftover_decreased",
  "product_created",
  "products_listed"
]);

export const history = pgTable("history", {
  id: uuid("id").primaryKey().defaultRandom(),
  action: actionType("action").notNull(),
  leftoverId: uuid("leftover_id").references(() => leftovers.id),
  shopId: uuid("shop_id").references(() => shop.id),
  productId: uuid("product_id").references(() => product.id),
  amount: integer("amount"),
  at: timestamp("at", { withTimezone: true }).defaultNow().notNull()
});
