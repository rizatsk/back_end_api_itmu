const AuthorizationUser = require("../../../config/authorization.json");
const InvariantError = require("../../exceptions/InvariantError");

class SetupServiceHandler {
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
    this._authorizationUser = AuthorizationUser["setup service"];

    this.postSetupServiceHandler = this.postSetupServiceHandler.bind(this);
    this.getSetupServicesHandler = this.getSetupServicesHandler.bind(this);
    this.getSetupServiceByIdHandler = this.getSetupServiceByIdHandler.bind(
      this
    );
    this.updateSetupServiceByIdHandler = this.updateSetupServiceByIdHandler.bind(
      this
    );
    this.deleteSetupServiceByIdHandler = this.deleteSetupServiceByIdHandler.bind(
      this
    );
  }

  async postSetupServiceHandler(request) {
    this._validator.validatePostSetupServicePayload(request.payload);
    const { id: credentialUserId } = request.auth.credentials;

    await this._lock.acquire("data", async () => {
      await this._authorizationService.checkRoleUser(
        credentialUserId,
        this._authorizationUser["insert setup service"]
      );

      const SetupServiceId = await this._service.addSetupService(
        request.payload
      );

      await this._logActivityService.postLogActivity({
        credentialUserId,
        activity: "menambahkan setup service",
        refersId: SetupServiceId,
      });
    });

    return {
      status: "success",
      message: "Berhasil menambahkan setup service",
    };
  }

  async getSetupServicesHandler(request) {
    const { id: credentialUserId } = request.auth.credentials;
    await this._lock.acquire("data", async () => {
      await this._authorizationService.checkRoleUser(
        credentialUserId,
        this._authorizationUser['get setup service']
      );
    });

    const { page, limit, search_query } = request.query;
    const search = search_query ? search_query : "";
    const totalData = parseInt(
      await this._service.getCountSetupServices(search)
    );
    const limitPage = limit || 10;
    const pages = parseInt(page) || 1;
    const totalPage = Math.ceil(totalData / limitPage);
    const offset = (pages - 1) * limitPage;
    const setupServices = await this._service.getSetupServices({
      search,
      limit: limitPage,
      offset,
    });

    return {
      status: "success",
      data: {
        setupServices,
      },
      totalData,
      totalPage,
      nextPage: pages + 1,
      previousPage: pages - 1,
    };
  }

  async getSetupServiceByIdHandler(request) {
    const { id: credentialUserId } = request.auth.credentials;

    await this._lock.acquire("data", async () => {
      await this._authorizationService.checkRoleUser(
        credentialUserId,
        this._authorizationUser['update setup service']
      );
    });

    const { id: setupServiceId } = request.params;

    const setupService = await this._service.getSetupServiceById(
      setupServiceId
    );

    return {
      status: "success",
      data: {
        setupService,
      },
    };
  }

  async updateSetupServiceByIdHandler(request) {
    this._validator.validatePostSetupServicePayload(request.payload);

    const { id } = request.params;
    request.payload.setupServiceId = id;

    const { id: credentialUserId } = request.auth.credentials;
    await this._lock.acquire("data", async () => {
      await this._authorizationService.checkRoleUser(
        credentialUserId,
        this._authorizationUser["update setup service"]
      );

      await this._service.putSetupServiceById(request.payload);

      await this._logActivityService.postLogActivity({
        credentialUserId,
        activity: "merubah setup services",
        refersId: id,
      });
    });

    return {
      status: "success",
      message: "Berhasil update setup service",
    };
  }

  async deleteSetupServiceByIdHandler(request) {
    const { id: setupServiceId } = request.params;

    const { id: credentialUserId } = request.auth.credentials;
    await this._lock.acquire("data", async () => {
      await this._authorizationService.checkRoleUser(
        credentialUserId,
        this._authorizationUser["delete setup service"]
      );

      await this._service.deleteSetupServiceById(setupServiceId);

      await this._logActivityService.postLogActivity({
        credentialUserId,
        activity: "menghapus setup service",
        refersId: setupServiceId,
      });
    });

    return {
      status: "success",
      message: "Berhasil menghapus setup service",
    };
  }
}

module.exports = SetupServiceHandler;
