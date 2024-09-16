//noinspection JSUnusedGlobalSymbols

import { boolean, pgTable, smallint, uuid, varchar } from "drizzle-orm/pg-core";

export const userTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name"),
  surname: varchar("surname"),
  age: smallint("age"),
  hasProblem: boolean("has_problem").default(false)
});
