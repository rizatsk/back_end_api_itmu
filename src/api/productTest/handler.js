class ProductTestHandler {
    constructor({ lock, service, storageService, validator }) {
        this._lock = lock;
        this._service = service;
        this._storageService = storageService;
        this._validator = validator;

        this.postProductTestHandler = this.postProductTestHandler.bind(this);
        this.getProductsTestHandler = this.getProductsTestHandler.bind(this);
        this.getProductsByIdHandler = this.getProductsByIdHandler.bind(this);
        this.putProductByIdHandler = this.putProductByIdHandler.bind(this);
        this.deleteProductByIdHandler = this.deleteProductByIdHandler.bind(this);
    }

    async postProductTestHandler(request) {
        this._validator.validatePostProductPayload(request.payload);

        await this._lock.acquire("data", async () => {
            await this._service.checkNameProduct(request.payload.name);

            const { foto_product } = request.payload;

            this._validator.validateImageHeaderSchema(foto_product.hapi.headers);

            const folder = "products_test"
            const filename = await this._storageService.writeFile(
                foto_product,
                foto_product.hapi,
                folder
            );
            request.payload.foto_product = `/images/${folder}/${filename}`;

            await this._service.addProduct(request.payload);
        });

        return {
            status: 'success',
            message: 'Success add product'
        }
    }

    async getProductsTestHandler(request) {
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

        return {
            status: "success",
            data: {
                product,
            },
        };
    }

    async putProductByIdHandler(request) {
        this._validator.validatePutProductPayload(request.payload);

        try {
            await this._lock.acquire("data", async () => {
                const { id: productId } = request.params;
                const { foto_product } = request.payload;

                if (foto_product) {
                    this._validator.validateImageHeaderSchema(foto_product.hapi?.headers);

                    // Delete old foto image
                    const folder = "products_test"
                    const oldFotoProduct = await this._service.getFotoProductById(productId);
                    let oldFotoProductName = oldFotoProduct.split("/");
                    oldFotoProductName = oldFotoProductName[oldFotoProductName.length - 1];
                    await this._storageService.deleteFile(oldFotoProductName, folder);


                    const filename = await this._storageService.writeFile(
                        foto_product,
                        foto_product.hapi,
                        folder
                    );
                    request.payload.foto_product = `/images/${folder}/${filename}`;
                }

                request.payload.productId = productId;
                await this._service.editProductsById(request.payload);
            });
        } catch (error) {
            console.log(error)
            return 'error'
        }

        return {
            status: 'success',
            message: 'Succes update product'
        }
    }

    async deleteProductByIdHandler(request) {
        const { id: productId } = request.params;

        await this._lock.acquire("data", async () => {
            // Delete image in server
            const folder = "products_test"
            const oldFotoProduct = await this._service.getFotoProductById(productId);
            let oldFotoProductName = oldFotoProduct.split("/");
            oldFotoProductName = oldFotoProductName[oldFotoProductName.length - 1];
            await this._storageService.deleteFile(oldFotoProductName, folder);

            // Delete in database
            await this._service.deleteProductById(productId)
        });

        return {
            status: "success",
            message: "Success delete product"
        };
    }
}

module.exports = ProductTestHandler;