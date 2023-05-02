const routes = (handler) => [
    {
        method: "POST",
        path: "/product-service",
        handler: handler.postProductServiceHandler,
        options: {
            auth: "itindosolution_jwt",
        },
    },
    {
        method: "GET",
        path: "/product-service",
        handler: handler.getProductServicesHandler,
        options: {
            auth: "itindosolution_jwt",
        },
    },
    {
        method: "GET",
        path: "/product-service/request-service",
        handler: handler.getProductServicesForRequestService,
    },
    {
        method: "GET",
        path: "/product-service/{id}",
        handler: handler.getProductServiceByIdHandler,
        options: {
            auth: "itindosolution_jwt",
        },
    },
    {
        method: "PUT",
        path: "/product-service/{id}",
        handler: handler.updateProductServiceByIdHandler,
        options: {
            auth: "itindosolution_jwt",
        },
    },
    {
        method: "DELETE",
        path: "/product-service/{id}",
        handler: handler.deleteProductServiceByIdHandler,
        options: {
            auth: "itindosolution_jwt",
        },
    },
]

module.exports = routes;