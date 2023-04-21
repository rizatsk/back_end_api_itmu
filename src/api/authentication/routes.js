const routes = (handler) => [
  {
    method: "POST",
    path: "/authentication/admin",
    handler: handler.postAuthenticationAdminHandler,
  },
  {
    method: "PUT",
    path: "/authentication/admin",
    handler: handler.putAuthenticationAdminHandler,
  },
  {
    method: "DELETE",
    path: "/authentication/admin",
    handler: handler.deleteAuthenticationAdminHandler,
  },
  {
    method: "GET",
    path: "/authentication/admin",
    handler: handler.getDataUserUseTokenHandler,
    options: {
      auth: "itindosolution_jwt",
    },
  },
  {
    method: "POST",
    path: "/authentication/user",
    handler: handler.postAuthenticationUserHandler,
  },
  {
    method: "PUT",
    path: "/authentication/user",
    handler: handler.putAuthenticationUserHandler,
  },
  {
    method: "DELETE",
    path: "/authentication/user",
    handler: handler.deleteAuthenticationUserHandler,
  },
];

module.exports = routes;
