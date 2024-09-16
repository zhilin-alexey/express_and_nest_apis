import { EndpointsFactory } from "express-zod-api";
import config from "./config";
import resultHandler from "./result-handler";

const endpointsFactory = new EndpointsFactory({
  config,
  resultHandler
});

export default endpointsFactory;
