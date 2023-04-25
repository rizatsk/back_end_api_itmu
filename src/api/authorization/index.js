const routerGroup = require("../../utils/routerGroup");
const AuthorizationHandler = require("./handler");
const routes = require("./routes");

module.exports = {
    name: 'authorization',
    register: async (
        server,
        {
            lock,
            service,
            validator
        }
    ) => {
        const authorizationHandler = new AuthorizationHandler({
            lock,
            service,
            validator
        });
        server.route(
            routerGroup(process.env.PREFIX, routes(authorizationHandler))
        );
    },
}