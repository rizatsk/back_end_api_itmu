const routes = (handler) => [
    {
        method: "POST",
        path: "/fee-replacement",
        handler: handler.postFeeReplacementHandler,
        options: {
            auth: "itindosolution_jwt",
        },
    },
    {
        method: "GET",
        path: "/fee-replacement",
        handler: handler.getFeeReplacementsHandler,
        options: {
            auth: "itindosolution_jwt",
        },
    },
    {
        method: "GET",
        path: "/fee-replacement/for/product",
        handler: handler.getFeeReplacementForProductHandler,
        options: {
            auth: "itindosolution_jwt",
        },
    },
    {
        method: "GET",
        path: "/fee-replacement/{id}",
        handler: handler.getFeeReplacementByIdHandler,
        options: {
            auth: "itindosolution_jwt",
        },
    },
    {
        method: "PUT",
        path: "/fee-replacement/{id}",
        handler: handler.updateFeeReplacementByIdHandler,
        options: {
            auth: "itindosolution_jwt",
        },
    },
    {
        method: "DELETE",
        path: "/fee-replacement/{id}",
        handler: handler.deleteFeeReplacementByIdHandler,
        options: {
            auth: "itindosolution_jwt",
        },
    },
];

module.exports = routes;