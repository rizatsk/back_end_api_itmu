const path = require("path");

const routes = (handler, storageImage) => [
  {
    method: "POST",
    path: "/package/service/images/{id}",
    handler: handler.postUploadImagePackageServiceHandler,
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
  {
    method: "GET",
    path: "/images/{param*}",
    handler: {
      directory: {
        path: path.resolve(storageImage),
      },
    },
  },
  {
    method: "DELETE",
    path: "/package/service/images/{id}",
    handler: handler.deleteImagePackageServiceHandler,
    options: {
      auth: "itindosolution_jwt",
    },
  },
  {
    method: "POST",
    path: "/products/images/{id}",
    handler: handler.postUploadImageProductsHandler,
    options: {
      auth: "itindosolution_jwt",
      payload: {
        allow: "multipart/form-data",
        multipart: true,
        output: "stream",
        maxBytes: 512000,
      },
    },
  },
  {
    method: "DELETE",
    path: "/products/images/{id}",
    handler: handler.deleteImageProductsHandler,
    options: {
      auth: "itindosolution_jwt",
    },
  },
];

module.exports = routes;
