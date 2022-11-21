const routerGroup = require("../../utils/routerGroup");
const ProductsHandler = require("./handler");
const routes = require("./routes");

module.exports = {
  name: "products",
  version: "1.0.0",
  register: async (
    server,
    { service, logActivityService, validator, storageService }
  ) => {
    const productsHandler = new ProductsHandler({
      service,
      logActivityService,
      validator,
      storageService,
    });
    server.route(routerGroup(process.env.PREFIX, routes(productsHandler)));
  },
};
