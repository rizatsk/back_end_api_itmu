const routerGroup = require("../../utils/routerGroup");
const PackageServiceHandler = require("./handler");
const routes = require("./routes");

module.exports = {
  name: "packageServices",
  version: "1.0.0",
  register: async (server, { service, logActivityService, validator }) => {
    const packageServiceHandler = new PackageServiceHandler({
      service,
      logActivityService,
      validator,
    });
    server.route(
      routerGroup(process.env.PREFIX, routes(packageServiceHandler))
    );
  },
};
