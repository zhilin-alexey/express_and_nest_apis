//noinspection JSUnusedGlobalSymbols

import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./schema.js",
  dialect: "postgresql",
  out: "./migrations",
  dbCredentials: {
    url: process.env.DATABASE_URL || ""
  }
});
