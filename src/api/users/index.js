const routerGroup = require("../../utils/routerGroup");
const UsersHandler = require("./handler");
const routes = require("./routes");

module.exports = {
  name: "users",
  version: "1.0.0",
  register: async (
    server,
    { service, authentication, logActivityService, validator }
  ) => {
    const usersHandler = new UsersHandler(
      service,
      authentication,
      logActivityService,
      validator
    );
    server.route(routerGroup(process.env.PREFIX, routes(usersHandler)));
  },
};
