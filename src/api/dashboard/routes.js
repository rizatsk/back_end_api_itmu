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
        path: "/dashboard",
        method: "POST",
        handler: handler.postDashboardHandler,
    },
    {
        path: "/mobile/home",
        method: "GET",
        handler: handler.getDataHomeHandler,
    },
];

module.exports = routes;