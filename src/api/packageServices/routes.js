const routes = (handler) => [
  {
    method: "POST",
    path: "/package/service",
    handler: handler.postPackageServiceHandler,
    options: {
      auth: "itindosolution_jwt",
      payload: {
        allow: "multipart/form-data",
        multipart: true,
        output: "stream",
        maxBytes: 512000, //500kb
      },
    },
  },
  {
    method: "GET",
    path: "/package/service",
    handler: handler.getPackageServiceHandler,
  },
  {
    method: "GET",
    path: "/package/service/{id}",
    handler: handler.getPackageServiceByIdHandler,
  },
  {
    method: "PUT",
    path: "/package/service/{id}",
    handler: handler.putPackgeServiceByIdHandler,
    options: {
      auth: "itindosolution_jwt",
    },
  },
  {
    method: "PUT",
    path: "/package/service/status/{id}",
    handler: handler.putStatusPackageServiceByIdHandler,
    options: {
      auth: "itindosolution_jwt",
    },
  },
  {
    method: "PUT",
    path: "/package/images/{id}",
    handler: handler.putImagePackagesHandler,
    options: {
      auth: "itindosolution_jwt",
      payload: {
        allow: "multipart/form-data",
        multipart: true,
        output: "stream",
        maxBytes: 512000, //5mb
      },
    },
  },
];

module.exports = routes;
