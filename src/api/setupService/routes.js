const routes = (handler) => [
    {
        method: "POST",
        path: "/setup-service",
        handler: handler.postSetupServiceHandler,
        options: {
            auth: "itindosolution_jwt",
        },
    },
    {
        method: "GET",
        path: "/setup-service",
        handler: handler.getSetupServicesHandler,
        options: {
            auth: "itindosolution_jwt",
        },
    },
    {
        method: "GET",
        path: "/setup-service/{id}",
        handler: handler.getSetupServiceByIdHandler,
        options: {
            auth: "itindosolution_jwt",
        },
    },
    {
        method: "PUT",
        path: "/setup-service/{id}",
        handler: handler.updateSetupServiceByIdHandler,
        options: {
            auth: "itindosolution_jwt",
        },
    },
    {
        method: "DELETE",
        path: "/setup-service/{id}",
        handler: handler.deleteSetupServiceByIdHandler,
        options: {
            auth: "itindosolution_jwt",
        },
    },
]

module.exports = routes;