//noinspection JSUnusedGlobalSymbols

import { defineConfig } from "drizzle-kit";
import * as process from "node:process";

export default defineConfig({
  dialect: "postgresql",
  schema: "./drizzle.schema.ts",
  out: "migrations",
  dbCredentials: {
    url: process.env.DATABASE_URL as string
  }
});
