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
    method: 'GET',
    path: '/user/admin/data',
    handler: handler.getAdminUserByTokenHandler,
    options: {
      auth: 'itindosolution_jwt',
    },
  },
  {
    method: 'PUT',
    path: '/user/admin',
    handler: handler.putAdminUserByTokenHandler,
    options: {
      auth: 'itindosolution_jwt',
    },
  },
  {
    method: 'PUT',
    path: '/user/admin/password',
    handler: handler.putPasswordAdminUserByTokenHandler,
    options: {
      auth: 'itindosolution_jwt',
    },
  },
  {
    method: 'GET',
    path: '/user/admin',
    handler: handler.getAdminUsersHandler,
    options: {
      auth: 'itindosolution_jwt',
    },
  },
  {
    method: 'GET',
    path: '/user/admin/{userId}',
    handler: handler.getAdminUserByIdHandler,
    options: {
      auth: 'itindosolution_jwt',
    },
  },
  {
    method: 'PUT',
    path: '/user/admin/status/{userId}',
    handler: handler.putStatusAdminUserByIdHandler,
    options: {
      auth: 'itindosolution_jwt',
    },
  },
  {
    method: 'PUT',
    path: '/user/admin/role/{userId}',
    handler: handler.putRoleAdminUserByIdHandler,
    options: {
      auth: 'itindosolution_jwt',
    },
  },
  {
    method: 'PUT',
    path: '/user/admin/password/{userId}',
    handler: handler.resetPassowrdAdminUserByIdHandler,
    options: {
      auth: 'itindosolution_jwt',
    },
  },
];

module.exports = routes;
