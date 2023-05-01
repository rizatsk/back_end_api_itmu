const routerGroup = require("../../utils/routerGroup");
const RequestServiceHandler = require("./handler");
const routes = require("./routes");

module.exports = {
    name: "requestService",
    register: async (
        server,
        {
            lock,
            service,
            logActivityService,
            authorizationService,
            validator,
        }
    ) => {
        const requestServiceHandler = new RequestServiceHandler({
            lock,
            service,
            logActivityService,
            authorizationService,
            validator,
        });
        server.route(routerGroup(process.env.PREFIX, routes(requestServiceHandler)));
    },
};
