import { Pool } from "pg";
import { configDotenv } from "dotenv";

configDotenv();

const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL as string
});

export default pgPool;
