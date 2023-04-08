const routerGroup = require("../../utils/routerGroup");
const AuthenticationHandler = require("./handler");
const routes = require("./routes");

module.exports = {
  name: "authenticationItindo",
  version: "1.0.0",
  register: async (
    server,
    {
      lock,
      authenticationService,
      userItindoService,
      logActivityService,
      tokenManager,
      validator,
    }
  ) => {
    const authenticationHandler = new AuthenticationHandler({
      lock,
      authenticationService,
      userItindoService,
      logActivityService,
      tokenManager,
      validator,
    });
    server.route(
      routerGroup(process.env.PREFIX, routes(authenticationHandler))
    );
  },
};
