const routes = (handler) => [
    {
        path: "/dashboard",
        method: "GET",
        handler: handler.getDataDashboardHandler,
        options: {
            auth: "itindosolution_jwt",
        },
    },
];

module.exports = routes;