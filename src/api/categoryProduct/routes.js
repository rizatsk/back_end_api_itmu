const routes = (handler) => [
  {
    path: "/category_product",
    method: "POST",
    handler: handler.postCategoryProductHandler,
    options: {
      auth: "itindosolution_jwt",
    },
  },
  {
    path: "/category_product",
    method: "GET",
    handler: handler.getCategoriesProductHandler,
  },
  {
    path: "/category_product/parent",
    method: "GET",
    handler: handler.getCategoriesIdAndNameHandler,
  },
];

module.exports = routes;
