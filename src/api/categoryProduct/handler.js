const AuthorizationUser = require('../../../config/authorization.json');

class CategoryProductHandler {
  constructor({ lock,
    service,
    authorizationService,
    validator,
    productService,
    logActivityService,
  }) {
    this._lock = lock;
    this._service = service;
    this._authorizationService = authorizationService;
    this._validator = validator;
    this._productService = productService;
    this._logActivityService = logActivityService;
    this._authorizationUser = AuthorizationUser['category product'];

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

    const categoryProductId = await this._lock.acquire("data", async () => {
      await this._authorizationService.checkRoleUser(
        credentialUserId,
        this._authorizationUser['insert catgory product']
      );


      const categoryProductId = await this._service.addCategoryProduct(
        request.payload
      );

      await this._logActivityService.postLogActivity({
        credentialUserId,
        activity: "menambahkan category product",
        refersId: categoryProductId,
      });

      return categoryProductId;
    });

    return {
      status: "success",
      message: 'Berhasil menambahkan category product',
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
      limit: limitPage,
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

    const { id: credentialUserId } = request.auth.credentials;
    const { id } = request.params;
    const { status } = request.payload;

    await this._lock.acquire("data", async () => {
      await this._authorizationService.checkRoleUser(
        credentialUserId,
        this._authorizationUser['update status category product']
      );

      await this._service.updateStatusCategoryById(id, status);

      await this._logActivityService.postLogActivity({
        credentialUserId,
        activity: "merubah status category product",
        refersId: id,
      });
    });

    return {
      status: 'success',
      message: 'Berhasil merubah status category'
    }
  }

  async updateCategoriesByIdHandler(request) {
    this._validator.validatePostCategoryProductPayload(request.payload)

    const { id: credentialUserId } = request.auth.credentials;
    request.payload.categoryId = request.params.id;

    await this._lock.acquire("data", async () => {
      await this._authorizationService.checkRoleUser(
        credentialUserId,
        this._authorizationUser['update category product']
      );

      await this._service.updateCategoryById(request.payload);

      await this._logActivityService.postLogActivity({
        credentialUserId,
        activity: "merubah data category product",
        refersId: request.params.id,
      });
    });

    return {
      status: 'success',
      message: 'Berhasil merubah data category'
    }
  }

  async deleteCategoriesAndChildHandler(request) {
    const { id } = request.params;
    const { id: credentialUserId } = request.auth.credentials;

    await this._lock.acquire("data", async () => {
      await this._authorizationService.checkRoleUser(
        credentialUserId,
        this._authorizationUser['update category product']
      );

      await this._productService.checkProductByCategoryId(id);
      await this._service.deleteCategoryAndChild(id);

      await this._logActivityService.postLogActivity({
        credentialUserId,
        activity: "menghapus data category product",
        refersId: id,
      });
    });

    return {
      status: 'success',
      message: 'Berhasil menghapus category'
    }
  }

}

module.exports = CategoryProductHandler;
