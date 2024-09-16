import { createServer } from "express-zod-api";
import router from "./router";
import config from "./config";

await createServer(config, router);
