import { Routing } from "express-zod-api";
import historyAddEndpoint from "@/routes/history/add";
import historyListEndpoint from "@/routes/history/list";

const router: Routing = {
  history: {
    add: historyAddEndpoint,
    list: historyListEndpoint
  }
};

export default router;
