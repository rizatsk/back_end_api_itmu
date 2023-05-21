const path = require("path");

const routes = ({ storageImage, storagePublic }) => [
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
    method: "GET",
    path: "/{param*}",
    handler: {
      directory: {
        path: path.resolve(storagePublic),
      },
    },
  },
];

module.exports = routes;
