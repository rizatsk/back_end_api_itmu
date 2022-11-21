const routerGroup = require("../../utils/routerGroup");
const AuthenticationHandler = require("./handler");
const routes = require("./routes");

module.exports = {
  name: "authentications",
  version: "1.0.0",
  register: async (
    server,
    {
      authenticationService,
      usersService,
      logActivityService,
      tokenManager,
      validator,
    }
  ) => {
    const authenticationHandler = new AuthenticationHandler({
      authenticationService,
      usersService,
      logActivityService,
      tokenManager,
      validator,
    });
    server.route(
      routerGroup(process.env.PREFIX, routes(authenticationHandler))
    );
  },
};
