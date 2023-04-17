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
}

module.exports = CategoryProductHandler;
