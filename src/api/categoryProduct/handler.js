class CategoryProductHandler {
  constructor({ service, validator }) {
    this._service = service;
    this._validator = validator;

    this.postCategoryProductHandler = this.postCategoryProductHandler.bind(
      this
    );
    this.getCategoriesProductHandler = this.getCategoriesProductHandler.bind(
      this
    );
    this.getCategoriesIdAndNameHandler = this.getCategoriesIdAndNameHandler.bind(
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
    const { page, limit, search_query } = request.query;

    const search = search_query ? search_query : "";
    const totalData = parseInt(await this._service.getCountCategories());
    const limitPage = limit || 10;
    const pages = parseInt(page) || 1;
    const totalPage = Math.ceil(totalData / limitPage);
    const offset = (pages - 1) * limitPage;
    const categories = await this._service.getCategories({
      limit,
      offset,
    });
    for (let i = 0; i < categories.length; i++) {
      categories[i].parent = await this._service.getCategoriesParentHandler(
        categories[i].parent_id,
        categories[i].name
      ); // Menambahkan 3 ke nilai kolom 'age'
    }

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

  async getCategoriesIdAndNameHandler() {
    const categories = await this._service.getCategoriesIdAndName();

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

    await this._service.deleteCategoryAndChild(id);

    return {
      status: 'success',
      message: 'Berhasil menghapus category'
    }
  }

}

module.exports = CategoryProductHandler;
