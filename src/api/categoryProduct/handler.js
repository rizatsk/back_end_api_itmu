class CategoryProductHandler {
  constructor({ service, validator }) {
    this._service = service;
    this._validator = validator;
  }

  async postCategoryProduct(request) {
    this._validator.validatePostCategoryProductPayload(request.payload);

    const categoryProductId = await this._service.addCategoriesProduct(
      request.payload
    );

    return {
      status: "success",
      data: {
        categoryProductId,
      },
    };
  }
}
