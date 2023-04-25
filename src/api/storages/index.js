const routerGroup = require("../../utils/routerGroup");
const routes = require("./routes");

module.exports = {
  name: "storages",
  version: "1.0.0",
  register: async (
    server,
    {
      storageImage,
    }
  ) => {
    server.route(
      routerGroup(process.env.PREFIX, routes(storageImage))
    );
  },
};
