const routes = (handler) => [
  {
    method: "POST",
    path: "/user",
    handler: handler.postUserHandler,
  },
  {
    method: "GET",
    path: "/user/validation-email/{token}",
    handler: handler.verificationEmailUserByTokenHandler,
  },
  {
    method: "GET",
    path: "/user/request-validation-email/{email}",
    handler: handler.requestVerificationEmailUserHandler,
  },
  {
    method: "GET",
    path: "/user/request-forget-password/{email}",
    handler: handler.requestForgetPasswordUserHandler,
  },
  {
    method: "GET",
    path: "/user/forget-password/{token}",
    handler: handler.pageForgetPasswordUserHandler,
  },
  {
    method: "PUT",
    path: "/user/forget-password",
    handler: handler.putForgetPasswordUserByTokenHandler,
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
  // CMS
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
