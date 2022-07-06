class UploadsHandler {
  constructor({service, packageServiceService, productsService, logActivityService, validator}) {
    this._service = service;
    this._packageService = packageServiceService;
    this._productsService = productsService;
    this._logActivityService = logActivityService;
    this._validator = validator;

    this.postUploadImagePackageServiceHandler = this.postUploadImagePackageServiceHandler.bind(this);
    this.deleteImagePackageServiceHandler = this.deleteImagePackageServiceHandler.bind(this);

    this.postUploadImageProductsHandler = this.postUploadImageProductsHandler.bind(this);
    this.deleteImageProductsHandler = this.deleteImageProductsHandler.bind(this);
  }

  async postUploadImagePackageServiceHandler(request, h) {
    const {image} = request.payload;
    this._validator.validateImageHeaders(image.hapi.headers);

    const {id: packageServiceId} = request.params;
    const {id: credentialUserId} = request.auth.credentials;
    const folder = 'packageServices';

    const previousFilename = await this._packageService.checkPackageServiceId(packageServiceId);
    if (previousFilename != null) await this._service.deleteFile(previousFilename, folder);

    const filename = await this._service.writeFile(image, image.hapi, folder);
    const imageUrl = `http://${process.env.HOST}:${process.env.PORT}/images/${folder}/${filename}`;

    await this._packageService.addImagePackageService({credentialUserId, packageServiceId, imageUrl});

    await this._logActivityService.postLogActivity({credentialUserId, activity: 'upload image package service', refersId: packageServiceId});

    const response = h.response({
      status: 'success',
      message: 'Gambar berhasil diunggah',
    });
    response.code(201);
    return response;
  }

  async deleteImagePackageServiceHandler(request, h) {
    await this._validator.validateDeleteImagePayload(request.payload);

    const {id: credentialUserId} = request.auth.credentials;
    const {id: packageServiceId} = request.params;
    const {fileName} = request.payload;
    const folder = 'packageServices';

    await this._packageService.checkPackageServiceId(packageServiceId);

    await this._service.deleteFile(fileName, folder);

    await this._packageService.deleteImagePackgeService(credentialUserId, packageServiceId);

    await this._logActivityService.postLogActivity({credentialUserId, activity: 'delete image package service', refersId: packageServiceId});

    return {
      status: 'success',
      message: 'Gambar berhasil dihapus',
    };
  }

  async postUploadImageProductsHandler(request, h) {
    const {image} = request.payload;
    this._validator.validateImageHeaders(image.hapi.headers);

    const {id: productId} = request.params;
    const {id: credentialUserId} = request.auth.credentials;
    const folder = 'products';

    const previousFilename = await this._productsService.checkProductId(productId);
    if (previousFilename != null) await this._service.deleteFile(previousFilename, folder);

    const filename = await this._service.writeFile(image, image.hapi, folder);
    const imageUrl = `http://${process.env.HOST}:${process.env.PORT}/images/${folder}/${filename}`;

    await this._productsService.addImageProduct({credentialUserId, productId, imageUrl});

    await this._logActivityService.postLogActivity({credentialUserId, activity: 'upload image products', refersId: productId});

    const response = h.response({
      status: 'success',
      message: 'Gambar berhasil diunggah',
    });
    response.code(201);
    return response;
  }

  async deleteImageProductsHandler(request, h) {
    await this._validator.validateDeleteImagePayload(request.payload);

    const {id: credentialUserId} = request.auth.credentials;
    const {id: productId} = request.params;
    const {fileName} = request.payload;
    const folder = 'products';

    await this._productsService.checkProductId(productId);

    await this._service.deleteFile(fileName, folder);

    await this._productsService.deleteImageProduct(credentialUserId, productId);

    await this._logActivityService.postLogActivity({credentialUserId, activity: 'delete image product', refersId: productId});

    return {
      status: 'success',
      message: 'Gambar berhasil dihapus',
    };
  }
}

module.exports = UploadsHandler;
