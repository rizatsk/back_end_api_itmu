const routerGroup = require("../../utils/routerGroup");
const ProductTestHandler = require("./handler");
const routes = require("./routes");

module.exports = {
    name: "productTest",
    register: async (
        server,
        {
            lock, service, storageService, validator
        }
    ) => {
        const productTestHandler = new ProductTestHandler({
            lock, service, storageService, validator
        });
        server.route(routerGroup(process.env.PREFIX, routes(productTestHandler)));
    },
};
