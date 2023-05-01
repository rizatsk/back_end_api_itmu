const routes = (handler) => [
  {
    method: "POST",
    path: "/product",
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
    path: "/product",
    handler: handler.getProductsHandler,
  },
  {
    method: "GET",
    path: "/product/{id}",
    handler: handler.getProductsByIdHandler,
  },
  {
    method: "PUT",
    path: "/product/{id}",
    handler: handler.putProductsByIdHandler,
    options: {
      auth: "itindosolution_jwt",
    },
  },
  {
    method: "PUT",
    path: "/product/status/{id}",
    handler: handler.putStatusProductsByIdHandler,
    options: {
      auth: "itindosolution_jwt",
    },
  },
  {
    method: "PUT",
    path: "/product/images/{id}",
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
    path: "/product/{productId}",
    handler: handler.deleteProductByIdHandler,
    options: {
      auth: "itindosolution_jwt",
    },
  },
  {
    method: "PUT",
    path: "/product/price-promotion/{productId}",
    handler: handler.putPricePromotionProductByIdHandler,
    options: {
      auth: "itindosolution_jwt",
    },
  },
  {
    method: "GET",
    path: "/product/type/{param}",
    handler: handler.getProductsSaleOrServiceHandler,
  },
];

module.exports = routes;
