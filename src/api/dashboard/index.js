const routerGroup = require("../../utils/routerGroup");
const DashboardHandler = require("./handler");
const routes = require("./routes");

module.exports = {
  name: "dashboard",
  register: async (server, {
    lock,
    service,
    authorizationService,
  }) => {
    const dashboardHandler = new DashboardHandler({
      lock,
      service,
      authorizationService,
    });
    server.route(
      routerGroup(process.env.PREFIX, routes(dashboardHandler))
    );
  },
};
