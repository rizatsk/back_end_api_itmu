class PackageServiceHandler {
  constructor({ service, logActivityService, validator, storageService }) {
    this._service = service;
    this._logActivityService = logActivityService;
    this._validator = validator;
    this._storageService = storageService;

    this.postPackageServiceHandler = this.postPackageServiceHandler.bind(this);
    this.getPackageServiceByIdHandler =
      this.getPackageServiceByIdHandler.bind(this);
    this.getPackageServiceHandler = this.getPackageServiceHandler.bind(this);
    this.putPackgeServiceByIdHandler =
      this.putPackgeServiceByIdHandler.bind(this);
    this.putStatusPackageServiceByIdHandler =
      this.putStatusPackageServiceByIdHandler.bind(this);
    this.putImagePackagesHandler = this.putImagePackagesHandler.bind(this);
  }

  async postPackageServiceHandler(request, h) {
    await this._validator.validatePostPackageServicePayload(request.payload);

    const { id: credentialUserId } = request.auth.credentials;
    const { name, products, price, typeService, description, image } =
      request.payload;

    // push image in array
    let images = [];
    // check image hanya 1 file
    if (!image.length) {
      images.push(image);
    } else {
      // image hanya lebih 1 dari file
      images = image;
    }

    // validation file image
    for (const img of images) {
      this._validator.validateImageHeaderSchema(img.hapi.headers);
    }

    const packageServiceId = await this._service.addPackageService({
      credentialUserId,
      name,
      products: JSON.parse(products),
      price,
      typeService,
      description,
    });

    const folder = "packages";
    for (const img of images) {
      if (img.hapi.filename) {
        // save image in server
        const filename = await this._storageService.writeFile(
          img,
          img.hapi,
          folder
        );
        let linkImage = `/images/${folder}/${filename}`;
        // save link image in db
        await this._service.addImagePackageService(packageServiceId, linkImage);
      }
    }

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

  async getPackageServiceHandler(request) {
    const { page, limit, search_query } = request.query;

    const search = search_query ? search_query : "";
    const totalData = parseInt(
      await this._service.getCountPackageServices(search)
    );
    const pages = parseInt(page) || 1;
    const limitPage = parseInt(limit) || 10;
    const totalPages = Math.ceil(totalData / pages);
    const offset = (pages - 1) * totalData;
    const packageServices = await this._service.getPackageServices({
      search,
      limit: limitPage,
      offset,
    });

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

  async getPackageServiceByIdHandler(request, h) {
    const { id: packageServiceId } = request.params;

    const packageService = await this._service.getPackageServiceById(
      packageServiceId
    );
    const imagePackage = await this._service.getImagePackages(packageServiceId);

    return {
      status: "success",
      data: {
        packageService,
        imagePackage,
      },
    };
  }

  async putPackgeServiceByIdHandler(request, h) {
    this._validator.validatePutPackageServiceByIdPayload(request.payload);

    const { id: credentialUserId } = request.auth.credentials;
    const { id: packageServiceId } = request.params;
    const { name, products, price, typeService, description } = request.payload;

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
    const { id: packageServiceId } = request.params;
    const { status } = request.payload;

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

  async putImagePackagesHandler(request) {
    await this._validator.validatePutIamgesPackagePayload(request.payload);

    const { id: credentialUserId } = request.auth.credentials;
    const { id: packageId } = request.params;
    const { deleteImages, postImages } = request.payload;

    const folder = "packages";
    if (deleteImages) {
      const deleteImagesArray = JSON.parse(deleteImages);
      for (let deleteImage of deleteImagesArray) {
        let imagesName = await this._service.getImagePackageName(deleteImage);
        imagesName = imagesName.split("/");
        imagesName = imagesName[imagesName.length - 1];
        await this._storageService.deleteFile(imagesName, folder);
        await this._service.deleteImagePacakge(deleteImage, packageId);
      }
    }

    if (postImages) {
      // push image in array
      let images = [];
      // check image hanya 1 file
      if (!postImages.length) {
        images.push(postImages);
      } else {
        // image hanya lebih 1 dari file
        images = postImages;
      }

      // validation file image
      for (const img of images) {
        this._validator.validateImageHeaderSchema(img.hapi.headers);
      }

      for (const img of images) {
        if (img.hapi.filename) {
          // save image in server
          const filename = await this._storageService.writeFile(
            img,
            img.hapi,
            folder
          );
          let linkImage = `/images/${folder}/${filename}`;
          // save link image in db
          await this._service.addImagePackageService(packageId, linkImage);
        }
      }
    }

    await this._logActivityService.postLogActivity({
      credentialUserId,
      activity: "edit image package service",
      refersId: packageId,
    });

    return {
      status: "success",
      message: "Berhasil update image package",
    };
  }
}

module.exports = PackageServiceHandler;
