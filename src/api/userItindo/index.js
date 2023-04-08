const routerGroup = require("../../utils/routerGroup");
const UserItindoHandler = require("./handler");
const routes = require("./routes");

module.exports = {
  name: "userItindo",
  register: async (
    server,
    {
      service,
      tokenManager,
      validator,
      logActivityService,
      authenticationService,
    }
  ) => {
    const userItindoHandler = new UserItindoHandler({
      service,
      tokenManager,
      validator,
      logActivityService,
      authenticationService,
    });
    server.route(routerGroup(process.env.PREFIX, routes(userItindoHandler)));
  },
};
