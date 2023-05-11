const AuthorizationUser = require("../../../config/authorization.json");
const InvariantError = require("../../exceptions/InvariantError");

class ProductServiceHandler {
  constructor({
    lock,
    service,
    logActivityService,
    authorizationService,
    validator,
  }) {
    this._lock = lock;
    this._lock = lock;
    this._service = service;
    this._logActivityService = logActivityService;
    this._authorizationService = authorizationService;
    this._validator = validator;
    this._authorizationUser = AuthorizationUser["product service"];

    this.postProductServiceHandler = this.postProductServiceHandler.bind(this);
    this.getProductServicesHandler = this.getProductServicesHandler.bind(this);
    this.getProductServiceByIdHandler = this.getProductServiceByIdHandler.bind(
      this
    );
    this.updateProductServiceByIdHandler = this.updateProductServiceByIdHandler.bind(
      this
    );
    this.deleteProductServiceByIdHandler = this.deleteProductServiceByIdHandler.bind(
      this
    );
  }

  async postProductServiceHandler(request) {
    this._validator.validatePostProductServicePayload(request.payload);
    const { id: credentialUserId } = request.auth.credentials;

    await this._lock.acquire("data", async () => {
      await this._authorizationService.checkRoleUser(
        credentialUserId,
        this._authorizationUser["insert product service"]
      );

      const productServiceId = await this._service.addProductService(
        request.payload
      );

      await this._logActivityService.postLogActivity({
        credentialUserId,
        activity: "menambahkan product service",
        refersId: productServiceId,
      });
    });

    return {
      status: "success",
      message: "Berhasil menambahkan product service",
    };
  }

  async getProductServicesHandler(request) {
    const { id: credentialUserId } = request.auth.credentials;
    await this._lock.acquire("data", async () => {
      await this._authorizationService.checkRoleUser(
        credentialUserId,
        this._authorizationUser['get product service']
      );
    });

    const { page, limit, search_query } = request.query;

    await this._lock.acquire("data", async () => {
      await this._authorizationService.checkRoleUser(
        credentialUserId,
        this._authorizationUser["get product service"]
      );
    });

    const search = search_query ? search_query : "";
    const totalData = parseInt(
      await this._service.getCountProductServices(search)
    );
    const limitPage = limit || 10;
    const pages = parseInt(page) || 1;
    const totalPage = Math.ceil(totalData / limitPage);
    const offset = (pages - 1) * limitPage;
    const productServices = await this._service.getProductServices({
      search,
      limit: limitPage,
      offset,
    });

    return {
      status: "success",
      data: {
        productServices,
      },
      totalData,
      totalPage,
      nextPage: pages + 1,
      previousPage: pages - 1,
    };
  }

  async getProductServiceByIdHandler(request) {
    const { id: credentialUserId } = request.auth.credentials;
    await this._lock.acquire("data", async () => {
      await this._authorizationService.checkRoleUser(
        credentialUserId,
        this._authorizationUser['update product service']
      );
    });

    const { id: productServiceId } = request.params;

    await this._lock.acquire("data", async () => {
      await this._authorizationService.checkRoleUser(
        credentialUserId,
        this._authorizationUser["update product service"]
      );
    });

    const productService = await this._service.getProductServiceById(
      productServiceId
    );

    return {
      status: "success",
      data: {
        productService,
      },
    };
  }

  async updateProductServiceByIdHandler(request) {
    this._validator.validatePostProductServicePayload(request.payload);

    const { id } = request.params;
    request.payload.productServiceId = id;

    const { id: credentialUserId } = request.auth.credentials;
    await this._lock.acquire("data", async () => {
      await this._authorizationService.checkRoleUser(
        credentialUserId,
        this._authorizationUser["update product service"]
      );

      await this._service.putProductServiceById(request.payload);

      await this._logActivityService.postLogActivity({
        credentialUserId,
        activity: "merubah product services",
        refersId: id,
      });
    });

    return {
      status: "success",
      message: "Berhasil update product service",
    };
  }

  async deleteProductServiceByIdHandler(request) {
    const { id: productServiceId } = request.params;

    const { id: credentialUserId } = request.auth.credentials;
    await this._lock.acquire("data", async () => {
      await this._authorizationService.checkRoleUser(
        credentialUserId,
        this._authorizationUser["delete product service"]
      );

      await this._service.deleteProductServiceById(productServiceId);

      await this._logActivityService.postLogActivity({
        credentialUserId,
        activity: "menghapus product service",
        refersId: productServiceId,
      });
    });

    return {
      status: "success",
      message: "Berhasil menghapus product service",
    };
  }
}

module.exports = ProductServiceHandler;
