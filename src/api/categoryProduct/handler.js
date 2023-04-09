class CategoryProductHandler {
  constructor({ service, validator }) {
    this._service = service;
    this._validator = validator;

    this.postCategoryProduct = this.postCategoryProduct.bind(this);
  }

  async postCategoryProduct(request) {
    this._validator.validatePostCategoryProductPayload(request.payload);

    const categoryProductId = await this._service.addCategoryProduct(
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

module.exports = CategoryProductHandler;
