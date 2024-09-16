import { createServer } from "express-zod-api";
import router from "./router.js";
import config from "./config.js";

await createServer(config, router);
