const routes = (handler) => [
  {
    method: "POST",
    path: "/products",
    handler: handler.postProductHandler,
    options: {
      auth: "itindosolution_jwt",
      payload: {
        allow: "multipart/form-data",
        multipart: true,
        output: "stream",
        maxBytes: 512000, //500kb
        timeout: false, //for no timeout upload
      },
    },
  },
  {
    method: "GET",
    path: "/products",
    handler: handler.getProductsHandler,
  },
  {
    method: "GET",
    path: "/products/{id}",
    handler: handler.getProductsByIdHandler,
  },
  {
    method: "PUT",
    path: "/products/{id}",
    handler: handler.putProductsByIdHandler,
    options: {
      auth: "itindosolution_jwt",
    },
  },
  {
    method: "PUT",
    path: "/products/status/{id}",
    handler: handler.putStatusProductsByIdHandler,
    options: {
      auth: "itindosolution_jwt",
    },
  },
  {
    method: "PUT",
    path: "/products/images/{id}",
    handler: handler.putImageProductsHandler,
    options: {
      auth: "itindosolution_jwt",
      payload: {
        allow: "multipart/form-data",
        multipart: true,
        output: "stream",
        maxBytes: 512000, //500kb
        timeout: false, //for no timeout upload
      },
    },
  },
  {
    method: "DELETE",
    path: "/products/{productId}",
    handler: handler.deleteProductByIdHandler,
    options: {
      auth: "itindosolution_jwt",
    },
  },
];

module.exports = routes;
