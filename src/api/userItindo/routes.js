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
];

module.exports = routes;
