const InvariantError = require("../../exceptions/InvariantError");
const AuthorizationUser = require('../../../config/authorization.json');
const NotFoundError = require("../../exceptions/NotFoundError");
const { MappingImageProductForUser } = require("../../utils/MappingResultDB");


class ProductsHandler {
  constructor({
    lock,
    service,
    logActivityService,
    validator,
    storageService,
    authorizationService,
    categoryService
  }) {
    this._lock = lock;
    this._service = service;
    this._logActivityService = logActivityService;
    this._validator = validator;
    this._storageService = storageService;
    this._authorizationService = authorizationService;
    this._categoryService = categoryService;
    this._authorizationUser = AuthorizationUser.product;

    this.postProductHandler = this.postProductHandler.bind(this);
    this.getProductsHandler = this.getProductsHandler.bind(this);
    this.getProductsByIdHandler = this.getProductsByIdHandler.bind(this);
    this.putProductsByIdHandler = this.putProductsByIdHandler.bind(this);
    this.putStatusProductsByIdHandler = this.putStatusProductsByIdHandler.bind(
      this
    );
    this.putSaleProductsByIdHandler = this.putSaleProductsByIdHandler.bind(this);
    this.putImageProductsHandler = this.putImageProductsHandler.bind(this);
    this.deleteProductByIdHandler = this.deleteProductByIdHandler.bind(this);
    this.putPricePromotionProductByIdHandler = this.putPricePromotionProductByIdHandler.bind(this);
    this.getProductsSaleOrServiceHandler = this.getProductsSaleOrServiceHandler.bind(this);
    this.getProductsByIdForUserHandler = this.getProductsByIdForUserHandler.bind(this);
  }

  async postProductHandler(request, h) {
    this._validator.validatePostProductPayload(request.payload);

    const { id: credentialUserId } = request.auth.credentials;
    const { name, price, typeProduct, image, description, categoryId, sale, sparepart, feeReplacementId } = request.payload;
    if (sparepart == 'true' || sparepart == true) this._validator.validateFeeReplacementPayloadSchema({ feeReplacementId });

    await this._lock.acquire("data", async () => {
      await this._authorizationService.checkRoleUser(
        credentialUserId,
        this._authorizationUser['insert product']
      );

      let images = [];
      if (image) {
        // push image in array
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
      }

      await this._service.checkNameProduct(name);
      const resultProductId = await this._service.addProduct({
        credentialUserId,
        name,
        price,
        typeProduct,
        description,
        categoryId,
        sale,
        sparepart,
        feeReplacementId
      });

      if (image) {
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
      }

      await this._logActivityService.postLogActivity({
        credentialUserId,
        activity: "menambahkan product",
        refersId: resultProductId,
      });
    });

    return {
      status: "success",
      message: "Berhasil menambahkan product",
    };
  }

