const routes = (handler) => [
  {
    path: "/category_product",
    method: "POST",
    handler: handler.postCategoryProduct,
    options: {
      auth: "itindosolution_jwt",
    },
  },
];

module.exports = routes;
