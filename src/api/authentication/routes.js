const routes = (handler) => [
  {
    method: 'POST',
    path: '/authentications/admin',
    handler: handler.postAuthenticationAdminHandler,
  },
  {
    method: 'PUT',
    path: '/authentications/admin',
    handler: handler.putAuthenticationAdminHandler,
  },
  {
    method: 'DELETE',
    path: '/authentications/admin',
    handler: handler.deleteAuthenticationAdminHandler,
  },
];

module.exports = routes;
