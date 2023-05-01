const routes = (handler) => [
    {
        method: "POST",
        path: "/request-service",
        handler: handler.postRequestServiceHandler,
        options: {
            auth: "itindosolution_user_jwt",
        },
    },
    {
        method: "GET",
        path: "/request-service/user/{id}",
        handler: handler.getRequestServiceByIdAndUserIdHandler,
        options: {
            auth: "itindosolution_user_jwt",
        },
    },
    {
        method: "GET",
        path: "/request-service",
        handler: handler.getRequestServicesHandler,
        options: {
            auth: "itindosolution_jwt",
        },
    },
    {
        method: "GET",
        path: "/request-service/{id}",
        handler: handler.getRequestServiceByIdHandler,
        options: {
            auth: "itindosolution_jwt",
        },
    },
    {
        method: "PUT",
        path: "/request-service/status/{id}",
        handler: handler.putStatusRequestServiceByIdHandler,
        options: {
            auth: "itindosolution_jwt",
        },
    },
];

module.exports = routes;