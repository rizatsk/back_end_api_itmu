const routes = (handler) => [
    {
        method: "POST",
        path: "/product_test",
        handler: handler.postProductTestHandler,
        options: {
            auth: "itindosolution_jwt",
            payload: {
                allow: "multipart/form-data",
                multipart: true,
                output: "stream",
                maxBytes: 312000, //500kb
                timeout: false, //for no timeout upload
            },
        },
    },
    {
        method: "GET",
        path: "/product_test",
        handler: handler.getProductsTestHandler,
        options: {
            auth: "itindosolution_jwt",
        },
    },
    {
        method: "GET",
        path: "/product_test/{id}",
        handler: handler.getProductsByIdHandler,
        options: {
            auth: "itindosolution_jwt",
        },
    },
    {
        method: "PUT",
        path: "/product_test/{id}",
        handler: handler.putProductByIdHandler,
        options: {
            auth: "itindosolution_jwt",
            payload: {
                allow: "multipart/form-data",
                multipart: true,
                output: "stream",
                maxBytes: 312000, //300kb
                timeout: false, //for no timeout upload
            },
        },
    },
    {
        method: "DELETE",
        path: "/product_test/{id}",
        handler: handler.deleteProductByIdHandler,
        options: {
            auth: "itindosolution_jwt",
        },
    },
];

module.exports = routes;
