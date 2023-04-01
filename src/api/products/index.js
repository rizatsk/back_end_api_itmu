const routerGroup = require("../../utils/routerGroup");
const ProductsHandler = require("./handler");
const routes = require("./routes");

module.exports = {
  name: "products",
  version: "1.0.0",
  register: async (
    server,
    {
      lock,
      service,
      logActivityService,
      validator,
      storageService,
      authorizationService,
    }
  ) => {
    const productsHandler = new ProductsHandler({
      lock,
      service,
      logActivityService,
      validator,
      storageService,
      authorizationService,
    });
    server.route(routerGroup(process.env.PREFIX, routes(productsHandler)));
  },
};
