const InvariantError = require("../../exceptions/InvariantError");

class CategoryProductHandler {
  constructor({ service, validator, productService }) {
    this._service = service;
    this._validator = validator;
    this._productService = productService

    this.postCategoryProductHandler = this.postCategoryProductHandler.bind(
      this
    );
    this.getCategoriesProductHandler = this.getCategoriesProductHandler.bind(
      this
    );
    this.getCategoriesParentIdAndNameHandler = this.getCategoriesParentIdAndNameHandler.bind(
      this
    );
    this.getCategoriesTreeHandler = this.getCategoriesTreeHandler.bind(this)
    this.deleteCategoriesAndChildHandler = this.deleteCategoriesAndChildHandler.bind(this);
    this.updateStatusCategoriesByIdHandler = this.updateStatusCategoriesByIdHandler.bind(this);
    this.getCategoryByIdHandler = this.getCategoryByIdHandler.bind(this);
    this.updateCategoriesByIdHandler = this.updateCategoriesByIdHandler.bind(this);
  }

  async postCategoryProductHandler(request) {
    this._validator.validatePostCategoryProductPayload(request.payload);

    const { id: credentialUserId } = request.auth.credentials;
    request.payload.credentialUserId = credentialUserId;
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

  async getCategoriesProductHandler(request) {
    const { page, limit, search } = request.query;

    const totalData = parseInt(await this._service.getCountCategories(search));
    const limitPage = limit || 10;
    const pages = parseInt(page) || 1;
    const totalPage = Math.ceil(totalData / limitPage);
    const offset = (pages - 1) * limitPage;
    const categories = await this._service.getCategories({
      limit,
      offset,
      search
    });

    return {
      status: "success",
      data: {
        categories,
      },
      totalData,
      totalPage,
      nextPage: pages + 1,
      previousPage: pages - 1,
    };
  }

  async getCategoriesParentIdAndNameHandler() {
    const categories = await this._service.getCategoriesParentIdAndName();

    return {
      status: "success",
      data: {
        categories,
      },
    };
  }

  async getCategoriesTreeHandler() {
    const categories = await this._service.getCategoriesTree();

    return {
      status: "success",
      data: {
        categories,
      },
    };
  }

  async getCategoryByIdHandler(request) {
    const { id } = request.params;
    const category = await this._service.getCategoryById(id);

    return {
      status: 'success',
      data: { category }
    }
  }

  async updateStatusCategoriesByIdHandler(request) {
    this._validator.validatePutStatusCategoryProductPayload(request.payload);

    const { id } = request.params;
    const { status } = request.payload;

    await this._service.updateStatusCategoryById(id, status);

    return {
      status: 'success',
      message: 'Berhasil merubah status category'
    }
  }

  async updateCategoriesByIdHandler(request) {
    this._validator.validatePostCategoryProductPayload(request.payload)

    request.payload.categoryId = request.params.id;

    await this._service.updateCategoryById(request.payload);

    return {
      status: 'success',
      message: 'Berhasil merubah data category'
    }
  }

  async deleteCategoriesAndChildHandler(request) {
    const { id } = request.params;

    await this._productService.checkProductByCategoryId(id);
    await this._service.deleteCategoryAndChild(id);

    return {
      status: 'success',
      message: 'Berhasil menghapus category'
    }
  }

}

module.exports = CategoryProductHandler;
