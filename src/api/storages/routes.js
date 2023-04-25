const path = require("path");

const routes = (storageImage) => [
  {
    method: "GET",
    path: "/images/{param*}",
    handler: {
      directory: {
        path: path.resolve(storageImage),
      },
    },
  },
];

module.exports = routes;
