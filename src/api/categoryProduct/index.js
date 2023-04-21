const routerGroup = require("../../utils/routerGroup");
const CategoryProductHandler = require("./handler");
const routes = require("./routes");

module.exports = {
  name: "categoryProduct",
  register: async (server, { service, validator, productService }) => {
    const categoryProductHandler = new CategoryProductHandler({
      service,
      validator,
      productService
    });
    server.route(
      routerGroup(process.env.PREFIX, routes(categoryProductHandler))
    );
  },
};
