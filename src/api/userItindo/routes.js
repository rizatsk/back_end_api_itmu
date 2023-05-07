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
    path: "/user/data/{parameter}",
    handler: handler.updateDataUserByTokenHandler,
    options: {
      auth: "itindosolution_user_jwt",
    },
  },
  {
    method: "PUT",
    path: "/user/password",
    handler: handler.updatePasswordUserByTokenHandler,
    options: {
      auth: "itindosolution_user_jwt",
    },
  },
  {
    method: "GET",
    path: "/user",
    handler: handler.getUsersHandler,
    options: {
      auth: "itindosolution_jwt",
    },
  },
  {
    method: "PUT",
    path: "/user/status/{id}",
    handler: handler.updateStatusUserByIdHandler,
    options: {
      auth: "itindosolution_jwt",
    },
  },
];

module.exports = routes;
