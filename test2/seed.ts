import { Readable } from "stream";
import { fakerRU } from "@faker-js/faker";
import age from "@fakerjs/age";
import pgPool from "./pg.pool";
import { from as copyFrom } from "pg-copy-streams";
import { pipeline } from "node:stream/promises";

async function seed(num: number, chunkSize: number) {
  console.log(
    `Seeding with fake data (${num} users) with ${chunkSize} chuck size...`
  );
  const connection = await pgPool.connect();
  console.log("Connected to the database");
  //language=PostgreSQL
  const copyStream = connection.query(
    copyFrom(
      `copy users (name, surname, age, has_problem) from stdin (format csv)`
    )
  );
  let i = 0;
  //noinspection JSUnusedGlobalSymbols
  const fakerStream = new Readable({
    read() {
      if (i < num) {
        if (i + chunkSize > num) chunkSize = num - i;
        i += chunkSize;

        for (let j = 0; j < chunkSize; j++) {
          const fullName = fakerRU.person.fullName().split(" ");
          const data = [
            fullName[0],
            fullName[1],
            age({ type: "adult" }),
            fakerRU.datatype.boolean()
          ];

          this.push(data.join(",") + "\n");
        }

        console.log(`Generated ${i}/${num} users
        Sending to the database...`);
      } else {
        this.push(null);
      }
    }
  });

  console.time("Time elapsed");
  await pipeline(fakerStream, copyStream);
  console.timeEnd("Time elapsed");

  connection.release();
  console.log("Successfully seeded the database");
}

seed(
  Number(process.argv.slice(2)[0]) || 1_000_000,
  Number(process.argv.slice(3)[0]) || 200_000
);
