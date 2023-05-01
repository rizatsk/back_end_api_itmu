const routerGroup = require("../../utils/routerGroup");
const FeeReplacementHandler = require("./handler");
const routes = require("./routes");

module.exports = {
  name: "feeReplacement",
  register: async (server, {
    lock,
    service,
    authorizationService,
    validator,
    logActivityService,
  }) => {
    const feeReplacementHandler = new FeeReplacementHandler({
      lock,
      service,
      authorizationService,
      validator,
      logActivityService,
    });
    server.route(
      routerGroup(process.env.PREFIX, routes(feeReplacementHandler))
    );
  },
};
