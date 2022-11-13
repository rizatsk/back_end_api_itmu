const routerGroup = require("../../utils/routerGroup");
const UploadsHandler = require("./handler");
const routes = require("./routes");

module.exports = {
  name: "uploads",
  version: "1.0.0",
  register: async (
    server,
    {
      service,
      packageServiceService,
      productsService,
      logActivityService,
      storageImage,
      validator,
    }
  ) => {
    const uploadsHandler = new UploadsHandler({
      service,
      packageServiceService,
      productsService,
      logActivityService,
      validator,
    });
    server.route(
      routerGroup(process.env.PREFIX, routes(uploadsHandler, storageImage))
    );
  },
};
