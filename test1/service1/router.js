import newProductEndpoint from "./routes/products/new.js";
import productsListEndpoint from "./routes/products/list.js";

import NewLeftoversEndpoint from "./routes/leftovers/new.js";
import LeftoversListEndpoint from "./routes/leftovers/list.js";
import leftoversIncreaseEndpoint from "./routes/leftovers/increase.js";
import leftoversDecreaseEndpoint from "./routes/leftovers/decrease.js";

const router = {
  products: {
    new: newProductEndpoint,
    list: productsListEndpoint
  },
  leftovers: {
    new: NewLeftoversEndpoint,
    list: LeftoversListEndpoint,
    increase: leftoversIncreaseEndpoint,
    decrease: leftoversDecreaseEndpoint
  }
};

export default router;
