const routes = (handler) => [
  {
    method: 'POST',
    path: '/package/service',
    handler: handler.postPackageServiceHandler,
    options: {
      auth: 'itindosolution_jwt',
    },
  },
  {
    method: 'GET',
    path: '/package/service',
    handler: handler.getPackageServiceHandler,
  },
  {
    method: 'GET',
    path: '/package/service/{id}',
    handler: handler.getPackageServiceByIdHandler,
  },
  {
    method: 'PUT',
    path: '/package/service',
    handler: handler.putPackgeServiceByIdHandler,
    options: {
      auth: 'itindosolution_jwt',
    },
  },
  {
    method: 'PUT',
    path: '/package/service/status',
    handler: handler.putStatusPackageServiceByIdHandler,
    options: {
      auth: 'itindosolution_jwt',
    },
  },
];

module.exports = routes;
