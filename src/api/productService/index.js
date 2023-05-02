const routerGroup = require("../../utils/routerGroup");
const ProductServiceHandler = require("./handler");
const routes = require("./routes");

module.exports = {
  name: "productService",
  register: async (server, {
    lock,
    service,
    authorizationService,
    validator,
    logActivityService,
  }) => {
    const productServiceHandler = new ProductServiceHandler({
      lock,
      service,
      authorizationService,
      validator,
      logActivityService,
    });
    server.route(
      routerGroup(process.env.PREFIX, routes(productServiceHandler))
    );
  },
};
