const routerGroup = require("../../utils/routerGroup");
const AuthenticationHandler = require("./handler");
const routes = require("./routes");

module.exports = {
  name: "authentications",
  version: "1.0.0",
  register: async (
    server,
    {
      lock,
      authenticationService,
      usersService,
      logActivityService,
      tokenManager,
      validator,
      userItindoService
    }
  ) => {
    const authenticationHandler = new AuthenticationHandler({
      lock,
      authenticationService,
      usersService,
      logActivityService,
      tokenManager,
      validator,
      userItindoService
    });
    server.route(
      routerGroup(process.env.PREFIX, routes(authenticationHandler))
    );
  },
};
