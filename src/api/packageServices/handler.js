class PackageServiceHandler {
  constructor(service, logActivityService, validator) {
    this._service = service;
    this._logActivityService = logActivityService;
    this._validator = validator;

    this.postPackageServiceHandler = this.postPackageServiceHandler.bind(this);
    this.getPackageServiceByIdHandler =
      this.getPackageServiceByIdHandler.bind(this);
    this.getPackageServiceHandler = this.getPackageServiceHandler.bind(this);
    this.putPackgeServiceByIdHandler =
      this.putPackgeServiceByIdHandler.bind(this);
    this.putStatusPackageServiceByIdHandler =
      this.putStatusPackageServiceByIdHandler.bind(this);
  }

  async postPackageServiceHandler(request, h) {
    await this._validator.validatePostPackageServicePayload(request.payload);

    const { id: credentialUserId } = request.auth.credentials;
    const { name, products, price, typeService, description } = request.payload;

    const packageServiceId = await this._service.addPackageService({
      credentialUserId,
      name,
      products,
      price,
      typeService,
      description,
    });

    await this._logActivityService.postLogActivity({
      credentialUserId,
      activity: "menambahkan package service",
      refersId: packageServiceId,
    });

    return {
      status: "success",
      message: "Package service berhasil ditambahkan",
    };
  }

  async getPackageServiceByIdHandler(request, h) {
    const { id: packageServiceId } = request.params;

    const packageService = await this._service.getPackageServiceById(
      packageServiceId
    );

    return {
      status: "success",
      data: {
        packageService,
      },
    };
  }

  async getPackageServiceHandler(request) {
    const { page, limit } = request.query;

    const totalData = parseInt(await this._service.getCountPackageServices());
    const pages = parseInt(page) || 1;
    const limitPage = parseInt(limit) || 10;
    const totalPages = Math.ceil(totalData / pages);
    const offset = (pages - 1) * totalData;
    const packageServices = await this._service.getPackageServices(
      limitPage,
      offset
    );

    return {
      status: "success",
      data: {
        packageServices,
      },
      totalData,
      totalPages,
      nextPage: pages + 1,
      previousPage: pages - 1,
    };
  }

  async putPackgeServiceByIdHandler(request, h) {
    this._validator.validatePutPackageServiceByIdPayload(request.payload);

    const { id: credentialUserId } = request.auth.credentials;
    const {
      packageServiceId,
      name,
      products,
      price,
      typeService,
      description,
    } = request.payload;

    await this._service.editPackageServicesById({
      credentialUserId,
      packageServiceId,
      name,
      products,
      price,
      typeService,
      description,
    });

    await this._logActivityService.postLogActivity({
      credentialUserId,
      activity: "update data package service",
      refersId: packageServiceId,
    });

    return {
      status: "success",
      message: "Berhasil update data package service",
    };
  }

  async putStatusPackageServiceByIdHandler(request, h) {
    this._validator.validatePutStatusPackageServiceByIdPayload(request.payload);

    const { id: credentialUserId } = request.auth.credentials;
    const { packageServiceId, status } = request.payload;

    await this._service.editStatusPackageServiceById({
      credentialUserId,
      packageServiceId,
      status,
    });

    await this._logActivityService.postLogActivity({
      credentialUserId,
      activity: "update status package service",
      refersId: packageServiceId,
    });

    return {
      status: "success",
      message: "Berhasil update status package service",
    };
  }
}

module.exports = PackageServiceHandler;
