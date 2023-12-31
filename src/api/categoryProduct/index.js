const routerGroup = require("../../utils/routerGroup");
const CategoryProductHandler = require("./handler");
const routes = require("./routes");

module.exports = {
  name: "categoryProduct",
  register: async (server, {
    lock,
    service,
    authorizationService,
    validator,
    productService,
    logActivityService,
  }) => {
    const categoryProductHandler = new CategoryProductHandler({
      lock,
      service,
      authorizationService,
      validator,
      productService,
      logActivityService,
    });
    server.route(
      routerGroup(process.env.PREFIX, routes(categoryProductHandler))
    );
  },
};
