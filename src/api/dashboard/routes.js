const routes = (handler) => [
    {
        path: "/dashboard",
        method: "GET",
        handler: handler.getDataDashboardHandler,
        options: {
            auth: "itindosolution_jwt",
        },
    },
    {
        path: "/mobile/home",
        method: "GET",
        handler: handler.getDataHomeHandler,
    },
];

module.exports = routes;