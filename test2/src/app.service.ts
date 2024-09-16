import { Inject, Injectable } from "@nestjs/common";
import * as schema from "./drizzle.schema";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";

@Injectable()
export class AppService {
  constructor(@Inject("db") private drizzle: NodePgDatabase<typeof schema>) {}
  async getUserWithProblemsAndFix(): Promise<number> {
    const result = await this.drizzle.execute(
      sql`
          WITH rows AS (
          UPDATE users
          SET has_problem = false
          WHERE has_problem = true RETURNING 1
            )
          SELECT count(*)
          FROM rows;
      `
    );
    return result.rows[0].count as number;
  }
}
