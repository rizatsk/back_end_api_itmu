const routes = (handler) => [
  {
    method: "POST",
    path: "/authentications/admin",
    handler: handler.postAuthenticationAdminHandler,
  },
  {
    method: "PUT",
    path: "/authentications/admin",
    handler: handler.putAuthenticationAdminHandler,
  },
  {
    method: "DELETE",
    path: "/authentications/admin",
    handler: handler.deleteAuthenticationAdminHandler,
  },
  {
    method: "GET",
    path: "/authentications/admin",
    handler: handler.getDataUserUseTokenHandler,
    options: {
      auth: "itindosolution_jwt",
    },
  },
];

module.exports = routes;
