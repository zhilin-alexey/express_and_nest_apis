import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";
import { DrizzlePGModule } from "@knaadh/nestjs-drizzle-pg";
import * as schema from "./drizzle.schema";

@Module({
  imports: [
    ConfigModule.forRoot(),
    DrizzlePGModule.register({
      tag: "db",
      pg: {
        connection: "pool",
        config: {
          connectionString: process.env.DATABASE_URL
        }
      },
      config: { schema: { ...schema } }
    })
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
