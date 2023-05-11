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
    options: {
      auth: "itindosolution_jwt",
    },
  },
  {
    path: "/category_product/parent",
    method: "GET",
    handler: handler.getCategoriesParentIdAndNameHandler,
  },
  {
    path: "/category_product/tree",
    method: "GET",
    handler: handler.getCategoriesTreeHandler,
  },
  {
    path: "/category_product/{id}",
    method: "DELETE",
    handler: handler.deleteCategoriesAndChildHandler,
    options: {
      auth: "itindosolution_jwt",
    },
  },
  {
    path: "/category_product/status/{id}",
    method: "PUT",
    handler: handler.updateStatusCategoriesByIdHandler,
    options: {
      auth: "itindosolution_jwt",
    },
  },
  {
    path: "/category_product/{id}",
    method: "PUT",
    handler: handler.updateCategoriesByIdHandler,
    options: {
      auth: "itindosolution_jwt",
    },
  },
  {
    path: "/category_product/{id}",
    method: "GET",
    handler: handler.getCategoryByIdHandler,
    options: {
      auth: "itindosolution_jwt",
    },
  },
];

module.exports = routes;