  async getProductsHandler(request) {
    const { page, limit, search_query } = request.query;

    const search = search_query ? search_query : "";
    const totalData = parseInt(
      await this._service.getCountProductsSearch(search)
    );
    const limitPage = limit || 10;
    const pages = parseInt(page) || 1;
    const totalPage = Math.ceil(totalData / limitPage);
    const offset = (pages - 1) * limitPage;
    const products = await this._service.getProductsSearch({
      search,
      limit: limitPage,
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
    const { parentName } = await this._categoryService.getCategoryByIdForProduct(product.category_id)
    product.categoryParentName = parentName;
    product.no_wa = '+62 877 8298 7067';

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
    this._validator.validatePutProductPayload(request.payload);

    const { id: credentialUserId } = request.auth.credentials;
    const { id: productId } = request.params;
    const { name, price, typeProduct, description, categoryId, sale, sparepart, feeReplacementId } = request.payload;
    if (sparepart == 'true' || sparepart == true) this._validator.validateFeeReplacementPayloadSchema({ feeReplacementId });

    await this._lock.acquire("data", async () => {
      await this._authorizationService.checkRoleUser(
        credentialUserId,
        this._authorizationUser["update product"]
      );

      await this._service.editProductsById({
        credentialUserId,
        productId,
        name,
        price,
        typeProduct,
        description,
        categoryId,
        sale,
        sparepart,
        feeReplacementId
      });

      await this._logActivityService.postLogActivity({
        credentialUserId,
        activity: "update data product",
        refersId: productId,
      });
    });

    return {
      status: "success",
      message: "Berhasil update data product",
    };
  }

  async putStatusProductsByIdHandler(request) {
    this._validator.validatePutStatusProductPayload(request.payload);

    const { id: credentialUserId } = request.auth.credentials;
    const { id: productId } = request.params;
    const { status } = request.payload;

    await this._lock.acquire("data", async () => {
      await this._authorizationService.checkRoleUser(
        credentialUserId,
        this._authorizationUser["update status product"]
      );

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
    });

    return {
      status: "success",
      message: "Berhasil update data product",
    };
  }

  async putSaleProductsByIdHandler(request) {
    this._validator.validatePutSaleProductPayload(request.payload);

    const { id: credentialUserId } = request.auth.credentials;
    const { id: productId } = request.params;
    const { sale } = request.payload;

    await this._lock.acquire("data", async () => {
      await this._authorizationService.checkRoleUser(
        credentialUserId,
        this._authorizationUser["update product"]
      );

      await this._service.editSaleProductById({
        credentialUserId,
        productId,
        sale,
      });

      await this._logActivityService.postLogActivity({
        credentialUserId,
        activity: `update status sale product menjadi ${sale}`,
        refersId: productId,
      });
    });

    return {
      status: "success",
      message: "Berhasil update status sale product",
    };
  }

  async putImageProductsHandler(request) {
    this._validator.validatePutIamgesProductPayload(request.payload);

    const { id: credentialUserId } = request.auth.credentials;
    const { id: productId } = request.params;
    const { deleteImages, postImages } = request.payload;
    const folder = "products";

    await this._lock.acquire("data", async () => {
      await this._authorizationService.checkRoleUser(
        credentialUserId,
        this._authorizationUser['update product']
      );

      let imageProductsId = await this._service.getImageProducts(productId);

      if (deleteImages) {
        const deleImagesArray = JSON.parse(deleteImages);
        imageProductsId = imageProductsId.filter((item) => {
          return !deleImagesArray.includes(item);
        });
      }

      const countPostImage = postImages ? postImages.length || 1 : 0;
      if (countPostImage + imageProductsId.length > 3)
        throw new InvariantError(
          "Crush upload dan delete sebelumnya, image lebih dari 3"
        );

      let images = [];
      if (postImages) {
        // push image in array
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
      }

      if (postImages) {
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

      if (deleteImages) {
        const deleImagesArray = JSON.parse(deleteImages);
        for (let deleteImage of deleImagesArray) {
          let imagesName = await this._service.getImageProductsName(
            deleteImage
          );

          if (imagesName) {
            imagesName = imagesName.split("/");
            imagesName = imagesName[imagesName.length - 1];
            await this._storageService.deleteFile(imagesName, folder);
            await this._service.deleteImageProduct(deleteImage, productId);
          }
        }
      }

      await this._logActivityService.postLogActivity({
        credentialUserId,
        activity: "edit image product",
        refersId: productId,
      });
    });

    return {
      status: "success",
      message: "Berhasil update image product",
    };
  }

  async deleteProductByIdHandler(request) {
    const { id: credentialUserId } = request.auth.credentials;
    const { productId } = request.params;
    const folder = "products";

    await this._lock.acquire("data", async () => {
      const images = await this._service.getImageProducts(productId);
      await this._service.deleteProductById(productId);

      await this._logActivityService.postLogActivity({
        credentialUserId,
        activity: "delete product",
        refersId: productId,
      });

      images.map(async (image) => {
        if (image.link) {
          image = image.link;
          let imageName = image.split("/");
          imageName = imageName[imageName.length - 1];
          await this._storageService.deleteFile(imageName, folder);
        }
      });
    });

    return {
      status: "success",
      message: "Berhasil menghapus data product",
    };
  }

  async putPricePromotionProductByIdHandler(request) {
    this._validator.validatePutPricePromotionProductPayload(request.payload);
    const { id: credentialUserId } = request.auth.credentials;
    const { productId } = request.params;
    request.payload.productId = productId;

    await this._lock.acquire("data", async () => {
      await this._service.updatePricePromotionProductById(request.payload);

      await this._logActivityService.postLogActivity({
        credentialUserId,
        activity: "update price promotion product",
        refersId: productId,
      });
    });

    return {
      status: "success",
      message: "Berhasil update price promotion product",
    };
  }

  async getProductsSaleOrServiceHandler(request) {
    const { param } = request.params;
    const { page, limit } = request.query;

    const limitPage = limit || 10;
    const pages = parseInt(page) || 1;
    const offset = (pages - 1) * limitPage;

    let products;
    let totalData;
    let totalPage;

    switch (param) {
      case 'sale':
        totalData = parseInt(
          await this._service.getCountProductsSaleOrService('sale')
        );
        totalPage = Math.ceil(totalData / limitPage);

        products = await this._service.getProductsSaleOrService({ param: 'sale', limit: limitPage, offset });
        break;
      case 'sparepart':
        totalData = parseInt(
          await this._service.getCountProductsSaleOrService('sparepart')
        );
        totalPage = Math.ceil(totalData / limitPage);

        products = await this._service.getProductsSaleOrService({ param: 'sparepart', limit: limitPage, offset });
        break;
      default:
        throw new NotFoundError('Param tidak tersedia')
    }

    return {
      status: 'success',
      data: { products },
      totalData,
      totalPage,
      nextPage: pages + 1,
      previousPage: pages - 1,
    }
  }

  async getProductsByIdForUserHandler(request) {
    const { id: productId } = request.params;

    const product = await this._service.getProductsById(productId);
    const { parentName } = await this._categoryService.getCategoryByIdForProduct(product.category_id)
    product.categoryParentName = parentName;
    product.no_wa = '+62 877 8298 7067';

    const linkimageProducts = await this._service.getImageProducts(productId);
    const imageProducts = linkimageProducts.map(MappingImageProductForUser);

    return {
      status: "success",
      data: {
        product,
        imageProducts,
      },
    };
  }
}

module.exports = ProductsHandler;
