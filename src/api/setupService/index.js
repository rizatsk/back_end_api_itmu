const routerGroup = require("../../utils/routerGroup");
const SetupServiceHandler = require("./handler");
const routes = require("./routes");

module.exports = {
  name: "setupService",
  register: async (server, {
    lock,
    service,
    authorizationService,
    validator,
    logActivityService,
  }) => {
    const setupServiceHandler = new SetupServiceHandler({
      lock,
      service,
      authorizationService,
      validator,
      logActivityService,
    });
    server.route(
      routerGroup(process.env.PREFIX, routes(setupServiceHandler))
    );
  },
};
