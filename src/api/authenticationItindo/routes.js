const routes = (handler) => [
  {
    method: "POST",
    path: "/authentications",
    handler: handler.postAuthenticationAdminHandler,
  },
  {
    method: "PUT",
    path: "/authentications",
    handler: handler.putAuthenticationAdminHandler,
  },
  {
    method: "DELETE",
    path: "/authentications",
    handler: handler.deleteAuthenticationAdminHandler,
  },
];

module.exports = routes;
