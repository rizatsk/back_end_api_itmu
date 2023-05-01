const routerGroup = require("../../utils/routerGroup");
const UsersHandler = require("./handler");
const routes = require("./routes");

module.exports = {
  name: "users",
  version: "1.0.0",
  register: async (
    server,
    { lock, service, authentication, authorizationService, logActivityService, validator }
  ) => {
    const usersHandler = new UsersHandler({
      lock,
      service,
      authentication,
      authorizationService,
      logActivityService,
      validator,
    });
    server.route(routerGroup(process.env.PREFIX, routes(usersHandler)));
  },
};
