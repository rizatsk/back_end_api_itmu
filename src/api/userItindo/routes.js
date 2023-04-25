const routes = (handler) => [
  {
    method: "POST",
    path: "/user",
    handler: handler.postUserHandler,
  },
  {
    method: "GET",
    path: "/user/data",
    handler: handler.getUserByTokenHandler,
    options: {
      auth: "itindosolution_user_jwt",
    },
  },
  {
    method: "PUT",
    path: "/user/{parameter}/{userId}",
    handler: handler.updateDataUserByIdHandler,
    options: {
      auth: "itindosolution_user_jwt",
    },
  },
];

module.exports = routes;
