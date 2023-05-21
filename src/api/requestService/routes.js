const routes = (handler) => [
    {
        method: "GET",
        path: "/request-service/before",
        handler: handler.getDataForRequestServiceHandler,
    },
    {
        method: "GET",
        path: "/request-service/product",
        handler: handler.getProductForRequestServiceHandler,
    },
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
        path: "/request-service/user",
        handler: handler.getRequestServiceByTokenUserHandler,
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
    // For CMS
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
        method: "GET",
        path: "/request-service/track-history/{id}",
        handler: handler.getTrackHistoryServicesByServiceIdHandler,
        options: {
            auth: "itindosolution_jwt",
        },
    },
    {
        method: "PUT",
        path: "/request-service/status-realprice/{id}",
        handler: handler.putStatusAndRealPriceRequestServiceByIdHandler,
        options: {
            auth: "itindosolution_jwt",
        },
    },
];

module.exports = routes;