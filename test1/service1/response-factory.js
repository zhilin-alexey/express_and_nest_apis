import { EndpointsFactory } from "express-zod-api";
import config from "./config.js";
import resultHandler from "./result-handler.js";

const endpointsFactory = new EndpointsFactory({
  config,
  resultHandler
});

export default endpointsFactory;
