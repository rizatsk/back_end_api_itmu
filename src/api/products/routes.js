const routes = (handler) => [
  {
    method: 'POST',
    path: '/products',
    handler: handler.postProductHandler,
    options: {
      auth: 'itindosolution_jwt',
    },
  },
  {
    method: 'GET',
    path: '/products',
    handler: handler.getProductsHandler,
  },
  {
    method: 'GET',
    path: '/products/{id}',
    handler: handler.getProductsByIdHandler,
  },
  {
    method: 'PUT',
    path: '/products',
    handler: handler.putProductsByIdHandler,
    options: {
      auth: 'itindosolution_jwt',
    },
  },
  {
    method: 'PUT',
    path: '/products/status',
    handler: handler.putStatusProductsByIdHandler,
    options: {
      auth: 'itindosolution_jwt',
    },
  },
];

module.exports = routes;
