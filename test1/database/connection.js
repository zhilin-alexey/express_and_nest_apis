// noinspection JSUnusedGlobalSymbols

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const internal = postgres(process.env.DATABASE_URL);

const db = drizzle(internal, { logger: true });

export default db;
