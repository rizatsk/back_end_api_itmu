const InvariantError = require("../../exceptions/InvariantError");

class ProductsHandler {
  constructor({ service, logActivityService, validator, storageService }) {
    this._service = service;
    this._logActivityService = logActivityService;
    this._validator = validator;
    this._storageService = storageService;

    this.postProductHandler = this.postProductHandler.bind(this);
    this.getProductsHandler = this.getProductsHandler.bind(this);
    this.getProductsByIdHandler = this.getProductsByIdHandler.bind(this);
    this.putProductsByIdHandler = this.putProductsByIdHandler.bind(this);
    this.putStatusProductsByIdHandler =
      this.putStatusProductsByIdHandler.bind(this);
    this.putImageProductsHandler = this.putImageProductsHandler.bind(this);
  }

  async postProductHandler(request, h) {
    await this._validator.validatePostProductPayload(request.payload);

    const { id: credentialUserId } = request.auth.credentials;
    const { name, price, typeProduct, image } = request.payload;

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

    await this._service.checkNameProduct(name);
    const resultProductId = await this._service.addProduct({
      credentialUserId,
      name,
      price,
      typeProduct,
    });

    const folder = "products";
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
        await this._service.addImageProduct(resultProductId, linkImage);
      }
    }

    await this._logActivityService.postLogActivity({
      credentialUserId,
      activity: "menambahkan product",
      refersId: resultProductId,
    });

    return {
      status: "success",
      message: "Berhasil menambahkan product",
    };
  }

  async getProductsHandler(request) {
    const { page, limit, search_query } = request.query;

    const totalData = parseInt(
      await this._service.getCountProductsSearch(search_query)
    );
    const limitPage = limit || 10;
    const pages = parseInt(page) || 1;
    const totalPage = Math.ceil(totalData / limitPage);
    const offset = (pages - 1) * limitPage;
    let products;
    products = await this._service.getProductsSearch({
      search_query,
      limit,
      offset,
    });

    return {
      status: "success",
      data: {
        products,
      },
      totalData,
      totalPage,
      nextPage: pages + 1,
      previousPage: pages - 1,
    };
  }

  async getProductsByIdHandler(request) {
    const { id: productId } = request.params;

    const product = await this._service.getProductsById(productId);
    const imageProduct = await this._service.getImageProducts(productId);

    return {
      status: "success",
      data: {
        product,
        imageProduct,
      },
    };
  }

  async putProductsByIdHandler(request) {
    await this._validator.validatePutProductPayload(request.payload);

    const { id: credentialUserId } = request.auth.credentials;
    const { id: productId } = request.params;
    const { name, price, typeProduct } = request.payload;

    await this._service.editProductsById({
      credentialUserId,
      productId,
      name,
      price,
      typeProduct,
    });

    await this._logActivityService.postLogActivity({
      credentialUserId,
      activity: "update data product",
      refersId: productId,
    });

    return {
      status: "success",
      message: "Berhasil update data product",
    };
  }

  async putStatusProductsByIdHandler(request) {
    await this._validator.validatePutStatusProductPayload(request.payload);

    const { id: credentialUserId } = request.auth.credentials;
    const { id: productId } = request.params;
    const { status } = request.payload;

    await this._service.editStatusProductsById({
      credentialUserId,
      productId,
      status,
    });

    await this._logActivityService.postLogActivity({
      credentialUserId,
      activity: `update status product menjadi ${status}`,
      refersId: productId,
    });

    return {
      status: "success",
      message: "Berhasil update data product",
    };
  }

  async putImageProductsHandler(request) {
    await this._validator.validatePutIamgesProductPayload(request.payload);

    const { id: credentialUserId } = request.auth.credentials;
    const { id: productId } = request.params;
    const { deleteImages, postImages } = request.payload;

    const folder = "products";
    if (deleteImages) {
      const imagesName = await this._service.getImageProductsName(deleteImages);
      imagesName.map(async (image) => {
        let imageName = image.link;
        imageName = imageName.split("/");
        imageName = imageName[imageName.length - 1];
        await this._storageService.deleteFile(imageName, folder);
      });
      await this._service.deleteImageProduct(deleteImages, productId);
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
          await this._service.addImageProduct(productId, linkImage);
        }
      }
    }

    await this._logActivityService.postLogActivity({
      credentialUserId,
      activity: "edit image product",
      refersId: productId,
    });

    return {
      status: "success",
    };
  }
}

module.exports = ProductsHandler;
