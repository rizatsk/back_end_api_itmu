const routes = (handler) => [
  {
    method: 'POST',
    path: '/user/admin',
    handler: handler.postRegisterAdminUserHandler,
    options: {
      auth: 'itindosolution_jwt',
    },
  },
  {
    method: 'PUT',
    path: '/user/admin',
    handler: handler.putAdminUserByIdHandler,
    options: {
      auth: 'itindosolution_jwt',
    },
  },
  {
    method: 'PUT',
    path: '/user/admin/password',
    handler: handler.putPasswordAdminUserHandler,
    options: {
      auth: 'itindosolution_jwt',
    },
  },
  {
    method: 'GET',
    path: '/user/admin',
    handler: handler.getAdminUserHandler,
    options: {
      auth: 'itindosolution_jwt',
    },
  },
  {
    method: 'GET',
    path: '/user/admin/{id}',
    handler: handler.getAdminUserByIdHandler,
    options: {
      auth: 'itindosolution_jwt',
    },
  },
  {
    method: 'PUT',
    path: '/user/admin/status',
    handler: handler.putStatusAdminUserByIdHandler,
    options: {
      auth: 'itindosolution_jwt',
    },
  },
];

module.exports = routes;
