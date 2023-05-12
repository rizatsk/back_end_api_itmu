const routerGroup = require("../../utils/routerGroup");
const UserItindoHandler = require("./handler");
const routes = require("./routes");

module.exports = {
  name: "userItindo",
  register: async (
    server,
    {
      lock,
      service,
      tokenManager,
      validator,
      logActivityService,
      authenticationService,
      authorizationService,
      tokenValidationUserService,
      storagePublic
    }
  ) => {
    const userItindoHandler = new UserItindoHandler({
      lock,
      service,
      tokenManager,
      validator,
      logActivityService,
      authenticationService,
      authorizationService,
      tokenValidationUserService,
      storagePublic
    });
    server.route(routerGroup(process.env.PREFIX, routes(userItindoHandler)));
  },
};
